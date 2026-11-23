// Robot faktów (W26-F01, docs/KONCEPT-ODKRYCIA.md §9): public/data/values + units → public/data/facts/<WW>.json
// i public/data/facts-start.json. W26-F03: sąsiedzi z public/geo/admin.topo.json (F3, pole near) i bliźniak (F8, pole twins). Logika w src/core/facts (TS) – ładowana przez Vite (ssrLoadModule),
// tak jak generator stron scripts/seo/build-pages.mjs; bez nowych pakietów.
// Użycie: node scripts/data/build-facts.mjs [--report docs/research/F01-przeglad-faktow.md]
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';

const root = path.resolve(import.meta.dirname, '../..');
const dataDir = path.join(root, 'public/data');
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const reportArg = process.argv.indexOf('--report');
const reportPath = reportArg > 0 ? path.resolve(root, process.argv[reportArg + 1]) : null;

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
  const build = buildFacts({ indicators, values, units, config, neighbours });
  const shards = buildShards(build, generatedAt);
  const outDir = path.join(dataDir, 'facts');
  await mkdir(outDir, { recursive: true });
  for (const [woj, shard] of Object.entries(shards)) {
    const json = JSON.stringify(shard);
    await writeFile(path.join(outDir, `${woj}.json`), json, 'utf8');
    console.log(`facts/${woj}.json: ${Object.keys(shard.units).length} jednostek, ${json.length} B`);
  }
  const start = JSON.stringify(buildStart(build, generatedAt));
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
