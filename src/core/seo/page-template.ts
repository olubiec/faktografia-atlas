// Statyczny dokument HTML strony miejsca (S07, docs/SEO.md D4): czytelny bez JavaScriptu, bez mapy WebGL.
// Klasy Tailwind z tokenów – ten plik skanuje Tailwind, więc klasy trafiają do zbudowanego CSS.
// Każda wartość z danych przechodzi przez escapeHtml / escapeAttr.
import { escapeAttr as attr, escapeHtml as text } from './html';
import { serializeLd, type LdObject } from './json-ld';
import { absoluteUrl, OG_IMAGE_HEIGHT, OG_IMAGE_PATH, OG_IMAGE_WIDTH } from './site';
import type { SlugUnit } from './slug';
import { twinIntro } from './fact-lead';
import type { PageLink, PageRow, UnitPage } from './unit-page';

/** Model strony z S06 uzupełniony o to, czego potrzebuje dokument. */
export interface RenderModel extends UnitPage {
  level: SlugUnit['level'];
  /** [długość, szerokość] z public/data/units.json. */
  centroid: readonly [number, number] | null;
  /** Nazwy miejscowości gminy (D3: bez osobnych stron). */
  localities?: readonly string[];
}

export interface PageAssets {
  /** Arkusze stylów zbudowanej aplikacji (`/assets/index-*.css`). */
  css: readonly string[];
}

/** Najwyżej tyle nazw miejscowości na stronie gminy. */
export const MAX_LOCALITIES = 150;

/** Adres mapy z zaznaczoną jednostką: `/mapa?u=<teryt>&l=<poziom>`. */
export const mapLink = (teryt: string, level: SlugUnit['level']) => `/mapa?u=${teryt}&l=${level}`;

/** „17 listopada 2026” (czas polski). */
export function dataDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Warsaw' }).format(d);
}

export const LINK = 'inline-flex min-h-[44px] items-center text-tusz underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-tusz';
export const H2 = 'text-xl font-bold text-tusz';
export const SECTION = 'mt-12 md:mt-16';

export const a = (href: string, label: string, cls = LINK) => `<a href="${attr(href)}" class="${cls}">${text(label)}</a>`;
const valid = (links: readonly PageLink[]) => links.filter((l) => l.path);

function breadcrumbs(model: RenderModel): PageLink[] {
  return [
    { teryt: '', name: 'Faktografia', path: '/' },
    ...valid(model.links.parents).slice().reverse(),
    { teryt: model.teryt, name: model.h1, path: model.path },
  ];
}

function placeLd(model: RenderModel): LdObject {
  const parent = valid(model.links.parents)[0];
  const ld: LdObject = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: model.h1,
    url: absoluteUrl(model.path),
    containedInPlace: parent
      ? { '@type': 'Place', name: parent.name, url: absoluteUrl(parent.path) }
      : { '@type': 'Country', name: 'Polska' },
  };
  if (model.centroid) {
    const [longitude, latitude] = model.centroid;
    ld.geo = { '@type': 'GeoCoordinates', latitude, longitude };
  }
  return ld;
}

export function breadcrumbLd(crumbs: PageLink[]): LdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
  };
}

/** Wspólne dane nagłówka dokumentu (strona miejsca, ranking, spis rankingów). */
export interface DocumentHead {
  path: string;
  title: string;
  description: string;
  indexable: boolean;
  ld: readonly LdObject[];
}

function head(doc: DocumentHead, assets: PageAssets): string {
  const url = absoluteUrl(doc.path);
  const meta = (key: 'name' | 'property', name: string, content: string | number) =>
    `<meta ${key}="${name}" content="${attr(content)}">`;
  return [
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<script src="/theme-init.js"></script>',
    `<title>${text(doc.title)}</title>`,
    meta('name', 'description', doc.description),
    meta('name', 'robots', doc.indexable ? 'index,follow' : 'noindex,follow'),
    `<link rel="canonical" href="${attr(url)}">`,
    '<link rel="icon" type="image/svg+xml" href="/brand/faktografia-favicon.svg">',
    ...assets.css.map((href) => `<link rel="stylesheet" href="${attr(href)}">`),
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', 'Faktografia'),
    meta('property', 'og:locale', 'pl_PL'),
    meta('property', 'og:title', doc.title),
    meta('property', 'og:description', doc.description),
    meta('property', 'og:url', url),
    meta('property', 'og:image', absoluteUrl(OG_IMAGE_PATH)),
    meta('property', 'og:image:width', OG_IMAGE_WIDTH),
    meta('property', 'og:image:height', OG_IMAGE_HEIGHT),
    meta('name', 'twitter:card', 'summary_large_image'),
    ...doc.ld.map((ld) => `<script type="application/ld+json">${serializeLd(ld)}</script>`),
  ].join('\n');
}

export function crumbNav(crumbs: PageLink[]): string {
  const items = crumbs.map((c, i) =>
    i === crumbs.length - 1
      ? `<li><span aria-current="page" class="inline-flex min-h-[44px] items-center text-olowek">${text(c.name)}</span></li>`
      : `<li>${a(c.path, c.name)}</li>`,
  );
  return `<nav aria-label="Okruszki" class="text-sm"><ol class="flex flex-wrap gap-x-4">${items.join('')}</ol></nav>`;
}

const cell = (v: string | null, extra = '') =>
  `<td class="border-b border-linia px-3 py-2 align-top ${extra}">${v === null ? '–' : text(v)}</td>`;

function table(rows: readonly PageRow[], h1: string): string {
  if (rows.length === 0) return '';
  const th = (label: string) => `<th scope="col" class="border-b border-tusz px-3 py-2 text-left align-bottom font-bold">${label}</th>`;
  const body = rows.map(
    (r) =>
      `<tr><th scope="row" class="border-b border-linia px-3 py-2 text-left align-top font-normal">${text(r.name)}${
        r.fromParent ? ' <span class="text-olowek">(dane jednostki nadrzędnej)</span>' : ''
      }</th>${cell(r.value, 'font-mono tabular-nums whitespace-nowrap')}${cell(String(r.year), 'font-mono tabular-nums')}${cell(r.rankVoivodeship)}${cell(r.rankNational)}${cell(r.change10 ?? r.change5)}</tr>`,
  );
  return `<section aria-labelledby="dane" class="${SECTION}"><h2 id="dane" class="${H2}">Dane GUS</h2>
<div class="mt-3 overflow-x-auto"><table class="w-full border-collapse text-sm">
<caption class="pb-2 text-left text-olowek">${text(h1)}: ostatnie dostępne wartości wskaźników, miejsce w rankingu i zmiana w czasie</caption>
<thead><tr>${th('Wskaźnik')}${th('Wartość')}${th('Rok')}${th('Miejsce w województwie')}${th('Miejsce w Polsce')}${th('Zmiana')}</tr></thead>
<tbody>${body.join('\n')}</tbody></table></div></section>`;
}

function linkSection(id: string, title: string, links: readonly PageLink[]): string {
  const ok = valid(links);
  if (ok.length === 0) return '';
  return `<section aria-labelledby="${id}" class="${SECTION}"><h2 id="${id}" class="${H2}">${title}</h2>
<ul class="mt-3 flex flex-wrap gap-x-6">${ok.map((l) => `<li>${a(l.path, l.name)}</li>`).join('')}</ul></section>`;
}

/** W26-F03: sąsiedzi (wspólna granica, przy obwarzanku także dalsi) i bliźniak z innego województwa (F8). */
const AROUND_TITLE: Record<SlugUnit['level'], string> = { gmi: 'Gminy w okolicy', pow: 'Powiaty w okolicy', woj: 'Województwa w okolicy' };
function twinSection(twin: RenderModel['links']['twin']): string {
  if (!twin?.path) return '';
  return `<section aria-labelledby="blizniak" class="${SECTION}"><h2 id="blizniak" class="${H2}">Bliźniak w innym województwie</h2>
<p class="mt-3 max-w-prose">${text(twinIntro(twin))} ${a(twin.path, twin.name)} (woj. ${text(twin.voivodeship)}).</p></section>`;
}

function localitiesSection(names: readonly string[] | undefined): string {
  if (!names || names.length === 0) return '';
  const shown = names.slice(0, MAX_LOCALITIES);
  const rest = names.length - shown.length;
  return `<section aria-labelledby="miejscowosci" class="${SECTION}"><h2 id="miejscowosci" class="${H2}">Miejscowości w gminie</h2>
<ul class="mt-3 flex flex-wrap gap-x-4 text-sm">${shown.map((n) => `<li>${text(n)}</li>`).join('')}</ul>${
    rest > 0 ? `<p class="mt-2 text-sm text-olowek">i ${rest} innych</p>` : ''
  }</section>`;
}

const LOGO =
  '<a href="/" aria-label="Faktografia – strona główna" class="flex min-h-[44px] items-center"><picture>' +
  '<source srcset="/brand/faktografia-logo-jasne.svg" media="(prefers-color-scheme: dark)">' +
  '<img src="/brand/faktografia-logo-granat.svg" alt="Faktografia" class="h-10 md:h-12 w-auto -ml-3 md:-ml-3.5"></picture></a>';

/** Przycisk do mapy (≥ 44 px). */
export const mapButton = (href: string, label: string) =>
  `<a href="${attr(href)}" class="mt-6 inline-flex min-h-[44px] items-center border border-tusz bg-tusz px-4 py-2 font-bold text-arkusz focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tusz">${text(label)}</a>`;

/** Pełny dokument: nagłówek z logo, treść `main` (już w HTML), stopka ze źródłem i datą danych. */
export function renderDocument(doc: DocumentHead & { lastmod: string }, main: string, assets: PageAssets): string {
  return `<!doctype html>
<html lang="pl">
<head>
${head(doc, assets)}
</head>
<body class="min-h-screen bg-kalka text-tusz">
<header class="flex h-14 md:h-18 items-center border-b border-linia px-4 md:px-8">${LOGO}</header>
<main id="main-content" class="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
${main}
</main>
<footer class="border-t border-linia bg-arkusz px-4 py-8 md:px-8">
<p class="mx-auto max-w-5xl text-sm text-olowek">Źródło: GUS, Bank Danych Lokalnych, CC BY 4.0 · dane z ${text(dataDate(doc.lastmod))}</p>
</footer>
</body>
</html>
`;
}

/** Pełny dokument HTML strony miejsca. Bez skryptu aplikacji: tylko theme-init.js i JSON-LD. */
export function renderUnitPage(model: RenderModel, assets: PageAssets): string {
  const crumbs = breadcrumbs(model);
  const main = `${crumbNav(crumbs)}
<h1 class="mt-6 text-3xl md:text-4xl font-extrabold leading-tight break-words">${text(model.h1)}</h1>
${model.lead.map((s) => `<p class="mt-4 max-w-prose">${text(s)}</p>`).join('\n')}
${mapButton(mapLink(model.teryt, model.level), 'Otwórz na mapie')}
${table(model.rows, model.h1)}
${localitiesSection(model.localities)}
${linkSection('podrzedne', model.level === 'woj' ? 'Powiaty i miasta' : 'Gminy', model.links.children)}
${linkSection('okolica', AROUND_TITLE[model.level], model.links.around ?? [])}
${twinSection(model.links.twin)}
${linkSection('podobne', 'Podobne pod względem liczby ludności', model.links.neighbours)}`;
  const ld = [placeLd(model), breadcrumbLd(crumbs)];
  return renderDocument({ ...model, ld }, main, assets);
}
