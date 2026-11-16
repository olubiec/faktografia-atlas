// Generator public/sitemap.xml z tras w src/App.tsx (bez lastmod – wynik deterministyczny).
// Uruchomienie: node scripts/seo/sitemap.mjs [--check]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DOMAIN = 'https://faktografia.eu';
// Włączyć dopiero po decyzji D-SEO-1 (canonical z ?u=) – patrz AUDYT-SEO.md P1-4.
export const INCLUDE_UNITS = false;

/** Trasy publiczne z <Route path="…"> – ta sama reguła co publicRoutes() w meta.test.ts. */
export function readPublicRoutes(appSource) {
  return [...appSource.matchAll(/<Route path="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((p) => !p.includes(':') && !p.includes('*') && !p.startsWith('/__test') && p !== '/design');
}

/** Adresy jednostek '/?u=<teryt>' dla podanych poziomów, posortowane po TERYT (string). */
export function unitUrls(units, { levels }) {
  return units
    .filter((u) => levels.includes(u.level))
    .map((u) => String(u.teryt))
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    .map((t) => `/?u=${t}`);
}

const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Buduje XML sitemapy; deduplikuje adresy, kończy znakiem nowej linii. */
export function buildSitemap({ domain, routes, unitPaths = [] }) {
  const urls = [...new Set([...routes, ...unitPaths].map((p) => `${domain}${p}`))];
  const lines = urls.map((u) => `  <url><loc>${escapeXml(u)}</loc></url>`);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...lines,
    '</urlset>',
    '',
  ].join('\n');
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const routes = readPublicRoutes(fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8'));
  let unitPaths = [];
  if (INCLUDE_UNITS) {
    const units = JSON.parse(fs.readFileSync(path.join(root, 'public/data/units.json'), 'utf8'));
    unitPaths = unitUrls(Array.isArray(units) ? units : units.units, { levels: ['woj', 'pow'] });
  }
  const xml = buildSitemap({ domain: DOMAIN, routes, unitPaths });
  const file = path.join(root, 'public/sitemap.xml');
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    if (cur !== xml) {
      console.error('public/sitemap.xml jest nieaktualny – uruchom node scripts/seo/sitemap.mjs');
      process.exit(1);
    }
    return;
  }
  fs.writeFileSync(file, xml);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
