// Robot „Nowe dane GUS” (W26-F05, docs/KONCEPT-ODKRYCIA.md §7). Strona `/nowe-dane/<wskaźnik>-<rok>` powstaje
// tylko po scaleniu PR robota: robot dopisuje pozycję do public/data/news.json na osobnej gałęzi
// `robot/nowe-dane-<id>-<rok>` (bez auto-scalania), a generator stron (scripts/seo/build-pages.mjs) buduje
// stronę z public/data/values. Logika w src/core/facts/news.ts (ładowana przez Vite, jak build-facts.mjs).
// Użycie:
//   node scripts/data/build-news.mjs detect [--base origin/main]   → wiersze „<id> <rok>” z nowym rokiem (bez już zatwierdzonych)
//   node scripts/data/build-news.mjs add <id> <rok>                 → dopisuje pozycję do public/data/news.json, wypisuje opis PR (Markdown)
//   node scripts/data/build-news.mjs calendar [--lib library]       → public/data/calendar.json (W30-D10; czyta tylko generator stron)
//   node scripts/data/build-news.mjs peaks                       → szczyty kalendarza tematów za 2–4 tygodnie (podsumowanie przebiegu)
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';

const root = path.resolve(import.meta.dirname, '../..');
const dataDir = path.join(root, 'public/data');
const NEWS_FILE = path.join(dataDir, 'news.json');
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const [mode, ...rest] = process.argv.slice(2);
const baseArg = rest.indexOf('--base');
const base = baseArg >= 0 ? rest[baseArg + 1] : 'origin/main';

/** Lata wskaźnika w wersji `ref` (git show); brak pliku = null. */
function yearsAt(ref, id) {
  try {
    const text = execFileSync('git', ['show', `${ref}:public/data/values/${id}.json`], { cwd: root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    return JSON.parse(text).years;
  } catch {
    return undefined;
  }
}

async function readNews() {
  try {
    const file = await readJson(NEWS_FILE);
    return Array.isArray(file.items) ? file.items : [];
  } catch {
    return [];
  }
}

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
  const news = await vite.ssrLoadModule('/src/core/facts/news.ts');
  const config = await readJson(path.join(root, 'config/facts.json'));

  if (mode === 'peaks') {
    const { upcomingPeaks } = await vite.ssrLoadModule('/src/core/facts/calendar.ts');
    for (const p of upcomingPeaks(config, new Date())) console.log(`- ${p.on} (za ${p.inDays} dni): ${p.label} – odśwież stronę tematu „${p.group}”.`);
  } else if (mode === 'calendar') {
    // W30-D10: public/data/calendar.json (≤ 5 KB, bez wcięć) z księgi library/calendar.json; brak księgi = puste kalendarium.
    const pub = await vite.ssrLoadModule('/src/core/facts/calendar-public.ts');
    const libArg = rest.indexOf('--lib');
    const lib = path.resolve(libArg >= 0 ? rest[libArg + 1] : path.join(root, 'library'));
    const calendar = pub.buildPublicCalendar({
      today: new Date().toISOString().slice(0, 10),
      ledger: await readJson(path.join(lib, 'calendar.json')).catch(() => null),
      available: await readJson(path.join(lib, 'available.json')).catch(() => null),
      fresh: await readJson(path.join(dataDir, 'facts/fresh.json')).catch(() => ({})),
      indicators: await readJson(path.join(root, 'config/indicators.json')),
    });
    const json = pub.serializeCalendar(calendar);
    await writeFile(path.join(dataDir, 'calendar.json'), `${json}\n`, 'utf8');
    console.log(`Kalendarium: ${calendar.planned.length} zaplanowanych, ${calendar.done.length} pobranych, ${json.length} znaków.`);
  } else {
    await detectOrAdd(news, config);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await vite.close();
}

async function detectOrAdd(news, config) {
  const indicators = await readJson(path.join(root, 'config/indicators.json'));
  const units = await readJson(path.join(dataDir, 'units.json'));
  const lists = await readJson(path.join(root, 'config/lists.json'));
  const values = {};
  for (const ind of indicators) values[ind.id] = await readJson(path.join(dataDir, 'values', `${ind.id}.json`)).catch(() => undefined);
  const { buildUnitPaths } = await vite.ssrLoadModule('/src/core/seo/slug.ts');
  const { rankingHeadings } = await vite.ssrLoadModule('/src/core/seo/ranking-template.ts');
  const ctx = {
    units,
    paths: buildUnitPaths(units),
    headings: rankingHeadings(units),
    indicators,
    values,
    gminaMinPopulation: lists.gminaMinPopulation,
    relativeChangeUnits: config.relativeChangeUnits,
    boundaryJump: config.news?.boundaryJump ?? config.thresholds.boundaryJump,
    recordMinYears: config.thresholds.recordMinYears,
    rows: config.news?.rows ?? 10,
  };
  const approved = new Set((await readNews()).map(news.newsSlug));

  if (mode === 'detect') {
    const before = Object.fromEntries(indicators.map((i) => [i.id, yearsAt(base, i.id)]));
    const after = Object.fromEntries(indicators.filter((i) => values[i.id]).map((i) => [i.id, values[i.id].years]));
    for (const e of news.newYears(before, after)) {
      // Tylko wtedy, gdy z danych wychodzi strona (rok ma dane i rok wcześniej) i nie ma jej jeszcze na main.
      if (!approved.has(news.newsSlug(e)) && news.buildNewsPage(e, ctx)) console.log(`${e.id} ${e.year}`);
    }
  } else if (mode === 'add') {
    const entry = { id: rest[0], year: Number(rest[1]) };
    const page = news.buildNewsPage(entry, ctx);
    if (!page) throw new Error(`Brak danych do strony ${entry.id} ${entry.year}.`);
    const items = (await readNews()).filter((e) => news.newsSlug(e) !== news.newsSlug(entry));
    items.push(entry);
    items.sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));
    const $opis = 'Zatwierdzone strony „Nowe dane GUS” (W26-F05). Pozycje dopisuje robot w osobnym PR; strona /nowe-dane/<id>-<rok> powstaje po scaleniu.';
    await writeFile(NEWS_FILE, `${JSON.stringify({ $opis, items }, null, 2)}\n`, 'utf8');
    const row = (r) => `| ${r.name} | ${r.change} | ${r.value} |`;
    const table = (title, rows) => (rows.length ? [`**${title}**`, '', '| Miejsce | Zmiana | Wartość |', '|---|---|---|', ...rows.slice(0, 5).map(row), ''] : []);
    console.log(
      [
        `Robot wykrył nowy rok wskaźnika i przygotował stronę **${page.path}** („${page.h1}”).`,
        '',
        ...page.lead.map((s) => `> ${s}`),
        '',
        ...table('Największe wzrosty', page.rises),
        ...table('Największe spadki', page.falls),
        ...table('Rekordy serii', page.records),
        'Przed scaleniem: obejrzyj stronę na podglądzie Vercel i sprawdź 2–3 liczby w bdl.stat.gov.pl.',
        'Ta gałąź zawiera też nowe wartości z PR robota z danymi – scal najpierw tamten PR (albo ten, jeśli tamten już scalony). Nic nie scala się samo.',
      ].join('\n'),
    );
  } else {
    throw new Error('Użycie: build-news.mjs detect [--base <ref>] | add <id> <rok> | peaks | calendar [--lib <katalog>]');
  }
}
