// IndexNow po wdrożeniu produkcji (S11, docs/SEO.md §5): wysyła do Bing i wyszukiwarek partnerskich
// tylko adresy nowe lub ze zmienionym `lastmod`. Google nie obsługuje IndexNow – jemu wystarcza mapa strony.
//
// Użycie: node scripts/seo/indexnow.mjs --old <stara-migawka.xml> --out <nowa-migawka.xml>
// Stara migawka = mapa strony zapisana jako artefakt poprzedniego przebiegu workflow (stan produkcji
// sprzed tego wdrożenia). Nowa migawka = obecna mapa strony z produkcji (wszystkie pliki sklejone).
// Błąd sieci lub odmowa IndexNow → ostrzeżenie (::warning::) i kod 0, nigdy czerwony przebieg.
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { createServer } from 'vite';

const root = path.resolve(import.meta.dirname, '../..');
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const { values: args } = parseArgs({
  options: {
    old: { type: 'string' },
    out: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
  },
});

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

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'faktografia-atlas-indexnow' } });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
}

/** Cała mapa strony z produkcji: indeks + wszystkie wymienione w nim pliki, sklejone w jeden tekst. */
async function fetchSitemap(siteUrl, sitemapLocs) {
  const index = await fetchText(`${siteUrl}/sitemap.xml`);
  const locs = sitemapLocs(index);
  // stary format (jeden plik urlset zamiast indeksu) też obsługujemy
  if (locs.length === 0) return index;
  const parts = [];
  for (const loc of locs) parts.push(await fetchText(loc));
  return parts.join('\n');
}

async function submit(batch, { key, host, siteUrl }) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation: `${siteUrl}/${key}.txt`, urlList: batch }),
  });
  // 200 = przyjęte, 202 = przyjęte, klucz w trakcie sprawdzania
  if (res.status !== 200 && res.status !== 202) warn(`paczka ${batch.length} adresów → HTTP ${res.status}`);
  else console.log(`IndexNow: wysłano ${batch.length} adresów (HTTP ${res.status}).`);
}

const vite = await createServer({ root, configFile: false, logLevel: 'error', appType: 'custom', server: { middlewareMode: true } });
try {
  await run(vite);
} finally {
  await vite.close();
}

async function run(vite) {
  const { changedUrls, batches, sitemapLocs } = await vite.ssrLoadModule('/src/core/seo/sitemap-diff.ts');
  const { SITE_URL } = await vite.ssrLoadModule('/src/core/seo/site.ts');
  const host = new URL(SITE_URL).host;
  const oldXml = await readOptional(args.old);

  let newXml;
  try {
    newXml = await fetchSitemap(SITE_URL, sitemapLocs);
  } catch (err) {
    warn(`nie udało się pobrać mapy strony (${err.message}); nic nie wysyłam, stara migawka zostaje.`);
    if (args.out && oldXml !== null) await writeOut(args.out, oldXml);
    return;
  }
  if (args.out) await writeOut(args.out, newXml);

  if (oldXml === null) {
    console.log('IndexNow: brak migawki z poprzedniego przebiegu – zapisuję stan bazowy, nic nie wysyłam.');
    return;
  }
  const urls = changedUrls(oldXml, newXml);
  if (urls.length === 0) {
    console.log('IndexNow: mapa strony bez zmian – nic nie wysyłam.');
    return;
  }
  console.log(`IndexNow: zmienione adresy: ${urls.length}.`);
  if (args['dry-run']) {
    console.log(urls.slice(0, 20).join('\n'));
    return;
  }
  const key = await findKey();
  for (const batch of batches(urls)) {
    try {
      await submit(batch, { key, host, siteUrl: SITE_URL });
    } catch (err) {
      warn(`błąd sieci przy wysyłce (${err.message}).`);
    }
  }
}

async function writeOut(file, text) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, text);
}
