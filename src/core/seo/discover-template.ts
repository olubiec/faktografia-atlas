// Statyczne dokumenty tematów, zestawień i ich spisu (W26-F04). Ten sam szkielet co strony miejsc i rankingi.
// Klasy tylko z istniejących szablonów (Tailwind skanuje src); każda wartość przez escapeHtml / escapeAttr.
import { escapeAttr as attr, escapeHtml as text } from './html';
import type { LdObject } from './json-ld';
import type { ListPage, ListRow } from './list-page';
import { a, breadcrumbLd, crumbNav, H2, mapButton, renderDocument, SECTION, type PageAssets } from './page-template';
import { H1, TABLE } from './ranking-template';
import { absoluteUrl } from './site';
import type { TopicPage } from './topic-page';
import { DISCOVER_INDEX, DISCOVER_INDEX_NAME, listPath, plural, type Topic } from './topics';
import type { PageLink } from './unit-page';
import type { ListDef } from '../facts/lists';

const MONO = 'font-mono tabular-nums whitespace-nowrap';
/** Przycisk w stylu serwisu (obrys, pole ≥ 44 px); główny = pełny granat. */
export const BTN = 'inline-flex min-h-[44px] items-center justify-center border border-linia bg-arkusz px-4 py-2 text-sm font-bold text-tusz no-underline hover:bg-linia/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tusz';
const BTN_ON = 'inline-flex min-h-[44px] min-w-11 items-center justify-center border border-tusz bg-tusz px-4 py-2 text-sm font-bold text-arkusz no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tusz';
const ul = (links: readonly PageLink[]) =>
  `<ul class="mt-3 flex flex-wrap gap-3">${links.filter((l) => l.path).map((l) => `<li>${a(l.path, l.name, BTN)}</li>`).join('')}</ul>`;
const section = (id: string, title: string, body: string) =>
  body ? `<section aria-labelledby="${id}" class="${SECTION}"><h2 id="${id}" class="${H2}">${text(title)}</h2>${body}</section>` : '';
const name = (label: string, path: string) => (path ? `<a href="${attr(path)}">${text(label)}</a>` : text(label));

function itemListLd(page: ListPage): LdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: page.h1,
    description: page.description,
    url: absoluteUrl(page.path),
    numberOfItems: page.rows.length,
    itemListElement: page.rows.map((r, i) => ({
      '@type': 'ListItem',
      position: page.from + i,
      name: r.name,
      ...(r.path ? { url: absoluteUrl(r.path) } : {}),
    })),
  };
}

const tr = (r: ListRow, change: boolean) =>
  `<tr><td>${r.rank}</td><td>${name(r.name, r.path)}</td>${change ? `<td class="${MONO}">${text(r.change ?? '–')}</td>` : ''}<td>${text(r.value)}</td></tr>`;

function listTable(page: ListPage): string {
  if (page.rows.length === 0) return '';
  const change = page.fromYear !== null;
  const heads = ['Miejsce', page.column, ...(change ? [`Zmiana ${page.fromYear}–${page.year}`] : []), `Wartość ${page.year}`];
  return section(
    'tabela',
    'Tabela',
    `<div class="mt-3 overflow-x-auto"><table class="${TABLE}">
<caption class="pb-2 text-left text-olowek">${text(page.h1)}</caption>
<thead><tr>${heads.map((h) => `<th scope="col">${text(h)}</th>`).join('')}</tr></thead>
<tbody>
${page.rows.map((r) => tr(r, change)).join('\n')}
</tbody></table></div>`,
  );
}

const PAGER_LINK = `${BTN} min-w-11 px-3`;

/** Nawigacja po stronach zestawienia: zwykłe linki (działają bez JS), pola ≥ 44 px, bieżąca strona z aria-current. */
function pager(page: ListPage, id: string): string {
  if (page.pages <= 1) return '';
  const step = (path: string | null, label: string, rel: string) => (path ? `<a href="${attr(path)}" rel="${rel}" class="${PAGER_LINK}">${text(label)}</a>` : '');
  const numbers = page.nav.map((n) =>
    n === 'gap'
      ? '<span aria-hidden="true" class="px-1 text-olowek">…</span>'
      : n.current
        ? `<a href="${attr(n.path)}" aria-current="page" aria-label="Strona ${n.n}, bieżąca" class="${BTN_ON} px-3">${n.n}</a>`
        : `<a href="${attr(n.path)}" aria-label="Strona ${n.n}" class="${PAGER_LINK}">${n.n}</a>`,
  );
  return `<nav aria-labelledby="${id}" class="mt-6"><p id="${id}" class="text-olowek">Pozycje ${page.from}–${page.to} z ${page.total}</p>
<div class="mt-3 flex flex-wrap items-center gap-2">${[step(page.prev, 'Poprzednia', 'prev'), ...numbers, step(page.next, 'Następna', 'next')].join('')}</div></nav>`;
}

/** Pełny dokument strony zestawienia. */
export function renderListPage(page: ListPage, assets: PageAssets): string {
  const main = `${crumbNav(page.crumbs)}
<h1 class="${H1}">${text(page.h1)}</h1>
<p class="mt-4 max-w-prose">${page.lead.map(text).join(' ')}${page.page > 1 ? ` ${a(page.firstPath, 'Wstęp i objaśnienia są na pierwszej stronie zestawienia.')}` : ''}</p>
<p class="mt-6 flex flex-wrap gap-3">${mapButton(page.mapHref, 'Zobacz na mapie', 'mt-0')}${a(DISCOVER_INDEX, DISCOVER_INDEX_NAME, BTN)}</p>
${listTable(page)}
${pager(page, 'strony-dol')}
${section('zobacz-tez', 'Zobacz też', ul(page.related))}`;
  return renderDocument({ ...page, ld: [itemListLd(page), breadcrumbLd(page.crumbs)] }, main, assets);
}

function measures(page: TopicPage): string {
  const items = page.indicators.map(
    (i) =>
      `<li class="mt-4"><h3 class="font-bold">${text(i.name)}</h3>${i.about ? `<p class="max-w-prose">${text(i.about)}</p>` : ''}<span class="flex flex-wrap gap-x-6">${i.rankings
        .map((r) => a(r.path, r.name))
        .join('')}</span></li>`,
  );
  return `<ul class="mt-3">${items.join('')}</ul>`;
}

function extremesTable(page: TopicPage): string {
  const rows = page.indicators.filter((i) => i.high && i.low);
  if (rows.length === 0) return '';
  const cell = (e: NonNullable<TopicPage['indicators'][number]['high']>) => `${name(e.name, e.path)} <span class="${MONO}">${text(e.value)}</span>`;
  return `<div class="mt-3 overflow-x-auto"><table class="${TABLE}">
<caption class="pb-2 text-left text-olowek">${text(page.topic.name)}: najwyższa i najniższa wartość wśród powiatów i miast na prawach powiatu</caption>
<thead><tr><th scope="col">Wskaźnik</th><th scope="col">Najwyżej</th><th scope="col">Najniżej</th><th scope="col">Rok</th></tr></thead>
<tbody>
${rows.map((i) => `<tr><td>${text(i.name)}</td><td>${cell(i.high!)}</td><td>${cell(i.low!)}</td><td>${i.year ?? '–'}</td></tr>`).join('\n')}
</tbody></table></div>`;
}

/** Pełny dokument strony tematu. */
export function renderTopicPage(page: TopicPage, assets: PageAssets): string {
  const facts = page.facts.length
    ? `<ul class="mt-3">${page.facts.map((f) => `<li class="mt-2 max-w-prose">${a(f.path, f.name)} – ${text(f.sentence)}</li>`).join('')}</ul>`
    : '';
  const main = `${crumbNav(page.crumbs)}
<h1 class="${H1}">${text(page.h1)}</h1>
<p class="mt-4 max-w-prose">${page.lead.map(text).join(' ')}</p>
${mapButton(page.mapHref, 'Zobacz na mapie')}
${section('co-mierzymy', 'Co mierzymy', measures(page))}
${section('najwyzej-najnizej', 'Najwyżej i najniżej', extremesTable(page))}
${section('fakty', 'Najmocniejsze fakty', facts)}
${section('zestawienia', 'Zestawienia', page.lists.length ? ul(page.lists) : '')}
${section('inne-tematy', 'Inne tematy', ul(page.others))}`;
  return renderDocument({ ...page, indexable: true, ld: [breadcrumbLd(page.crumbs)] }, main, assets);
}

/** Sekcja „Tematy” (spis `/zestawienia`, `/miejsca`): link do każdego tematu. */
export function topicsSection(topics: readonly Topic[], headingId = 'tematy'): string {
  return section(headingId, 'Tematy', ul([{ teryt: '', name: DISCOVER_INDEX_NAME, path: DISCOVER_INDEX }, ...topics.map((t) => ({ teryt: '', name: t.name, path: t.path }))]));
}

/** Spis `/zestawienia`: tematy z ich zestawieniami. */
export function renderDiscoverIndex(topics: readonly Topic[], lists: readonly ListDef[], lastmod: string, assets: PageAssets): string {
  const crumbs = [
    { teryt: '', name: 'Faktografia', path: '/' },
    { teryt: '', name: DISCOVER_INDEX_NAME, path: DISCOVER_INDEX },
  ];
  const groups = topics.map((t, i) => {
    const own = lists.filter((l) => t.indicators.some((ind) => ind.id === l.indicatorId));
    return section(`t${i + 1}`, t.name, `<p class="mt-3">${a(t.path, `Zobacz temat: ${t.name}`, BTN_ON)}</p>${own.length ? ul(own.map((l) => ({ teryt: '', name: l.h1, path: listPath(l.slug) }))) : ''}`);
  });
  const main = `${crumbNav(crumbs)}
<h1 class="${H1}">${DISCOVER_INDEX_NAME}</h1>
<p class="mt-4 max-w-prose">${text(`${plural(topics.length, 'temat', 'tematy', 'tematów')} i ${plural(lists.length, 'zestawienie', 'zestawienia', 'zestawień')} z danych Banku Danych Lokalnych GUS. Każde zestawienie obejmuje całą listę porównanych jednostek, po 50 pozycji na stronę, z linkami do stron miejsc.`)}</p>
${groups.join('\n')}`;
  const doc = {
    path: DISCOVER_INDEX,
    title: 'Tematy i zestawienia gmin i powiatów – dane GUS',
    description: `${plural(lists.length, 'zestawienie', 'zestawienia', 'zestawień')} gmin i powiatów Polski w ${plural(topics.length, 'temacie', 'tematach', 'tematach')}: ludność, praca, pieniądze, mieszkania i inne. Dane GUS.`,
    indexable: true,
    lastmod,
    ld: [breadcrumbLd(crumbs)],
  };
  return renderDocument(doc, main, assets);
}
