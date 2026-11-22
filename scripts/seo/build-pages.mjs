// Generator statycznych stron miejsc i mapy strony (S07, docs/SEO.md D4, D7).
// Uruchamiany po `vite build`: czyta dist/ i public/data, zapisuje dist/<adres>/index.html i dist/sitemap*.xml.
// Moduły TS z src/core/seo ładuje przez Vite (ssrLoadModule) – bez nowych pakietów.
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { createServer } from 'vite';

const root = path.resolve(import.meta.dirname, '../..');
const dist = path.join(root, 'dist');
const dataDir = path.join(root, 'public/data');
/** Limit rozmiaru strony gminy bez kompresji (warunek S07). */
const MAX_GMINA_BYTES = 80 * 1024;

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const started = performance.now();

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
  const { buildUnitPaths } = await vite.ssrLoadModule('/src/core/seo/slug.ts');
  const { buildUnitPage } = await vite.ssrLoadModule('/src/core/seo/unit-page.ts');
  const { renderUnitPage } = await vite.ssrLoadModule('/src/core/seo/page-template.ts');
  const { buildSitemaps, isIndexed } = await vite.ssrLoadModule('/src/core/seo/sitemap.ts');
  const { auditPages, readPage, summarize } = await vite.ssrLoadModule('/src/core/seo/audit.ts');

  const config = await readJson(path.join(root, 'config/seo.json'));
  const indicators = await readJson(path.join(root, 'config/indicators.json'));
  const units = await readJson(path.join(dataDir, 'units.json'));
  const localities = await readJson(path.join(dataDir, 'localities.json'));

  // Arkusz stylów aplikacji: ten sam, który podpina dist/index.html (bez skryptu aplikacji).
  const indexHtml = await readFile(path.join(dist, 'index.html'), 'utf8');
  const css = [...indexHtml.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+\.css)"/g)].map((m) => m[1]);
  if (css.length === 0) throw new Error('Brak arkusza CSS w dist/index.html – najpierw `vite build`.');

  // Strony stałe: adresy z public/sitemap.xml (S01) – jedno źródło listy.
  const staticSitemap = await readFile(path.join(root, 'public/sitemap.xml'), 'utf8');
  const staticPaths = [...staticSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  const collator = new Intl.Collator('pl');
  const localitiesByGmina = new Map();
  for (const l of localities) {
    const list = localitiesByGmina.get(l.gminaTeryt) ?? [];
    list.push(l);
    localitiesByGmina.set(l.gminaTeryt, list);
  }
  // Najpierw miasta, potem reszta alfabetycznie; same nazwy (D3).
  const localityNames = (teryt) =>
    (localitiesByGmina.get(teryt) ?? [])
      .sort((a, b) => Number(b.kind === 'miasto') - Number(a.kind === 'miasto') || collator.compare(a.name, b.name))
      .map((l) => l.name);

  const paths = buildUnitPaths(units);
  const ctx = { units, paths, indicators };
  const byTeryt = new Map(units.map((u) => [u.teryt, u]));
  const sitemapPages = [];
  /** Streszczenia stron do audytu S08 (bez całego HTML w pamięci). */
  const auditList = [];
  let maxGmina = { bytes: 0, path: '' };

  const profileFiles = (await readdir(path.join(dataDir, 'profiles'))).filter((f) => /^\d{2}\.json$/.test(f)).sort();
  for (const file of profileFiles) {
    const profile = await readJson(path.join(dataDir, 'profiles', file));
    const woj = file.slice(0, 2);
    // Każdy adres raz: gmina miasta na prawach powiatu ma adres powiatu (terytByPath daje TERYT powiatu).
    for (const [urlPath, teryt] of paths.terytByPath) {
      if (teryt.slice(0, 2) !== woj) continue;
      const unit = byTeryt.get(teryt);
      const page = buildUnitPage(unit, profile, ctx);
      const indexable = isIndexed({ level: unit.level, indexable: page.indexable }, config);
      const html = renderUnitPage(
        {
          ...page,
          indexable,
          level: unit.level,
          centroid: unit.centroid ?? null,
          localities: unit.level === 'gmi' ? localityNames(teryt) : undefined,
        },
        { css },
      );
      const bytes = Buffer.byteLength(html, 'utf8');
      if (unit.level === 'gmi' && bytes > maxGmina.bytes) maxGmina = { bytes, path: urlPath };
      if (unit.level === 'gmi' && bytes > MAX_GMINA_BYTES) {
        throw new Error(`Strona ${urlPath} ma ${bytes} B (limit ${MAX_GMINA_BYTES} B).`);
      }
      const dir = path.join(dist, urlPath);
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, 'index.html'), html);
      auditList.push(readPage(urlPath, html));
      sitemapPages.push({ path: urlPath, level: unit.level, indexable, lastmod: page.lastmod });
    }
  }

  const sitemaps = buildSitemaps(sitemapPages, staticPaths, config);
  for (const [name, xml] of Object.entries(sitemaps)) await writeFile(path.join(dist, name), xml);

  // Strażnik jakości (S08): błąd przerywa budowę, ostrzeżenia trafiają do podsumowania.
  const sitemapUrls = Object.entries(sitemaps)
    .filter(([name]) => name !== 'sitemap.xml')
    .flatMap(([, xml]) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  const { errors, warnings, counts } = summarize(auditPages(auditList, sitemapUrls, { knownPaths: staticPaths }));
  console.log(`Audyt SEO: ${errors.length} błędów, ${warnings.length} ostrzeżeń${counts ? ` (${counts})` : ''}.`);
  if (errors.length > 0) {
    for (const e of errors.slice(0, 200)) console.error(`  [${e.code}] ${e.path}: ${e.message}`);
    if (errors.length > 200) console.error(`  … i ${errors.length - 200} kolejnych.`);
    throw new Error(`Audyt SEO: ${errors.length} błędów – strony nie przechodzą (docs/SEO.md §5).`);
  }

  const indexed = sitemapPages.filter((p) => p.indexable).length;
  const seconds = ((performance.now() - started) / 1000).toFixed(1);
  console.log(
    `Strony miejsc: ${sitemapPages.length} (indeksowane: ${indexed}, nieindeksowane: ${sitemapPages.length - indexed}); ` +
      `największa gmina ${maxGmina.path} ${(maxGmina.bytes / 1024).toFixed(1)} KB; ` +
      `mapa strony: ${Object.keys(sitemaps).join(', ')}; czas ${seconds} s.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await vite.close();
}
