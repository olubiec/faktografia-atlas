// Robot faktów (W26-F01, docs/KONCEPT-ODKRYCIA.md §9): public/data/values + units → public/data/facts/<WW>.json
// i public/data/facts-start.json. W26-F03: sąsiedzi z public/geo/admin.topo.json (F3, pole near) i bliźniak (F8, pole twins). Logika w src/core/facts (TS) – ładowana przez Vite (ssrLoadModule),
// tak jak generator stron scripts/seo/build-pages.mjs; bez nowych pakietów.
// Użycie: node scripts/data/build-facts.mjs [--report docs/research/F01-przeglad-faktow.md]
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';
import { factsFromValues } from './premieres.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const dataDir = path.join(root, 'public/data');
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const reportArg = process.argv.indexOf('--report');
const reportPath = reportArg > 0 ? path.resolve(root, process.argv[reportArg + 1]) : null;

// Plik z gałęzi data/library (git show po `git fetch origin data/library`, bez API BDL); brak gałęzi albo pliku = null.
const LIBRARY_REF = process.env.LIBRARY_REF || 'origin/data/library';
const readLibraryFile = (rel) => {
  try {
    const text = execFileSync('git', ['show', `${LIBRARY_REF}:library/${rel}`], { cwd: root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const vite = await createServer({
  root,
  configFile: false,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, watch: null },
  resolve: { alias: { '@': path.join(root, 'src') } },
  optimizeDeps: { noDiscovery: true, include: [] },
});

try {
  const { buildFacts, buildShards } = await vite.ssrLoadModule('/src/core/facts/build.ts');
  const { buildStart } = await vite.ssrLoadModule('/src/core/facts/start.ts');
  const { updateLedger, freshYears } = await vite.ssrLoadModule('/src/core/facts/fresh.ts');
  const { newMainYears, labelDaysOf } = await vite.ssrLoadModule('/src/core/facts/fresh-label.ts');
  const { prepareLibraryFresh, buildLibraryFacts } = await vite.ssrLoadModule('/src/core/facts/library-fresh.ts');
  const { ringsFromTopology } = await vite.ssrLoadModule('/src/core/facts/neighbours.ts');

  const config = await readJson(path.join(root, 'config/facts.json'));
  const indicators = await readJson(path.join(root, 'config/indicators.json'));
  const units = await readJson(path.join(dataDir, 'units.json'));
  const values = {};
  // Znacznik czasu z danych (najnowsze fetchedAt), nie z zegara: te same dane = ten sam plik.
  let generatedAt = '1970-01-01T00:00:00.000Z';
  for (const ind of indicators) {
    try {
      values[ind.id] = await readJson(path.join(dataDir, 'values', `${ind.id}.json`));
      if (values[ind.id].fetchedAt > generatedAt) generatedAt = values[ind.id].fetchedAt;
    } catch {
      // Brak pliku wskaźnika – pomijamy (fakty powstaną z pozostałych).
    }
  }

  // Sąsiedztwo liczy robot (wspólne łuki granic), strona dostaje gotowe pierścienie w plikach faktów.
  const topology = await readJson(path.join(root, 'public/geo/admin.topo.json'));
  const neighbours = ringsFromTopology(topology, config.neighbours?.min ?? 4);
  // Księga świeżości (W27-D02): nowy rok wskaźnika = świeże dane przez config.fresh.days. Brak pliku = pierwsze uruchomienie.
  const outDir = path.join(dataDir, 'facts');
  await mkdir(outDir, { recursive: true });
  const ledgerPath = path.join(outDir, 'fresh.json');
  const prevLedger = await readJson(ledgerPath).catch(() => null);
  const freshDays = config.fresh?.days ?? 0;
  const ledger = updateLedger(prevLedger, values, generatedAt, freshDays);
  await writeFile(ledgerPath, `${JSON.stringify(ledger, null, 1)}\n`, 'utf8');
  const fresh = freshYears(ledger, generatedAt, freshDays);
  console.log(`facts/fresh.json: ${Object.keys(fresh).length} świeżych wskaźników z ${Object.keys(ledger).length}`);
  const factsInput = { indicators, values, units, config, neighbours, fresh };
  const build = buildFacts(factsInput);
  // Premiery z biblioteki (W29-D09): świeże, nieniszowe zmienne z księgi kalendarium → osobny build, tylko do Odkrycia dnia i zestawień.
  // Pliki województw (shards) powstają wyłącznie z `build`, więc „3 rzeczy” w profilach się nie zmieniają. Brak gałęzi lub księgi = bez zmian.
  const available = readLibraryFile('available.json');
  const libFresh = prepareLibraryFresh({
    calendar: readLibraryFile('calendar.json'),
    available,
    readValues: (id) => readLibraryFile(`values/${id}.json`),
    units,
    generatedAt,
    config,
    isNiche: (id, raw, v) => factsFromValues(raw, { unit: v.u, name: v.n }).niche,
  });
  const libBuild = buildLibraryFacts(factsInput, libFresh);
  console.log(`biblioteka w Odkryciach: ${libFresh.indicators.map((i) => i.id).join(', ') || 'brak'}`);
  if (libFresh.droppedUnits.length) console.log(`  pominięte (jednostka bez poprawnego zdania): ${libFresh.droppedUnits.map((d) => `${d.id} [${d.unit}]`).join(', ')}`);
  // Etykieta „Nowość” (W28-D06): wskaźniki z nowym rokiem sprzed najwyżej fresh.labelDays dni.
  const newYears = newMainYears(ledger, generatedAt, labelDaysOf(config));
  const shards = buildShards(build, generatedAt, newYears);
  for (const [woj, shard] of Object.entries(shards)) {
    const json = JSON.stringify(shard);
    await writeFile(path.join(outDir, `${woj}.json`), json, 'utf8');
    console.log(`facts/${woj}.json: ${Object.keys(shard.units).length} jednostek, ${json.length} B`);
  }
  const start = JSON.stringify(buildStart(build, generatedAt, newYears, libBuild));
  await writeFile(path.join(dataDir, 'facts-start.json'), start, 'utf8');
  console.log(`facts-start.json: ${start.length} B`);

  const short = [...build.byUnit.entries()].filter(([, f]) => f.selected.length < config.selection.count);
  if (short.length) throw new Error(`Jednostki z mniej niż ${config.selection.count} faktami: ${short.map(([t]) => t).join(', ')}`);

  if (reportPath) {
    const { renderReport } = await vite.ssrLoadModule('/src/core/facts/report.ts');
    await writeFile(reportPath, renderReport(build, shards, start.length), 'utf8');
    console.log(`Raport: ${path.relative(root, reportPath)}`);
  }
} finally {
  await vite.close();
}
