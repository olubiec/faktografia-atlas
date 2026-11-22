import { renderDocument } from './document';
import { escapeAttr, escapeHtml as h } from './html';
import { rankingDatasetLd, serializeLd } from './json-ld';
import { absoluteUrl } from './site';
import type { RankingPage } from './ranking-page';

export interface RankingLink { label: string; path: string }

/** Strona rankingu: zdanie wstępne, objaśnienie, tabela (miejsce, miejsce w serwisie, wartość), linki do pokrewnych rankingów. */
export function renderRankingPage(page: RankingPage, related: RankingLink[], cssHrefs: string[], noindex: boolean): string {
  const rows = page.rows
    .map(
      (r) =>
        `<tr class="border-t border-linia"><td class="py-2 pr-3 text-olowek">${h(r.rank)}.</td>` +
        `<th scope="row" class="py-2 pr-3 text-left font-medium"><a class="underline" href="${escapeAttr(r.path)}">${h(r.label)}</a></th>` +
        `<td class="py-2 whitespace-nowrap">${h(r.value)}</td></tr>`,
    )
    .join('');
  const note = page.truncated ? `<p class="mt-2 text-sm text-olowek">Tabela pokazuje 100 najwyższych i 100 najniższych wyników spośród ${h(page.total)}. Pełne zestawienia są w rankingach województw.</p>` : '';
  const explanation = page.explanation
    ? `<p class="mt-4">${h(page.explanation.short)} ${h(page.explanation.howToRead)}</p><p class="mt-1 text-sm"><a class="underline" href="${escapeAttr(page.explanation.definitionUrl)}" rel="noreferrer">Definicja wskaźnika (GUS)</a></p>`
    : '';
  const relatedHtml = related.length
    ? `<section class="mt-8"><h2 class="text-lg font-bold">Podobne rankingi</h2><ul class="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">${related.map((l) => `<li><a class="underline" href="${escapeAttr(l.path)}">${h(l.label)}</a></li>`).join('')}</ul></section>`
    : '';
  const url = absoluteUrl(page.path);
  const crumbs = [
    { name: 'Faktografia', item: absoluteUrl('/') },
    { name: 'Miejsca', item: absoluteUrl('/miejsca') },
    { name: page.h1, item: url },
  ];
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, ...c })),
  };
  const main =
    `<h1 class="text-3xl font-extrabold">${h(page.h1)}</h1>` +
    `<p class="mt-4">${h(page.intro)}</p>${explanation}` +
    `<p class="mt-6"><a class="inline-flex min-h-11 items-center bg-tusz px-5 text-arkusz font-medium" href="${escapeAttr(page.mapHref)}">Zobacz na mapie</a></p>` +
    `<div class="mt-8 overflow-x-auto"><table class="w-full text-base"><caption class="text-left text-lg font-bold pb-2">${h(page.h1)}</caption>` +
    `<thead><tr class="text-left text-sm text-olowek"><th scope="col" class="pb-2 pr-3">Miejsce</th><th scope="col" class="pb-2 pr-3">Nazwa</th><th scope="col" class="pb-2">Wartość (${h(page.year)})</th></tr></thead><tbody>${rows}</tbody></table></div>` +
    `${note}${relatedHtml}`;
  return renderDocument({
    title: page.title,
    description: page.description,
    url,
    noindex,
    cssHrefs,
    ld: [rankingDatasetLd(page.title, page.year, url, page.intro), breadcrumb].map((d) => `<script type="application/ld+json">${serializeLd(d)}</script>`),
    main,
  });
}
