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
/** Limit rozmiaru strony rankingu bez kompresji (warunek S10). */
const MAX_RANKING_BYTES = 120 * 1024;

/**
 * Statyczny dokument `/miejsca` (indeksowany). Klasy tylko te, które ma już page-template.ts (skanowany przez Tailwind).
 * Każda nazwa i adres przechodzą przez escapeHtml / escapeAttr.
 */
function renderPlacesPage(voivodeships, { css, escapeAttr: attr, escapeHtml: text, absoluteUrl }, extra = '') {
  const title = 'Miejsca: województwa, powiaty i miasta – Faktografia';
  const description = 'Spis 16 województw z powiatami i miastami na prawach powiatu. Każde miejsce ma stronę z danymi GUS.';
  const url = absoluteUrl('/miejsca');
  const LINK = 'inline-flex min-h-[44px] items-center text-tusz underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-tusz';
  const a = (href, label) => `<a href="${attr(href)}" class="${LINK}">${text(label)}</a>`;
  const sections = voivodeships.map(
    (v) => `<section aria-labelledby="w${attr(v.teryt)}" class="mt-12 md:mt-16"><h2 id="w${attr(v.teryt)}" class="text-xl font-bold text-tusz">${a(v.path, v.name)}</h2>
<ul class="mt-3 flex flex-wrap gap-x-6">${v.children.map((c) => `<li>${a(c.path, c.name)}</li>`).join('')}</ul></section>`,
  );
  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="/theme-init.js"></script>
<title>${text(title)}</title>
<meta name="description" content="${attr(description)}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${attr(url)}">
<link rel="icon" type="image/svg+xml" href="/brand/faktografia-favicon.svg">
${css.map((href) => `<link rel="stylesheet" href="${attr(href)}">`).join('\n')}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Faktografia">
<meta property="og:locale" content="pl_PL">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:url" content="${attr(url)}">
</head>
<body class="min-h-screen bg-kalka text-tusz">
<header class="flex h-14 md:h-18 items-center border-b border-linia px-4 md:px-8"><a href="/" aria-label="Faktografia – strona główna" class="flex min-h-[44px] items-center"><picture><source srcset="/brand/faktografia-logo-jasne.svg" media="(prefers-color-scheme: dark)"><img src="/brand/faktografia-logo-granat.svg" alt="Faktografia" class="h-10 md:h-12 w-auto -ml-3 md:-ml-3.5"></picture></a></header>
<main id="main-content" class="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
<h1 class="mt-6 text-3xl md:text-4xl font-extrabold leading-tight break-words">Miejsca w Polsce</h1>
<p class="mt-4 max-w-prose">Województwa, powiaty i miasta na prawach powiatu. Gminy są na stronach powiatów.</p>
<a href="/mapa" class="mt-6 inline-flex min-h-[44px] items-center border border-tusz bg-tusz px-4 py-2 font-bold text-arkusz focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tusz">Otwórz mapę</a>
${sections.join('\n')}
${extra}
</main>
<footer class="border-t border-linia bg-arkusz px-4 py-8 md:px-8">
<p class="mx-auto max-w-5xl text-sm text-olowek">Źródło: GUS, Bank Danych Lokalnych, CC BY 4.0</p>
</footer>
</body>
</html>
`;
}

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
  const { placesIndex } = await vite.ssrLoadModule('/src/core/seo/unit-link.ts');
  const { escapeAttr, escapeHtml } = await vite.ssrLoadModule('/src/core/seo/html.ts');
  const { absoluteUrl } = await vite.ssrLoadModule('/src/core/seo/site.ts');
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

  // S09 (D9): spis miejsc `/miejsca` – 16 województw z powiatami i miastami; link w stopce każdej strony aplikacji.
  // S10 + F04: pod spisem rankingi wskaźników i tematy; /miejsca też przechodzi audyt (linki do nowych stron).
  const ranking = await vite.ssrLoadModule('/src/core/seo/ranking-template.ts');
  const discover = await vite.ssrLoadModule('/src/core/seo/discover-site.ts');
  const { topicsSection } = await vite.ssrLoadModule('/src/core/seo/discover-template.ts');
  const { topicsOf } = await vite.ssrLoadModule('/src/core/seo/topics.ts');
  const placesExtra = `${ranking.rankingIndexSection(indicators)}\n${topicsSection(topicsOf(indicators))}`;
  const placesHtml = renderPlacesPage(placesIndex(units), { css, escapeAttr, escapeHtml, absoluteUrl }, placesExtra);
  await mkdir(path.join(dist, 'miejsca'), { recursive: true });
  await writeFile(path.join(dist, 'miejsca', 'index.html'), placesHtml);
  auditList.push(readPage('/miejsca', placesHtml));
  staticPaths.push(absoluteUrl('/miejsca'));

  const sitemaps = buildSitemaps(sitemapPages, staticPaths, config);

  // Rankingi wskaźników (S10): 380 stron + spis /ranking, własna mapa strony dopisana do indeksu.
  const explanations = await readJson(path.join(dataDir, 'explanations.json'));
  const values = {};
  for (const ind of indicators) values[ind.id] = await readJson(path.join(dataDir, 'values', `${ind.id}.json`));
  const rankingCtx = { units, paths, headings: ranking.rankingHeadings(units), indicators, explanations: explanations.items, indexGminy: config.indexGminy };
  const rankingPages = ranking.buildRankingSite(values, rankingCtx, { css });
  let maxRanking = { bytes: 0, path: '' };
  for (const page of rankingPages) {
    const bytes = Buffer.byteLength(page.html, 'utf8');
    if (bytes > maxRanking.bytes) maxRanking = { bytes, path: page.path };
    if (bytes > MAX_RANKING_BYTES) throw new Error(`Strona ${page.path} ma ${bytes} B (limit ${MAX_RANKING_BYTES} B).`);
    await mkdir(path.join(dist, page.path), { recursive: true });
    await writeFile(path.join(dist, page.path, 'index.html'), page.html);
    auditList.push(readPage(page.path, page.html));
  }
  const rankingLastmod = rankingPages.map((p) => p.lastmod).sort().at(-1);
  sitemaps[ranking.RANKING_SITEMAP] = ranking.rankingSitemap(rankingPages);
  sitemaps['sitemap.xml'] = ranking.withSitemapEntry(sitemaps['sitemap.xml'], ranking.RANKING_SITEMAP, rankingLastmod);
  console.log(
    `Rankingi: ${rankingPages.length} stron (indeksowane: ${rankingPages.filter((p) => p.indexable).length}); ` +
      `największa ${maxRanking.path} ${(maxRanking.bytes / 1024).toFixed(1)} KB.`,
  );
  // F04: 7 tematów /temat/<grupa>, zestawienia /zestawienie/<slug> (config/lists.json) i spis /zestawienia.
  const factsConfig = await readJson(path.join(root, 'config/facts.json'));
  const factFiles = (await readdir(path.join(dataDir, 'facts'))).filter((f) => /^\d{2}\.json$/.test(f)).sort();
  const shards = await Promise.all(factFiles.map((f) => readJson(path.join(dataDir, 'facts', f))));
  const discoverCtx = {
    units, paths, headings: rankingCtx.headings, indicators, explanations: explanations.items, values,
    lists: await readJson(path.join(root, 'config/lists.json')),
    relativeChangeUnits: factsConfig.relativeChangeUnits, boundaryJump: factsConfig.thresholds.boundaryJump,
  };
  const discoverPages = discover.buildDiscoverSite(discoverCtx, discover.factsFromShards(shards), { css });
  for (const page of discoverPages) {
    await mkdir(path.join(dist, page.path), { recursive: true });
    await writeFile(path.join(dist, page.path, 'index.html'), page.html);
    auditList.push(readPage(page.path, page.html));
  }
  sitemaps[discover.DISCOVER_SITEMAP] = ranking.rankingSitemap(discoverPages);
  const discoverLastmod = discoverPages.map((p) => p.lastmod).sort().at(-1);
  sitemaps['sitemap.xml'] = ranking.withSitemapEntry(sitemaps['sitemap.xml'], discover.DISCOVER_SITEMAP, discoverLastmod);
  console.log(`Tematy i zestawienia: ${discoverPages.length} stron (indeksowane: ${discoverPages.filter((p) => p.indexable).length}).`);
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
