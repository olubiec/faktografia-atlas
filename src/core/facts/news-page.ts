// Dokumenty „Nowe dane GUS” (W26-F05): strona `/nowe-dane/<wskaźnik>-<rok>` i spis `/nowe-dane`.
// Ten sam szkielet co tematy i zestawienia; klasy tylko z istniejących szablonów, każda wartość przez escapeHtml / escapeAttr.
import { escapeAttr as attr, escapeHtml as text } from '../seo/html';
import { a, breadcrumbLd, crumbNav, H2, mapButton, renderDocument, SECTION, type PageAssets } from '../seo/page-template';
import { H1, TABLE } from '../seo/ranking-template';
import { buildNewsPage, NEWS_INDEX_NAME, NEWS_ROOT, type NewsContext, type NewsEntry, type NewsPage, type NewsRow } from './news';

export const NEWS_SITEMAP = 'sitemap-nowe-dane.xml';
const MONO = 'font-mono tabular-nums whitespace-nowrap';

const name = (r: NewsRow) => (r.path ? `<a href="${attr(r.path)}">${text(r.name)}</a>` : text(r.name));

function table(id: string, title: string, rows: readonly NewsRow[], page: NewsPage, changeHead: string): string {
  if (rows.length === 0) return '';
  return `<section aria-labelledby="${id}" class="${SECTION}"><h2 id="${id}" class="${H2}">${text(title)}</h2>
<div class="mt-3 overflow-x-auto"><table class="${TABLE}">
<caption class="pb-2 text-left text-olowek">${text(`${title} – ${page.h1}`)}</caption>
<thead><tr><th scope="col">${text(page.column)}</th><th scope="col">${text(changeHead)}</th><th scope="col">${text(`Wartość ${page.entry.year}`)}</th></tr></thead>
<tbody>
${rows.map((r) => `<tr><td>${name(r)}</td><td class="${MONO}">${text(r.change)}</td><td>${text(r.value)}</td></tr>`).join('\n')}
</tbody></table></div></section>`;
}

/** Pełny dokument strony „Nowe dane GUS”. */
export function renderNewsPage(page: NewsPage, assets: PageAssets): string {
  const change = `Zmiana ${page.entry.year - 1}–${page.entry.year}`;
  const links = page.related.map((l) => `<li>${a(l.path, l.name)}</li>`).join('');
  const main = `${crumbNav(page.crumbs)}
<h1 class="${H1}">${text(page.h1)}</h1>
<p class="mt-4 max-w-prose">${page.lead.map(text).join(' ')}</p>
${mapButton(page.mapHref, 'Zobacz na mapie')}
${table('wzrosty', 'Największe wzrosty', page.rises, page, change)}
${table('spadki', 'Największe spadki', page.falls, page, change)}
${table('rekordy', 'Rekordy serii', page.records, page, 'Rekord')}
<section aria-labelledby="zobacz-tez" class="${SECTION}"><h2 id="zobacz-tez" class="${H2}">Zobacz też</h2><ul class="mt-3 flex flex-wrap gap-x-6">${links}</ul></section>`;
  return renderDocument({ ...page, ld: [breadcrumbLd(page.crumbs)] }, main, assets);
}

function renderNewsIndex(pages: readonly NewsPage[], lastmod: string, assets: PageAssets): string {
  const crumbs = [
    { teryt: '', name: 'Faktografia', path: '/' },
    { teryt: '', name: NEWS_INDEX_NAME, path: NEWS_ROOT },
  ];
  const items = pages.map((p) => `<li>${a(p.path, p.h1)}</li>`).join('');
  const main = `${crumbNav(crumbs)}
<h1 class="${H1}">${text(NEWS_INDEX_NAME)}</h1>
<p class="mt-4 max-w-prose">Co zmieniło się po każdej nowej publikacji GUS: największe wzrosty, spadki i rekordy w gminach i powiatach.</p>
<ul class="mt-3">${items}</ul>`;
  const doc = {
    path: NEWS_ROOT,
    title: 'Nowe dane GUS – co się zmieniło w gminach i powiatach',
    description: 'Strony po nowych publikacjach GUS: największe wzrosty, spadki i rekordy w gminach i powiatach, porównane z rokiem wcześniej.',
    indexable: true,
    ld: [breadcrumbLd(crumbs)],
    lastmod,
  };
  return renderDocument(doc, main, assets);
}

export interface BuiltNewsPage {
  path: string;
  html: string;
  indexable: boolean;
  lastmod: string;
}

/** Strony z public/data/news.json (zatwierdzone PR-em robota) i ich spis; brak pozycji = brak stron. */
export function buildNewsSite(entries: readonly NewsEntry[], ctx: NewsContext, assets: PageAssets): { pages: BuiltNewsPage[]; skipped: NewsEntry[] } {
  const models: NewsPage[] = [];
  const skipped: NewsEntry[] = [];
  for (const e of entries) {
    const page = buildNewsPage(e, ctx);
    if (page) models.push(page);
    else skipped.push(e);
  }
  if (models.length === 0) return { pages: [], skipped };
  // Najnowsze na górze spisu.
  models.sort((x, y) => y.entry.year - x.entry.year || x.path.localeCompare(y.path));
  const pages = models.map((p) => ({ path: p.path, html: renderNewsPage(p, assets), indexable: p.indexable, lastmod: p.lastmod }));
  const lastmod = models.map((p) => p.lastmod).sort().at(-1)!;
  pages.push({ path: NEWS_ROOT, html: renderNewsIndex(models, lastmod, assets), indexable: true, lastmod });
  return { pages, skipped };
}
