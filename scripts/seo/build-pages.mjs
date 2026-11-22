// Po `vite build`: generuje statyczne strony miejsc (dist/<adres>.html) i mapę strony (dist/sitemap*.xml).
// Moduły TypeScript (src/core/seo/*) ładuje Vite w trybie SSR, bez nowych pakietów.
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';

const DIST = 'dist';
const MAX_BYTES = 80 * 1024;
const STATIC_PATHS = ['/', '/mapa', '/miejsca', '/o-projekcie', '/zrodla', '/prywatnosc'];

const json = async (p) => JSON.parse(await readFile(p, 'utf8'));
const started = Date.now();

const html = await readFile(path.join(DIST, 'index.html'), 'utf8');
const cssHrefs = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]);
if (cssHrefs.length === 0) throw new Error('dist/index.html nie ma arkusza stylów');

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { buildUnitPaths } = await server.ssrLoadModule('/src/core/seo/slug.ts');
  const { buildUnitPage } = await server.ssrLoadModule('/src/core/seo/unit-page.ts');
  const { renderUnitPage } = await server.ssrLoadModule('/src/core/seo/page-template.ts');
  const { buildSitemaps } = await server.ssrLoadModule('/src/core/seo/sitemap.ts');
  const { auditPages } = await server.ssrLoadModule('/src/core/seo/audit.ts');
  const { renderPlacesPage } = await server.ssrLoadModule('/src/core/seo/places-page.ts');

  const units = await json('public/data/units.json');
  const indicators = await json('config/indicators.json');
  const config = await json('config/seo.json');
  const localities = await json('public/data/localities.json');
  const paths = buildUnitPaths(units);
  const ctx = { units, paths, indicators };

  const byGmina = new Map();
  for (const l of localities) {
    if (!byGmina.has(l.gminaTeryt)) byGmina.set(l.gminaTeryt, []);
    byGmina.get(l.gminaTeryt).push(l.name);
  }

  const profiles = new Map();
  for (const f of (await readdir('public/data/profiles')).filter((x) => x.endsWith('.json'))) {
    const p = await json(path.join('public/data/profiles', f));
    profiles.set(p.woj, p);
  }

  const pages = [];
  const rendered = [];
  let indexed = 0;
  let noindex = 0;
  let biggest = { bytes: 0, path: '' };
  for (const [pagePath, teryt] of paths.byPath) {
    const unit = units.find((u) => u.teryt === teryt);
    const shard = profiles.get(teryt.slice(0, 2));
    if (!unit || !shard) continue;
    const page = buildUnitPage(unit, shard, ctx);
    if (!page) continue;
    const isGmina = page.kind.startsWith('gmina');
    page.indexable = page.indexable && (!isGmina || config.indexGminy === true);
    const out = renderUnitPage(page, {
      cssHrefs,
      mapLevel: unit.level,
      centroid: unit.centroid,
      localities: isGmina || page.kind === 'miasto' ? [...new Set(byGmina.get(teryt) ?? [])].sort((a, b) => a.localeCompare(b, 'pl')) : [],
      dataDate: page.lastmod,
    });
    const bytes = Buffer.byteLength(out);
    if (bytes > MAX_BYTES) throw new Error(`Strona ${pagePath} ma ${bytes} B (limit ${MAX_BYTES} B)`);
    if (bytes > biggest.bytes) biggest = { bytes, path: pagePath };
    // Plik <adres>.html: `vite preview` i Vercel (cleanUrls) serwują go pod adresem bez rozszerzenia.
    const file = path.join(DIST, `${pagePath}.html`);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, out);
    rendered.push({ path: pagePath, html: out });
    pages.push({ path: pagePath, indexable: page.indexable, lastmod: page.lastmod, group: isGmina ? 'gminy' : 'wojewodztwa-powiaty' });
    if (page.indexable) indexed++;
    else noindex++;
  }

  // Spis miejsc (/miejsca) i tabela adresów dla linku „Strona miejsca” w profilu (wczytywana leniwie).
  const places = renderPlacesPage(units, paths, cssHrefs);
  await writeFile(path.join(DIST, 'miejsca.html'), places);
  rendered.push({ path: '/miejsca', html: places });
  await mkdir(path.join(DIST, 'data'), { recursive: true });
  await writeFile(path.join(DIST, 'data', 'seo-paths.json'), JSON.stringify(Object.fromEntries(paths.byTeryt)));

  const lastmod = [...profiles.values()].map((p) => p.generatedAt).sort().at(-1);
  const sitemaps = buildSitemaps(pages, STATIC_PATHS, { indexGminy: config.indexGminy === true, lastmod });
  for (const f of sitemaps) await writeFile(path.join(DIST, f.name), f.xml);

  // Strażnik jakości (S08): błąd przerywa budowę.
  const sitemapUrls = sitemaps.flatMap((f) => (f.name === 'sitemap.xml' ? [] : [...f.xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])));
  const { errors, warnings } = auditPages(rendered, sitemapUrls, STATIC_PATHS.filter((p) => p !== '/miejsca'));
  if (warnings.length) console.warn(`[seo] ostrzeżenia: ${warnings.length}\n${warnings.slice(0, 10).map((w) => '  ' + w).join('\n')}`);
  if (errors.length) {
    console.error(`[seo] BŁĘDY (${errors.length}):\n${errors.slice(0, 50).map((e) => '  ' + e).join('\n')}`);
    process.exitCode = 1;
  }
  console.log(`[seo] stron: ${pages.length} (indeksowane: ${indexed}, noindex: ${noindex}); największa: ${biggest.path} ${biggest.bytes} B; czas: ${((Date.now() - started) / 1000).toFixed(1)} s`);
} finally {
  await server.close();
}
