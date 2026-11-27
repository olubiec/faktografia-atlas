import { describe, expect, it } from 'vitest';
import factsConfig from '../../config/facts.json';
import indicatorsData from '../../config/indicators.json';
import listsData from '../../config/lists.json';
import explanationsData from '../fixtures/explanations.json';
import fixture from '../fixtures/f04/opolskie.json';
import { buildList, type ListsConfig } from '../../src/core/facts/lists';
import type { FactIndicator, FactsConfig, FactUnit } from '../../src/core/facts/types';
import type { IndicatorValues } from '../../src/core/profile/profile';
import { buildDiscoverSite } from '../../src/core/seo/discover-site';
import { renderListPage } from '../../src/core/seo/discover-template';
import { buildListPage, buildListPages, listInput, type DiscoverContext } from '../../src/core/seo/list-page';
import { pageNav } from '../../src/core/seo/list-paging';
import { rankingHeadings, rankingSitemap } from '../../src/core/seo/ranking-template';
import { buildUnitPaths } from '../../src/core/seo/slug';

// Pełne zestawienie: cała lista porównanych jednostek, po `rows` pozycji na stronę (KONCEPT-ZESTAWIENIA-KARUZELA §4).
const units = fixture.units as FactUnit[];
const values = fixture.values as unknown as Record<string, IndicatorValues>;
const indicators = indicatorsData as (FactIndicator & { higherIsBetter: boolean | null })[];
const config = factsConfig as unknown as FactsConfig;
const PER_PAGE = 10;
const lists = { ...(listsData as unknown as ListsConfig), rows: PER_PAGE };
const ctx: DiscoverContext = {
  units,
  paths: buildUnitPaths(units),
  headings: rankingHeadings(units),
  indicators,
  explanations: explanationsData.items,
  values,
  lists,
  relativeChangeUnits: config.relativeChangeUnits,
  boundaryJump: config.thresholds.boundaryJump,
};
const ASSETS = { css: ['/assets/index-abc.css'] };
// Zestawienie wartości gmin (mediana wieku): wystarczająco długie, żeby wyszło kilka stron.
const def = lists.lists.find((l) => l.slug === 'najstarsze-gminy')!;
const full = buildList(def, { ...lists, rows: Infinity }, listInput(ctx, indicators.find((i) => i.id === def.indicatorId)!));
const pages = buildListPages(def, ctx);

describe('pełne zestawienie: strony po 50 pozycji', () => {
  it('suma pozycji na stronach = liczba porównanych jednostek, ostatnia strona ma resztę', () => {
    expect(full.compared).toBeGreaterThan(PER_PAGE);
    expect(pages.reduce((n, p) => n + p.rows.length, 0)).toBe(full.compared);
    expect(pages).toHaveLength(Math.ceil(full.compared / PER_PAGE));
    expect(pages.slice(0, -1).every((p) => p.rows.length === PER_PAGE)).toBe(true);
    expect(pages.at(-1)!.rows).toHaveLength(full.compared - PER_PAGE * (pages.length - 1));
  });

  it('miejsca są ciągłe (remisy liczone na całej liście) i zakresy „od–do” się zgadzają', () => {
    expect(pages.flatMap((p) => p.rows.map((r) => r.rank))).toEqual(full.entries.map((e) => e.rank));
    pages.forEach((p, k) => {
      expect([p.page, p.pages, p.total]).toEqual([k + 1, pages.length, full.compared]);
      expect([p.from, p.to]).toEqual([k * PER_PAGE + 1, k * PER_PAGE + p.rows.length]);
    });
  });

  it('strona 1 pod starym adresem, kolejne pod /<slug>/N; buildListPage zwraca stronę 1', () => {
    expect(pages.map((p) => p.path)).toEqual(pages.map((_, k) => `/zestawienie/${def.slug}${k === 0 ? '' : `/${k + 1}`}`));
    expect(buildListPage(def, ctx).path).toBe(pages[0]!.path);
    expect(pages[0]!.prev).toBeNull();
    expect(pages[0]!.next).toBe(`/zestawienie/${def.slug}/2`);
    expect(pages[1]!.prev).toBe(`/zestawienie/${def.slug}`);
    expect(pages.at(-1)!.next).toBeNull();
  });

  it('strony 2+ mają noindex, własny tytuł i opis, a wstęp jest tylko na stronie 1', () => {
    const [first, second] = pages;
    expect(first!.indexable).toBe(true);
    expect(pages.slice(1).every((p) => !p.indexable)).toBe(true);
    expect(second!.title).toContain('strona 2');
    expect(new Set(pages.map((p) => p.title)).size).toBe(pages.length);
    expect(new Set(pages.map((p) => p.description)).size).toBe(pages.length);
    expect(first!.lead.join(' ')).toContain('Mediana');
    expect(second!.lead).toHaveLength(1);
    expect(renderListPage(second!, ASSETS)).toContain('content="noindex,follow"');
    expect(renderListPage(first!, ASSETS)).toContain('content="index,follow"');
  });

  it('nawigacja: zwykłe linki, aria-current, pierwsza i ostatnia strona, pola ≥ 44 px; bez nawigacji przy jednej stronie', () => {
    const html = renderListPage(pages[1]!, ASSETS);
    expect(html).toContain('aria-current="page"');
    expect(html.match(/aria-current="page" aria-label="Strona 2, bieżąca"/g)).toHaveLength(1); // tylko pod tabelą (u góry strony nawigacji nie ma)
    expect(html).toContain(`href="/zestawienie/${def.slug}"`);
    expect(html).toContain(`href="/zestawienie/${def.slug}/${pages.length}"`);
    expect(html).toContain('rel="prev"');
    expect(html).toContain('rel="next"');
    expect(html).toContain('min-h-[44px]');
    expect(html).toContain(`Pozycje ${pages[1]!.from}–${pages[1]!.to} z ${full.compared}`);
    const single = buildListPages(def, { ...ctx, lists: { ...lists, rows: 1000 } });
    expect(single).toHaveLength(1);
    expect(renderListPage(single[0]!, ASSETS)).not.toContain('Strony zestawienia');
    expect(renderListPage(single[0]!, ASSETS)).not.toContain('bieżąca');
  });

  it('numery stron: pierwsza, ostatnia, bieżąca i dwie sąsiednie, resztę zastępuje „…”', () => {
    const label = (nav: ReturnType<typeof pageNav>) => nav.map((n) => (n === 'gap' ? '…' : n.n)).join(' ');
    expect(label(pageNav('/x', 1, 35))).toBe('1 2 … 35');
    expect(label(pageNav('/x', 18, 35))).toBe('1 … 17 18 19 … 35');
    expect(label(pageNav('/x', 35, 35))).toBe('1 … 34 35');
    expect(label(pageNav('/x', 2, 4))).toBe('1 2 3 4');
    expect(pageNav('/x', 3, 5).find((n) => n !== 'gap' && n.current)).toMatchObject({ n: 3, path: '/x/3' });
  });

  it('w mapie strony tylko strona 1; dane strukturalne mają ciągłe pozycje', () => {
    const site = buildDiscoverSite(ctx, [], ASSETS);
    const urls = [...rankingSitemap(site).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
    expect(urls.some((u) => u.endsWith(`/zestawienie/${def.slug}`))).toBe(true);
    expect(urls.some((u) => /\/zestawienie\/[^/]+\/\d+$/.test(u))).toBe(false);
    const ld = [...renderListPage(pages[1]!, ASSETS).matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)].map((m) => JSON.parse(m[1]!));
    const list = ld.find((x) => x['@type'] === 'ItemList');
    expect(list.itemListElement[0].position).toBe(PER_PAGE + 1);
  });
});
