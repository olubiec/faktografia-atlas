// IndexNow: po wdrożeniu produkcji zgłasza wyszukiwarkom (Bing i partnerzy) tylko adresy, których lastmod się zmienił.
// Użycie: node scripts/seo/indexnow.mjs <katalog-ze-starą-migawką> <katalog-na-nową-migawkę>
// Migawka = kopie plików mapy strony z produkcji; poprzednia pochodzi z artefaktu poprzedniego przebiegu workflow.
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';

const HOST = 'faktografia.eu';
const SITE = `https://${HOST}`;
const [oldDir, newDir] = process.argv.slice(2);
if (!oldDir || !newDir) throw new Error('Podaj: <stara-migawka> <nowa-migawka>');

const keyFile = (await readdir('public')).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('Brak pliku klucza IndexNow w public/');
const key = keyFile.replace(/\.txt$/, '');

const get = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.text();
};

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { changedUrls, batches } = await server.ssrLoadModule('/src/core/seo/sitemap-diff.ts');
  const read = async (dir) => {
    try {
      const names = (await readdir(dir)).filter((n) => n.endsWith('.xml') && n !== 'sitemap.xml').sort();
      return (await Promise.all(names.map((n) => readFile(path.join(dir, n), 'utf8')))).join('\n');
    } catch {
      return '';
    }
  };

  // Nowa migawka z produkcji.
  await mkdir(newDir, { recursive: true });
  const index = await get(`${SITE}/sitemap.xml`);
  const files = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const url of files) await writeFile(path.join(newDir, path.basename(new URL(url).pathname)), await get(url));

  const before = await read(oldDir);
  const after = await read(newDir);
  if (before === '') {
    console.log('[indexnow] brak poprzedniej migawki: zapisuję stan wyjściowy, niczego nie zgłaszam');
  } else {
    const urls = changedUrls(before, after);
    console.log(`[indexnow] zmienione adresy: ${urls.length}`);
    for (const batch of batches(urls)) {
      try {
        const r = await fetch('https://api.indexnow.org/indexnow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE}/${key}.txt`, urlList: batch }),
        });
        console.log(`[indexnow] paczka ${batch.length}: HTTP ${r.status}`);
      } catch (e) {
        console.warn(`[indexnow] ostrzeżenie: ${e.message}`);
      }
    }
  }
} catch (e) {
  // Błąd sieci nie psuje wdrożenia.
  console.warn(`[indexnow] ostrzeżenie: ${e.message}`);
} finally {
  await server.close();
}
