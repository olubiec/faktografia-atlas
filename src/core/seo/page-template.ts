import { escapeAttr, escapeHtml as h } from './html';
import { serializeLd } from './json-ld';
import { OG_IMAGE_HEIGHT, OG_IMAGE_PATH, OG_IMAGE_WIDTH, SITE_URL, absoluteUrl } from './site';
import type { PageLink, UnitPage } from './unit-page';

export interface PageAssets {
  /** Ścieżki zbudowanych arkuszy stylów (dist/assets/*.css). */
  cssHrefs: string[];
  /** Poziom na mapie: woj / pow / gmi (parametr `l` w adresie mapy). */
  mapLevel: 'woj' | 'pow' | 'gmi';
  /** Środek jednostki [długość, szerokość]; brak = bez współrzędnych w danych strukturalnych. */
  centroid?: [number, number] | null;
  /** Nazwy miejscowości gminy (bez osobnych stron, D3). */
  localities?: string[];
  /** Data danych (z profilu) do stopki. */
  dataDate: string;
}

const MAX_LOCALITIES = 150;

const linkList = (links: PageLink[]) =>
  links.map((l) => `<li><a class="underline text-tusz hover:text-olowek" href="${escapeAttr(l.path)}">${h(l.label)}</a></li>`).join('');

function section(title: string, links: PageLink[]): string {
  if (links.length === 0) return '';
  return `<section class="mt-8"><h2 class="text-lg font-bold">${h(title)}</h2><ul class="mt-2 flex flex-wrap gap-x-4 gap-y-2">${linkList(links)}</ul></section>`;
}

function jsonLd(page: UnitPage, assets: PageAssets): string {
  const url = absoluteUrl(page.path);
  const place: Record<string, unknown> = { '@context': 'https://schema.org', '@type': 'Place', name: page.name, url };
  const parent = page.links.parents[page.links.parents.length - 1];
  if (parent) place['containedInPlace'] = { '@type': 'Place', name: parent.label, url: absoluteUrl(parent.path) };
  if (assets.centroid) place['geo'] = { '@type': 'GeoCoordinates', longitude: assets.centroid[0], latitude: assets.centroid[1] };
  const crumbs = [{ label: 'Faktografia', path: '/' }, ...[...page.links.parents].reverse(), { label: page.name, path: page.path }];
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: absoluteUrl(c.path) })),
  };
  return [place, breadcrumb].map((d) => `<script type="application/ld+json">${serializeLd(d)}</script>`).join('\n');
}

function table(page: UnitPage): string {
  const rows = page.rows
    .map(
      (r) =>
        `<tr class="border-t border-linia"><th scope="row" class="py-2 pr-3 text-left font-medium">${h(r.name)}${r.note ? `<span class="block text-xs text-olowek">${h(r.note)}</span>` : ''}</th>` +
        `<td class="py-2 pr-3 whitespace-nowrap">${h(r.value)}<span class="block text-xs text-olowek">${h(r.year)}</span></td>` +
        `<td class="py-2 pr-3 text-sm">${[r.rankVoivodeship, r.rankNational].filter(Boolean).map(h).join('<br>')}</td>` +
        `<td class="py-2 text-sm whitespace-nowrap">${[r.change5 && `5 lat: ${r.change5}`, r.change10 && `10 lat: ${r.change10}`].filter(Boolean).map((x) => h(x)).join('<br>')}</td></tr>`,
    )
    .join('');
  return (
    `<div class="mt-8 overflow-x-auto"><table class="w-full text-base"><caption class="text-left text-lg font-bold pb-2">Wskaźniki GUS: ${h(page.name)}</caption>` +
    `<thead><tr class="text-left text-sm text-olowek"><th scope="col" class="pb-2 pr-3">Wskaźnik</th><th scope="col" class="pb-2 pr-3">Wartość i rok</th><th scope="col" class="pb-2 pr-3">Miejsce</th><th scope="col" class="pb-2">Zmiana</th></tr></thead>` +
    `<tbody>${rows}</tbody></table></div>`
  );
}

/** Pełny dokument HTML strony miejsca: czytelny bez JavaScriptu, bez kodu mapy. */
export function renderUnitPage(page: UnitPage, assets: PageAssets): string {
  const url = absoluteUrl(page.path);
  const robots = page.indexable ? '' : '<meta name="robots" content="noindex,follow">';
  const crumbs = [{ label: 'Faktografia', path: '/' }, ...[...page.links.parents].reverse()];
  const nav = `<nav aria-label="Okruszki" class="text-sm text-olowek"><ol class="flex flex-wrap gap-x-2">${crumbs
    .map((c) => `<li><a class="underline" href="${escapeAttr(c.path)}">${h(c.label)}</a> /</li>`)
    .join('')}<li aria-current="page">${h(page.name)}</li></ol></nav>`;
  const places = (assets.localities ?? []).slice(0, MAX_LOCALITIES);
  const localities = places.length
    ? `<section class="mt-8"><h2 class="text-lg font-bold">Miejscowości w gminie</h2><p class="mt-2 text-sm">${places.map(h).join(', ')}.</p></section>`
    : '';
  const source = `Źródło: GUS, Bank Danych Lokalnych, licencja CC BY 4.0 · dane z ${h(page.lastmod.slice(0, 10))}`;
  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="/theme-init.js"></script>
<title>${h(page.title)}</title>
<meta name="description" content="${escapeAttr(page.description)}">
<link rel="canonical" href="${escapeAttr(url)}">
${robots}
<link rel="icon" type="image/svg+xml" href="/brand/faktografia-favicon.svg">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Faktografia">
<meta property="og:locale" content="pl_PL">
<meta property="og:title" content="${escapeAttr(page.title)}">
<meta property="og:description" content="${escapeAttr(page.description)}">
<meta property="og:url" content="${escapeAttr(url)}">
<meta property="og:image" content="${escapeAttr(SITE_URL + OG_IMAGE_PATH)}">
<meta property="og:image:width" content="${OG_IMAGE_WIDTH}">
<meta property="og:image:height" content="${OG_IMAGE_HEIGHT}">
<meta name="twitter:card" content="summary_large_image">
${assets.cssHrefs.map((c) => `<link rel="stylesheet" href="${escapeAttr(c)}">`).join('\n')}
${jsonLd(page, assets)}
</head>
<body class="bg-kalka text-tusz">
<header class="border-b border-linia"><div class="mx-auto max-w-3xl px-4 py-3"><a href="/" class="inline-flex min-h-11 items-center"><img src="/brand/faktografia-logo-granat.svg" alt="Faktografia" height="40" class="h-10 w-auto"></a></div></header>
<main class="mx-auto max-w-3xl px-4 py-6">
${nav}
<h1 class="mt-4 text-3xl font-extrabold">${h(page.h1)}</h1>
<p class="mt-1 text-olowek">${h(page.kindLabel)}</p>
<div class="mt-4 space-y-2">${page.lead.map((s) => `<p>${h(s)}</p>`).join('')}</div>
<p class="mt-6"><a class="inline-flex min-h-11 items-center bg-tusz px-5 text-arkusz font-medium" href="${escapeAttr(`/mapa?u=${page.teryt}&l=${assets.mapLevel}`)}">Otwórz na mapie</a></p>
${table(page)}
${section('Nadrzędne', page.links.parents)}
${section('W środku', page.links.children)}
${section('Podobne pod względem liczby ludności', page.links.neighbors)}
${localities}
</main>
<footer class="mx-auto max-w-3xl px-4 py-6 text-sm text-olowek border-t border-linia"><p>${source}</p><p class="mt-1"><a class="underline" href="/miejsca">Miejsca</a> · <a class="underline" href="/zrodla">Skąd są dane</a> · <a class="underline" href="/o-projekcie">O projekcie</a></p></footer>
</body>
</html>
`;
}
