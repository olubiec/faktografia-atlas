// Statyczny dokument HTML strony miejsca (S07, docs/SEO.md D4): czytelny bez JavaScriptu, bez mapy WebGL.
// Klasy Tailwind z tokenów – ten plik skanuje Tailwind, więc klasy trafiają do zbudowanego CSS.
// Każda wartość z danych przechodzi przez escapeHtml / escapeAttr.
import { escapeAttr as attr, escapeHtml as text } from './html';
import { serializeLd, type LdObject } from './json-ld';
import { absoluteUrl, OG_IMAGE_HEIGHT, OG_IMAGE_PATH, OG_IMAGE_WIDTH } from './site';
import type { SlugUnit } from './slug';
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

const LINK = 'inline-flex min-h-[44px] items-center text-tusz underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-tusz';
const H2 = 'text-xl font-bold text-tusz';
const SECTION = 'mt-12 md:mt-16';

const a = (href: string, label: string, cls = LINK) => `<a href="${attr(href)}" class="${cls}">${text(label)}</a>`;
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

function breadcrumbLd(crumbs: PageLink[]): LdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
  };
}

function head(model: RenderModel, assets: PageAssets, crumbs: PageLink[]): string {
  const url = absoluteUrl(model.path);
  const meta = (key: 'name' | 'property', name: string, content: string | number) =>
    `<meta ${key}="${name}" content="${attr(content)}">`;
  return [
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<script src="/theme-init.js"></script>',
    `<title>${text(model.title)}</title>`,
    meta('name', 'description', model.description),
    meta('name', 'robots', model.indexable ? 'index,follow' : 'noindex,follow'),
    `<link rel="canonical" href="${attr(url)}">`,
    '<link rel="icon" type="image/svg+xml" href="/brand/faktografia-favicon.svg">',
    ...assets.css.map((href) => `<link rel="stylesheet" href="${attr(href)}">`),
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', 'Faktografia'),
    meta('property', 'og:locale', 'pl_PL'),
    meta('property', 'og:title', model.title),
    meta('property', 'og:description', model.description),
    meta('property', 'og:url', url),
    meta('property', 'og:image', absoluteUrl(OG_IMAGE_PATH)),
    meta('property', 'og:image:width', OG_IMAGE_WIDTH),
    meta('property', 'og:image:height', OG_IMAGE_HEIGHT),
    meta('name', 'twitter:card', 'summary_large_image'),
    `<script type="application/ld+json">${serializeLd(placeLd(model))}</script>`,
    `<script type="application/ld+json">${serializeLd(breadcrumbLd(crumbs))}</script>`,
  ].join('\n');
}

function crumbNav(crumbs: PageLink[]): string {
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

function localitiesSection(names: readonly string[] | undefined): string {
  if (!names || names.length === 0) return '';
  const shown = names.slice(0, MAX_LOCALITIES);
  const rest = names.length - shown.length;
  return `<section aria-labelledby="miejscowosci" class="${SECTION}"><h2 id="miejscowosci" class="${H2}">Miejscowości w gminie</h2>
<ul class="mt-3 flex flex-wrap gap-x-4 text-sm">${shown.map((n) => `<li>${text(n)}</li>`).join('')}</ul>${
    rest > 0 ? `<p class="mt-2 text-sm text-olowek">i ${rest} innych</p>` : ''
  }</section>`;
}

/** Pełny dokument HTML strony miejsca. Bez skryptu aplikacji: tylko theme-init.js i JSON-LD. */
export function renderUnitPage(model: RenderModel, assets: PageAssets): string {
  const crumbs = breadcrumbs(model);
  const logo =
    '<a href="/" aria-label="Faktografia – strona główna" class="flex min-h-[44px] items-center"><picture>' +
    '<source srcset="/brand/faktografia-logo-jasne.svg" media="(prefers-color-scheme: dark)">' +
    '<img src="/brand/faktografia-logo-granat.svg" alt="Faktografia" class="h-10 md:h-12 w-auto -ml-3 md:-ml-3.5"></picture></a>';
  const button = `<a href="${attr(mapLink(model.teryt, model.level))}" class="mt-6 inline-flex min-h-[44px] items-center border border-tusz bg-tusz px-4 py-2 font-bold text-arkusz focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tusz">Otwórz na mapie</a>`;
  return `<!doctype html>
<html lang="pl">
<head>
${head(model, assets, crumbs)}
</head>
<body class="min-h-screen bg-kalka text-tusz">
<header class="flex h-14 md:h-18 items-center border-b border-linia px-4 md:px-8">${logo}</header>
<main id="main-content" class="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
${crumbNav(crumbs)}
<h1 class="mt-6 text-3xl md:text-4xl font-extrabold leading-tight break-words">${text(model.h1)}</h1>
${model.lead.map((s) => `<p class="mt-4 max-w-prose">${text(s)}</p>`).join('\n')}
${button}
${table(model.rows, model.h1)}
${localitiesSection(model.localities)}
${linkSection('podrzedne', model.level === 'woj' ? 'Powiaty i miasta' : 'Gminy', model.links.children)}
${linkSection('podobne', 'Podobne pod względem liczby ludności', model.links.neighbours)}
</main>
<footer class="border-t border-linia bg-arkusz px-4 py-8 md:px-8">
<p class="mx-auto max-w-5xl text-sm text-olowek">Źródło: GUS, Bank Danych Lokalnych, CC BY 4.0 · dane z ${text(dataDate(model.lastmod))}</p>
</footer>
</body>
</html>
`;
}
