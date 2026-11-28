// IndexNow po wdrożeniu produkcji (S11, docs/SEO.md §5): wysyła do Bing i wyszukiwarek partnerskich
// tylko adresy nowe lub ze zmienionym `lastmod`. Google nie obsługuje IndexNow – jemu wystarcza mapa strony.
//
// Użycie: node scripts/seo/indexnow.mjs --old <stara-migawka.xml> --out <nowa-migawka.xml>
// Stara migawka = mapa strony zapisana jako artefakt poprzedniego przebiegu workflow (stan produkcji
// sprzed tego wdrożenia). Nowa migawka = obecna mapa strony z produkcji (wszystkie pliki sklejone).
// Pierwszy przebieg (brak migawki) wysyła pełną listę adresów (S17); kolejne – tylko zmienione.
// Zadanie działa po wdrożeniu produkcji oraz raz na dobę (zapas). Błąd sieci lub odmowa IndexNow → ostrzeżenie (::warning::) i kod 0, nigdy czerwony przebieg.
import { readFile, readdir, writeFile, mkdir, appendFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const root = path.resolve(import.meta.dirname, '../..');
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const warn = (msg) => console.log(`::warning::IndexNow: ${msg}`);

async function readOptional(file) {
  if (!file) return null;
  try {
    return await readFile(file, 'utf8');
  } catch {
    return null;
  }
}

/** Klucz = nazwa jedynego pliku public/<32 znaki hex>.txt (publiczny z założenia protokołu IndexNow). */
async function findKey() {
  const files = (await readdir(path.join(root, 'public'))).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  if (files.length !== 1) throw new Error(`oczekiwano jednego pliku klucza w public/, jest ${files.length}`);
  return files[0].replace(/\.txt$/, '');
}

async function fetchText(url, fetch = globalThis.fetch) {
  const res = await fetch(url, { headers: { 'User-Agent': 'faktografia-atlas-indexnow' } });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
}

/** Cała mapa strony z produkcji: indeks + wszystkie wymienione w nim pliki, sklejone w jeden tekst. */
async function fetchSitemap(siteUrl, sitemapLocs, fetch = globalThis.fetch) {
  const index = await fetchText(`${siteUrl}/sitemap.xml`, fetch);
  const locs = sitemapLocs(index);
  // stary format (jeden plik urlset zamiast indeksu) też obsługujemy
  if (locs.length === 0) return index;
  const parts = [];
  for (const loc of locs) parts.push(await fetchText(loc, fetch));
  return parts.join('\n');
}

/** Wysyła jedną paczkę; zwraca kod HTTP. */
async function submit(batch, { key, host, siteUrl, fetch }) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation: `${siteUrl}/${key}.txt`, urlList: batch }),
  });
  // 200 = przyjęte, 202 = przyjęte, klucz w trakcie sprawdzania
  if (res.status !== 200 && res.status !== 202) warn(`paczka ${batch.length} adresów → HTTP ${res.status}`);
  else console.log(`IndexNow: wysłano ${batch.length} adresów (HTTP ${res.status}).`);
  return res.status;
}

/** Czy `{siteUrl}/{key}.txt` zwraca dokładnie klucz (IndexNow sprawdza to samo). */
async function keyIsLive(siteUrl, key, fetch) {
  const url = `${siteUrl}/${key}.txt`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'faktografia-atlas-indexnow' } });
    if (res.ok && (await res.text()).trim() === key) return true;
    warn(`plik klucza ${url} nie zwraca klucza; nic nie wysyłam.`);
  } catch (err) {
    warn(`nie udało się sprawdzić pliku klucza ${url} (${err.message}); nic nie wysyłam.`);
  }
  return false;
}

/**
 * Sedno przebiegu (wstrzykiwane zależności → test bez sieci).
 * Zwraca { mode, count, codes } albo null, gdy nic nie wysłano.
 */
export async function runIndexNow({ oldXml, newXml, siteUrl, key, fetch = globalThis.fetch, sm, dryRun = false, summary = () => {} }) {
  const mode = oldXml === null ? 'start' : 'zmiany';
  const urls = oldXml === null ? sm.allUrls(newXml) : sm.changedUrls(oldXml, newXml);
  if (urls.length === 0) {
    console.log('IndexNow: mapa strony bez zmian – nic nie wysyłam.');
    await summary(`IndexNow: tryb ${mode}, 0 adresów, nic nie wysłano.`);
    return null;
  }
  console.log(`IndexNow: tryb ${mode}, adresów: ${urls.length}.`);
  if (dryRun) {
    console.log(urls.slice(0, 20).join('\n'));
    return null;
  }
  if (!(await keyIsLive(siteUrl, key, fetch))) {
    await summary(`IndexNow: tryb ${mode}, ${urls.length} adresów, NIE wysłano (plik klucza niedostępny).`);
    return null;
  }
  const host = new URL(siteUrl).host;
  const codes = [];
  for (const batch of sm.batches(urls)) {
    try {
      codes.push(await submit(batch, { key, host, siteUrl, fetch }));
    } catch (err) {
      warn(`błąd sieci przy wysyłce (${err.message}).`);
      codes.push('błąd sieci');
    }
  }
  await summary(`IndexNow: tryb ${mode}, ${urls.length} adresów, kody odpowiedzi: ${codes.join(', ')}.`);
  return { mode, count: urls.length, codes };
}

async function main() {
  const { values: args } = parseArgs({
    options: {
      old: { type: 'string' },
      out: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
    },
  });
  const { createServer } = await import('vite');
  const vite = await createServer({ root, configFile: false, logLevel: 'error', appType: 'custom', server: { middlewareMode: true } });
  try {
    const sm = await vite.ssrLoadModule('/src/core/seo/sitemap-diff.ts');
    const { SITE_URL } = await vite.ssrLoadModule('/src/core/seo/site.ts');
    const oldXml = await readOptional(args.old);
    let newXml;
    try {
      newXml = await fetchSitemap(SITE_URL, sm.sitemapLocs);
    } catch (err) {
      warn(`nie udało się pobrać mapy strony (${err.message}); nic nie wysyłam, stara migawka zostaje.`);
      if (args.out && oldXml !== null) await writeOut(args.out, oldXml);
      return;
    }
    if (args.out) await writeOut(args.out, newXml);
    await runIndexNow({
      oldXml,
      newXml,
      siteUrl: SITE_URL,
      key: await findKey(),
      sm,
      dryRun: args['dry-run'],
      summary: async (line) => {
        if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `${line}\n`);
      },
    });
  } finally {
    await vite.close();
  }
}

async function writeOut(file, text) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, text);
}

// Uruchamiaj tylko jako skrypt (import w teście nie rusza sieci).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
