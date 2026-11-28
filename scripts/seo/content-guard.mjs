// Strażnik treści (S16): kontrola stron po wdrożeniu i raz na dobę.
// Użycie: node scripts/seo/content-guard.mjs --dir dist | --live https://faktografia.eu
// Kod 1 = są problemy. Błąd sieci = ostrzeżenie (::warning::) i kod 0 (bez fałszywych alarmów).
// Raport w formacie Markdown trafia też do pliku z --report (dla zgłoszenia w GitHubie).
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { createServer } from 'vite';

const root = path.resolve(import.meta.dirname, '../..');
const { values: args } = parseArgs({
  options: { dir: { type: 'string' }, live: { type: 'string' }, report: { type: 'string' } },
});
if (!args.dir && !args.live) {
  console.error('Podaj --dir <katalog> albo --live <adres>.');
  process.exit(2);
}

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

const vite = await createServer({ root, configFile: false, logLevel: 'error', appType: 'custom', server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true, entries: [] } });
let found = [];
try {
  const { guardHtml, guardLive } = await vite.ssrLoadModule('/src/core/seo/content-guard.ts');
  if (args.dir) {
    for await (const file of htmlFiles(path.resolve(args.dir))) {
      // 404.html i strony z noindex z założenia nie są w mapie strony, więc nie sprawdzamy ich pod kątem noindex
      for (const problem of guardHtml(await readFile(file, 'utf8'))) found.push({ url: path.relative(args.dir, file), problem });
    }
  } else {
    const result = await guardLive(args.live.replace(/\/+$/, ''), fetch);
    if (result.networkError) {
      console.log(`::warning::Strażnik treści: błąd sieci (${result.networkError}); nie sprawdzono produkcji.`);
      process.exit(0);
    }
    console.log(`Sprawdzono stron: ${result.checked}.`);
    found = result.problems;
  }
} finally {
  await vite.close();
}

const lines = found.map(({ url, problem }) => `- [${problem.code}] ${url}: ${problem.detail}`);
if (args.report) await writeFile(args.report, lines.length ? `${lines.slice(0, 100).join('\n')}${lines.length > 100 ? `\n… i ${lines.length - 100} kolejnych` : ''}\n` : '');
console.log(lines.length ? `Problemy (${lines.length}):\n${lines.join('\n')}` : 'Strażnik treści: bez uwag.');
process.exit(lines.length ? 1 : 0);
