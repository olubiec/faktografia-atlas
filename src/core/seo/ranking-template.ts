// Statyczne dokumenty HTML rankingów (S10) i ich mapa strony. Ten sam szkielet co strony miejsc (page-template).
// Tabela ma klasy na <table> (warianty [&_td]), żeby 200–300 wierszy mieściło się w budżecie wagi strony.
import type { Feature } from 'geojson';
import type { IndicatorValues } from '../profile/profile';
import { escapeAttr as attr, escapeHtml as text } from './html';
import type { LdObject } from './json-ld';
import { a, breadcrumbLd, crumbNav, H2, LINK, mapButton, renderDocument, SECTION, type PageAssets } from './page-template';
import { buildRankingPage, LEVELS, RANKING_ROOT, rankingPath, type RankingContext, type RankingPage, type RankingRow, type RankingSpec } from './ranking-page';
import { rankingMapAlt, rankingMapFigure, rankingMapSrc, rankingMapSvg } from './ranking-map';
import { shortIndicatorName, unitHeading } from './sentences';
import { absoluteUrl } from './site';
import type { SlugUnit } from './slug';

const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/';
export const H1 = 'mt-6 text-3xl md:text-4xl font-extrabold leading-tight break-words';
export const TABLE =
  'w-full border-collapse text-sm [&_td]:border-b [&_td]:border-linia [&_td]:px-3 [&_td]:py-1 [&_td]:align-middle ' +
  '[&_th]:border-b [&_th]:border-tusz [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-bold ' +
  '[&_a]:inline-flex [&_a]:min-h-[44px] [&_a]:items-center [&_a]:underline [&_a]:underline-offset-4 ' +
  '[&_td:first-child]:font-mono [&_td:first-child]:tabular-nums [&_td:last-child]:font-mono [&_td:last-child]:tabular-nums [&_td:last-child]:whitespace-nowrap';

/** Wszystkie rankingi: 3 poziomy na wskaźnik + ranking gmin w każdym województwie. */
export function rankingSpecs(indicators: RankingContext['indicators'], units: readonly SlugUnit[]): RankingSpec[] {
  const voivodeships = units.filter((u) => u.level === 'woj');
  return indicators.flatMap((ind) => [
    ...(['woj', 'pow', 'gmi'] as const).map((level) => ({ indicatorId: ind.id, level, voivodeship: null, path: rankingPath(ind, level) })),
    ...voivodeships.map((v) => ({ indicatorId: ind.id, level: 'gmi' as const, voivodeship: v.teryt, path: rankingPath(ind, 'gmi', v) })),
  ]);
}

/** Nagłówki wszystkich jednostek (powtórzone nazwy gmin z rodzajem i powiatem). */
export function rankingHeadings(units: readonly SlugUnit[]): Map<string, string> {
  return new Map(units.map((u) => [u.teryt, unitHeading(u, units)]));
}

function datasetLd(page: RankingPage): LdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: page.h1,
    description: page.description,
    url: absoluteUrl(page.path),
    license: LICENSE_URL,
    isAccessibleForFree: true,
    inLanguage: 'pl-PL',
    creator: { '@type': 'Organization', name: 'Główny Urząd Statystyczny', url: 'https://stat.gov.pl' },
    publisher: { '@type': 'Organization', name: 'Faktografia', url: absoluteUrl('/') },
    isBasedOn: 'https://bdl.stat.gov.pl',
    dateModified: page.lastmod,
    ...(page.year === null ? {} : { temporalCoverage: String(page.year) }),
    spatialCoverage: { '@type': 'Place', name: page.scopeName },
    variableMeasured: { '@type': 'PropertyValue', name: page.indicatorName, unitText: page.unit },
  };
}

const tr = (r: RankingRow) =>
  `<tr><td>${r.rank}</td><td>${r.path ? `<a href="${attr(r.path)}">${text(r.name)}</a>` : text(r.name)}</td><td>${text(r.value)}</td></tr>`;

function rankingTable(page: RankingPage): string {
  if (page.top.length === 0) return '';
  const gap = page.bottom.length
    ? `<tr><td colspan="3" class="text-olowek">… pominięto ${page.total - page.top.length - page.bottom.length} pozycji …</td></tr>`
    : '';
  return `<section aria-labelledby="tabela" class="${SECTION}"><h2 id="tabela" class="${H2}">Tabela</h2>
<div class="mt-3 overflow-x-auto"><table class="${TABLE}">
<caption class="pb-2 text-left text-olowek">${text(page.h1)}</caption>
<thead><tr><th scope="col">Miejsce</th><th scope="col">${LEVELS[page.spec.level].column}</th><th scope="col">Wartość</th></tr></thead>
<tbody>
${page.top.map(tr).join('\n')}${gap}
${page.bottom.map(tr).join('\n')}
</tbody></table></div></section>`;
}

const linkList = (id: string, title: string, links: RankingPage['related'][number]['links']) =>
  links.length === 0
    ? ''
    : `<section aria-labelledby="${id}" class="${SECTION}"><h2 id="${id}" class="${H2}">${text(title)}</h2>
<ul class="mt-3 flex flex-wrap gap-x-6">${links.map((l) => `<li>${a(l.path, l.name)}</li>`).join('')}</ul></section>`;

/** Statyczna mapa rankingu (obrazek obok strony), gdy strona ma wartości do mapy. */
function mapFigure(page: RankingPage): string {
  if (page.mapValues.length === 0) return '';
  const alt = rankingMapAlt({ title: page.h1, values: page.mapValues, unit: page.unit });
  return rankingMapFigure(rankingMapSrc(page.path), alt, `Mapa: ${page.h1}. Źródło: GUS, Bank Danych Lokalnych.`);
}

/** Pełny dokument strony rankingu. */
export function renderRankingPage(page: RankingPage, assets: PageAssets): string {
  const ex = page.explanation;
  const about = [ex.short, ex.howToRead].filter((s): s is string => !!s).map((s) => `<p class="mt-3 max-w-prose">${text(s)}</p>`);
  const definition = ex.definitionUrl
    ? `<p class="mt-3"><a href="${attr(ex.definitionUrl)}" class="${LINK}" rel="noopener">Definicja GUS</a></p>`
    : '';
  const main = `${crumbNav(page.crumbs)}
<h1 class="${H1}">${text(page.h1)}</h1>
<p class="mt-4 max-w-prose">${page.lead.map(text).join(' ')}</p>
${mapButton(page.mapHref, 'Zobacz na mapie')}
${mapFigure(page)}
${about.length || definition ? `<section aria-labelledby="o-wskazniku" class="${SECTION}"><h2 id="o-wskazniku" class="${H2}">O wskaźniku</h2>${about.join('')}${definition}</section>` : ''}
${rankingTable(page)}
${page.related.map((r) => linkList(r.id, r.title, r.links)).join('\n')}`;
  return renderDocument({ ...page, ld: [datasetLd(page), breadcrumbLd(page.crumbs)] }, main, assets);
}

type IndexIndicator = RankingContext['indicators'][number];

/** Sekcja „Rankingi”: każdy wskaźnik z linkami do rankingu województw, powiatów i gmin (spis `/ranking`, `/miejsca`). */
export function rankingIndexSection(indicators: readonly IndexIndicator[], headingId = 'rankingi'): string {
  const items = indicators.map(
    (ind) =>
      `<li class="mt-2"><span class="font-bold">${text(shortIndicatorName(ind.name, ind.unit))}</span><span class="flex flex-wrap gap-x-6">${(['woj', 'pow', 'gmi'] as const)
        .map((l) => a(rankingPath(ind, l), LEVELS[l].short))
        .join('')}</span></li>`,
  );
  return `<section aria-labelledby="${headingId}" class="${SECTION}"><h2 id="${headingId}" class="${H2}">Rankingi</h2><ul class="mt-3">${items.join('')}</ul></section>`;
}

/** Spis rankingów `/ranking`. */
export function renderRankingIndex(indicators: readonly IndexIndicator[], lastmod: string, assets: PageAssets): string {
  const crumbs = [
    { teryt: '', name: 'Faktografia', path: '/' },
    { teryt: '', name: 'Rankingi', path: RANKING_ROOT },
  ];
  const main = `${crumbNav(crumbs)}
<h1 class="${H1}">Rankingi wskaźników GUS</h1>
<p class="mt-4 max-w-prose">Ranking województw, powiatów i gmin dla ${indicators.length} wskaźników z Banku Danych Lokalnych GUS: ludność, rynek pracy, budżety gmin, mieszkania, środowisko i kultura.</p>
${rankingIndexSection(indicators, 'lista')}`;
  const doc = {
    path: RANKING_ROOT,
    title: 'Rankingi województw, powiatów i gmin – dane GUS',
    description: `Rankingi ${indicators.length} wskaźników GUS dla województw, powiatów i gmin Polski: miejsca, wartości, mediana i link do mapy. Źródło: Bank Danych Lokalnych.`,
    indexable: true,
    lastmod,
    ld: [breadcrumbLd(crumbs)],
  };
  return renderDocument(doc, main, assets);
}

export interface BuiltRankingPage {
  path: string;
  html: string;
  indexable: boolean;
  lastmod: string;
  /** Poziom rankingu; spis `/ranking` ma null. */
  level: RankingPage['spec']['level'] | null;
  /** Plik SVG mapy do zapisania pod `rankingMapSrc(path)`; brak, gdy strona nie ma mapy. */
  mapSvg?: string;
}

/** Granice jednostek według poziomu (TopoJSON public/geo/admin.topo.json rozpakowany w generatorze). */
export type RankingGeo = Partial<Record<RankingPage['spec']['level'], readonly Feature[]>>;

const teryt = (f: Feature) => String(f.properties?.teryt ?? '');

function mapSvgFor(page: RankingPage, geo: RankingGeo | undefined): string | undefined {
  const all = geo?.[page.spec.level];
  if (!all || page.mapValues.length === 0) return undefined;
  const voiv = page.spec.voivodeship;
  const features = voiv ? all.filter((f) => teryt(f).startsWith(voiv)) : all;
  return rankingMapSvg({ features, values: page.mapValues, title: page.h1, unit: page.unit, year: page.year });
}

/** Wszystkie strony rankingów i spis `/ranking` (generator: scripts/seo/build-pages.mjs). */
export function buildRankingSite(
  values: Readonly<Record<string, IndicatorValues>>,
  ctx: RankingContext,
  assets: PageAssets,
  geo?: RankingGeo,
): BuiltRankingPage[] {
  const pages: BuiltRankingPage[] = [];
  for (const spec of rankingSpecs(ctx.indicators, ctx.units)) {
    const v = values[spec.indicatorId];
    if (!v) throw new Error(`Brak public/data/values/${spec.indicatorId}.json`);
    const page = buildRankingPage(spec, v, ctx);
    const mapSvg = mapSvgFor(page, geo);
    // Bez pliku mapy strona nie pokazuje obrazka (żadnych linków do nieistniejących plików).
    const html = renderRankingPage(mapSvg ? page : { ...page, mapValues: [] }, assets);
    pages.push({ path: page.path, html, indexable: page.indexable, lastmod: page.lastmod, level: spec.level, ...(mapSvg ? { mapSvg } : {}) });
  }
  const lastmod = pages.map((p) => p.lastmod).sort().at(-1) ?? new Date(0).toISOString();
  pages.push({ path: RANKING_ROOT, html: renderRankingIndex(ctx.indicators, lastmod, assets), indexable: true, lastmod, level: null });
  return pages;
}

export const RANKING_SITEMAP = 'sitemap-rankingi.xml';
const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** `sitemap-rankingi.xml`: tylko strony indeksowane, `lastmod` = dzień pobrania danych. */
export function rankingSitemap(pages: readonly Pick<BuiltRankingPage, 'path' | 'indexable' | 'lastmod'>[]): string {
  const rows = pages
    .filter((p) => p.indexable)
    .map((p) => `  <url><loc>${xml(absoluteUrl(p.path))}</loc><lastmod>${xml(p.lastmod.slice(0, 10))}</lastmod></url>\n`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('')}</urlset>\n`;
}

/** Dopisuje plik do indeksu `sitemap.xml` (z sitemap.ts) przed znacznikiem zamykającym. */
export function withSitemapEntry(indexXml: string, file: string, lastmod: string): string {
  const entry = `  <sitemap><loc>${xml(absoluteUrl(`/${file}`))}</loc><lastmod>${xml(lastmod.slice(0, 10))}</lastmod></sitemap>\n`;
  if (!indexXml.includes('</sitemapindex>')) throw new Error('sitemap.xml nie jest indeksem map strony');
  return indexXml.replace('</sitemapindex>', `${entry}</sitemapindex>`);
}
