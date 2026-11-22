import { escapeAttr, escapeHtml as h } from './html';
import { OG_IMAGE_PATH, SITE_URL, absoluteUrl } from './site';
import { isCityCounty, type SlugUnit, type UnitPaths } from './slug';

export const PLACES_PATH = '/miejsca';
const TITLE = 'Miejsca – województwa, powiaty i miasta – Faktografia';
const DESCRIPTION =
  'Spis stron z danymi GUS: 16 województw, powiaty i miasta na prawach powiatu. Wybierz miejsce, by zobaczyć liczby, rankingi i zmiany w czasie.';

const a = (path: string, label: string) => `<a class="underline text-tusz hover:text-olowek" href="${escapeAttr(path)}">${h(label)}</a>`;

/** Spis miejsc (`/miejsca`): województwa, a w nich powiaty i miasta na prawach powiatu. Statyczny, indeksowany. */
export function renderPlacesPage(units: readonly SlugUnit[], paths: UnitPaths, cssHrefs: string[]): string {
  const woj = units.filter((u) => u.level === 'woj').sort((x, y) => x.name.localeCompare(y.name, 'pl'));
  const sections = woj
    .map((w) => {
      const kids = units
        .filter((u) => u.level === 'pow' && u.parent === w.teryt)
        .sort((x, y) => x.name.replace(/^powiat\s+/i, '').localeCompare(y.name.replace(/^powiat\s+/i, ''), 'pl'));
      const counties = kids.filter((u) => !isCityCounty(u.teryt));
      const cities = kids.filter((u) => isCityCounty(u.teryt));
      const list = (items: SlugUnit[]) =>
        items.map((u) => `<li>${a(paths.byTeryt.get(u.teryt)!, u.name.replace(/^powiat\s+/i, (m) => (isCityCounty(u.teryt) ? '' : m)))}</li>`).join('');
      return (
        `<section class="mt-8"><h2 class="text-xl font-bold">${a(paths.byTeryt.get(w.teryt)!, `Województwo ${w.name}`)}</h2>` +
        `<h3 class="mt-3 font-medium">Powiaty</h3><ul class="mt-1 flex flex-wrap gap-x-4 gap-y-2 text-sm">${list(counties)}</ul>` +
        (cities.length ? `<h3 class="mt-3 font-medium">Miasta na prawach powiatu</h3><ul class="mt-1 flex flex-wrap gap-x-4 gap-y-2 text-sm">${list(cities)}</ul>` : '') +
        `</section>`
      );
    })
    .join('\n');
  const url = absoluteUrl(PLACES_PATH);
  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="/theme-init.js"></script>
<title>${h(TITLE)}</title>
<meta name="description" content="${escapeAttr(DESCRIPTION)}">
<link rel="canonical" href="${escapeAttr(url)}">
<link rel="icon" type="image/svg+xml" href="/brand/faktografia-favicon.svg">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Faktografia">
<meta property="og:locale" content="pl_PL">
<meta property="og:title" content="${escapeAttr(TITLE)}">
<meta property="og:description" content="${escapeAttr(DESCRIPTION)}">
<meta property="og:url" content="${escapeAttr(url)}">
<meta property="og:image" content="${escapeAttr(SITE_URL + OG_IMAGE_PATH)}">
<meta name="twitter:card" content="summary_large_image">
${cssHrefs.map((c) => `<link rel="stylesheet" href="${escapeAttr(c)}">`).join('\n')}
</head>
<body class="bg-kalka text-tusz">
<header class="border-b border-linia"><div class="mx-auto max-w-3xl px-4 py-3"><a href="/" class="inline-flex min-h-11 items-center"><img src="/brand/faktografia-logo-granat.svg" alt="Faktografia" height="40" class="h-10 w-auto"></a></div></header>
<main class="mx-auto max-w-3xl px-4 py-6">
<h1 class="text-3xl font-extrabold">Miejsca</h1>
<p class="mt-2">Województwa, powiaty i miasta na prawach powiatu z danymi GUS. Gminy są na stronach powiatów.</p>
<p class="mt-4"><a class="inline-flex min-h-11 items-center bg-tusz px-5 text-arkusz font-medium" href="/mapa">Otwórz mapę</a></p>
${sections}
</main>
<footer class="mx-auto max-w-3xl px-4 py-6 text-sm text-olowek border-t border-linia"><p>Źródło: GUS, Bank Danych Lokalnych, licencja CC BY 4.0</p><p class="mt-1"><a class="underline" href="/zrodla">Skąd są dane</a> · <a class="underline" href="/o-projekcie">O projekcie</a></p></footer>
</body>
</html>
`;
}
