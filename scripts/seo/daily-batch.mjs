// Codzienna porcja do 10 adresów (S18, docs/SEO-AUTOMAT.md): wylicza adresy dnia, zapisuje treść zgłoszenia
// i wysyła te same adresy do IndexNow (Bing). Google dostaje je z listy do odhaczenia w zgłoszeniu.
//
// Użycie: node scripts/seo/daily-batch.mjs --out-dir <katalog> [--date RRRR-MM-DD] [--done <plik>] [--dry-run]
// Wynik w katalogu: batch.txt (adresy), issue.md (treść), title.txt (tytuł). Odhaczone adresy: ze zgłoszeń z etykietą
// seo-dzien (gh issue list), chyba że podano --done. Błąd IndexNow lub sieci → ::warning::, kod 0 (nigdy czerwony przebieg).
import { execFile } from 'node:child_process';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs, promisify } from 'node:util';
import { fetchSitemap, findKey, keyIsLive, submit } from './indexnow.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const run = promisify(execFile);
const warn = (msg) => console.log(`::warning::SEO lista dnia: ${msg}`);

/** Treści wszystkich zgłoszeń seo-dzien (otwartych i zamkniętych). Brak gh lub błąd → pusta lista + ostrzeżenie. */
async function issueBodies(label) {
  try {
    const { stdout } = await run('gh', ['issue', 'list', '--label', label, '--state', 'all', '--limit', '1000', '--json', 'body']);
    return JSON.parse(stdout).map((i) => i.body ?? '');
  } catch (err) {
    warn(`nie udało się odczytać dotychczasowych zgłoszeń (${err.message}); lista bez odhaczeń.`);
    return [];
  }
}

/** Wysyła porcję do IndexNow; każdy błąd to ostrzeżenie. */
async function sendIndexNow(urls, siteUrl) {
  if (urls.length === 0) return 'brak adresów';
  try {
    const key = await findKey();
    if (!(await keyIsLive(siteUrl, key, globalThis.fetch))) return 'plik klucza niedostępny';
    const code = await submit(urls, { key, host: new URL(siteUrl).host, siteUrl, fetch: globalThis.fetch });
    return `HTTP ${code}`;
  } catch (err) {
    warn(`IndexNow: ${err.message}`);
    return 'błąd';
  }
}

async function main() {
  const { values: args } = parseArgs({
    options: {
      'out-dir': { type: 'string' },
      date: { type: 'string' },
      done: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
    },
  });
  if (!args['out-dir']) throw new Error('brak --out-dir');
  const date = args.date ?? new Date().toISOString().slice(0, 10);
  const { createServer } = await import('vite');
  const vite = await createServer({ root, configFile: false, logLevel: 'error', appType: 'custom', server: { middlewareMode: true } });
  try {
    const sm = await vite.ssrLoadModule('/src/core/seo/sitemap-diff.ts');
    const db = await vite.ssrLoadModule('/src/core/seo/daily-batch.ts');
    const { SITE_URL } = await vite.ssrLoadModule('/src/core/seo/site.ts');

    let urls = [];
    try {
      urls = sm.allUrls(await fetchSitemap(SITE_URL, sm.sitemapLocs));
    } catch (err) {
      warn(`nie udało się pobrać mapy strony (${err.message}); lista dnia pusta.`);
    }
    const bodies = args.done ? [await readFile(args.done, 'utf8')] : await issueBodies(db.DAILY_LABEL);
    const done = bodies.flatMap((b) => db.parseCheckedUrls(b));
    const batch = db.pickDailyBatch({ urls, done, date });

    const out = args['out-dir'];
    await mkdir(out, { recursive: true });
    await writeFile(path.join(out, 'batch.txt'), batch.join('\n') + (batch.length ? '\n' : ''));
    await writeFile(path.join(out, 'issue.md'), db.renderIssueBody(batch, date));
    await writeFile(path.join(out, 'title.txt'), db.issueTitle(date));

    const bing = args['dry-run'] ? 'dry-run' : await sendIndexNow(batch, SITE_URL);
    const line = `Lista dnia ${date}: ${batch.length} adresów (w mapie ${urls.length}, odhaczonych ${new Set(done).size}); IndexNow: ${bing}.`;
    console.log(line);
    if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `${line}\n`);
  } finally {
    await vite.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
