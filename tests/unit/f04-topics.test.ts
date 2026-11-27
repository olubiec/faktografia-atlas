import { describe, expect, it } from 'vitest';
import factsConfig from '../../config/facts.json';
import indicatorsData from '../../config/indicators.json';
import listsData from '../../config/lists.json';
import explanationsData from '../fixtures/explanations.json';
import fixture from '../fixtures/f04/opolskie.json';
import seoUnits from '../fixtures/seo/units.json';
import { buildFacts } from '../../src/core/facts/build';
import { buildList, type ListsConfig } from '../../src/core/facts/lists';
import type { FactIndicator, FactsConfig, FactUnit } from '../../src/core/facts/types';
import type { IndicatorValues } from '../../src/core/profile/profile';
import { auditPages, readPage, summarize } from '../../src/core/seo/audit';
import { buildDiscoverSite, DISCOVER_SITEMAP, factsFromShards, validateLists } from '../../src/core/seo/discover-site';
import { renderListPage, topicsSection } from '../../src/core/seo/discover-template';
import { buildListPage, listInput, type DiscoverContext } from '../../src/core/seo/list-page';
import { buildRankingPage, type RankingContext } from '../../src/core/seo/ranking-page';
import { rankingHeadings, rankingSitemap, rankingSpecs } from '../../src/core/seo/ranking-template';
import { canonicalFor } from '../../src/core/seo/site';
import { buildUnitPaths, type SlugUnit } from '../../src/core/seo/slug';
import { topicsOf } from '../../src/core/seo/topics';

// Dane: wycinek prawdziwych serii GUS dla województwa opolskiego (84 jednostki, 20 wskaźników, lata od 2013).
const units = fixture.units as FactUnit[];
const values = fixture.values as unknown as Record<string, IndicatorValues>;
const indicators = indicatorsData as (FactIndicator & { higherIsBetter: boolean | null })[];
const lists = listsData as unknown as ListsConfig;
const config = factsConfig as unknown as FactsConfig;
const paths = buildUnitPaths(units);
const ASSETS = { css: ['/assets/index-abc.css'] };
const ctx: DiscoverContext = {
  units,
  paths,
  headings: rankingHeadings(units),
  indicators,
  explanations: explanationsData.items,
  values,
  lists,
  relativeChangeUnits: config.relativeChangeUnits,
  boundaryJump: config.thresholds.boundaryJump,
};
const facts = [...buildFacts({ indicators, values, units, config }).byUnit.values()].flatMap((u) => u.selected);
const site = buildDiscoverSite(ctx, facts, ASSETS);
const audited = site.map((p) => readPage(p.path, p.html));
const sitemap = rankingSitemap(site);
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
/** Adresy, które generator buduje obok tych stron: miejsca, rankingi, strony aplikacji. */
const known = ['/', '/mapa', '/ranking', '/miejsca', ...paths.terytByPath.keys(), ...rankingSpecs(indicators, units).map((s) => s.path)];
const lastPopulation = (teryt: string) => values.population!.values[teryt]!.filter((v) => v != null).at(-1)!;
const OPOLE = '1661011';
const growth = lists.lists.find((l) => l.slug === 'najszybciej-rosnace-gminy')!;

describe('F04 tematy i zestawienia: lista stron', () => {
  it('7 tematów z grup config/indicators.json pod /temat/<grupa>', () => {
    expect(topicsOf(indicators).map((t) => t.path)).toEqual([
      '/temat/ludnosc',
      '/temat/praca',
      '/temat/pieniadze',
      '/temat/mieszkania',
      '/temat/srodowisko',
      '/temat/zycie',
      '/temat/transport',
    ]);
    expect(site.filter((p) => p.kind === 'topic')).toHaveLength(7);
  });

  it('config/lists.json: ok. 25 zestawień, poprawne i bez powtórzeń', () => {
    expect(lists.lists.length).toBeGreaterThanOrEqual(20);
    expect(lists.lists.length).toBeLessThanOrEqual(30);
    expect(lists.gminaMinPopulation).toBe(5000);
    expect(validateLists(ctx)).toEqual([]);
    expect(validateLists({ ...ctx, lists: { ...lists, lists: [...lists.lists, { ...lists.lists[0]!, slug: 'Zła Nazwa' }] } })).toHaveLength(3);
    // Strona 1 każdego zestawienia pod adresem zestawienia; kolejne strony (`/<slug>/N`) zostają w osobnych testach (list-pages).
    expect(site.filter((p) => p.kind === 'list' && !/\/\d+$/.test(p.path)).map((p) => p.path)).toEqual(lists.lists.map((l) => `/zestawienie/${l.slug}`));
  });

  it('każdy temat i zestawienie: unikalny tytuł i opis, jeden H1, własny adres kanoniczny, w mapie strony', () => {
    const pages = audited.filter((p) => p.path.startsWith('/temat/') || (p.path.startsWith('/zestawienie/') && !/\/\d+$/.test(p.path)));
    expect(pages).toHaveLength(7 + lists.lists.length);
    expect(new Set(pages.map((p) => p.title)).size).toBe(pages.length);
    expect(new Set(pages.map((p) => p.description)).size).toBe(pages.length);
    const bad = pages.filter(
      (p) =>
        p.h1Count !== 1 ||
        p.canonical !== canonicalFor(p.path) ||
        p.noindex ||
        p.title.length > 65 ||
        p.description.length < 70 ||
        p.description.length > 160 ||
        !sitemapUrls.includes(canonicalFor(p.path)),
    );
    expect(bad).toEqual([]);
    expect(sitemapUrls).toContain(canonicalFor('/zestawienia'));
    expect(DISCOVER_SITEMAP).toBe('sitemap-tematy.xml');
  });

  it('strony przechodzą audyt S08 bez błędów i bez ostrzeżeń o długości', () => {
    const issues = auditPages(audited, sitemapUrls, { knownPaths: known });
    const { errors, warnings } = summarize(issues);
    expect(errors).toEqual([]);
    expect(warnings.filter((w) => w.code === 'title-length' || w.code === 'description-length')).toEqual([]);
    // Każdy temat i zestawienie ma link z innej nowej strony (spis, temat, inne tematy).
    expect(warnings.filter((w) => w.code === 'no-incoming-link')).toEqual([]);
  });
});

describe('F04 zestawienie zmian 10 lat', () => {
  const result = buildList(growth, lists, listInput(ctx, indicators.find((i) => i.id === 'population')!));

  it('pomija gminy poniżej 5 000 mieszkańców', () => {
    const small = units.filter((u) => u.level === 'gmi' && lastPopulation(u.teryt) < 5000).map((u) => u.teryt);
    expect(small.length).toBeGreaterThan(0);
    expect(result.skippedSmall).toBe(small.length);
    for (const e of result.entries) expect(lastPopulation(e.teryt)).toBeGreaterThanOrEqual(5000);
    // Bez progu małe gminy wracają do porównania – próg działa, a nie brak danych.
    const all = buildList(growth, { ...lists, gminaMinPopulation: 0, rows: 1000 }, listInput(ctx, indicators[0]!));
    expect(all.entries.some((e) => small.includes(e.teryt))).toBe(true);
  });

  it('pomija okna ze zmianą granic (Opole, 2017)', () => {
    expect(result.year).toBe(2025);
    expect(result.fromYear).toBe(2015);
    expect(result.skippedBoundary).toBeGreaterThanOrEqual(1);
    expect(result.entries.map((e) => e.teryt)).not.toContain(OPOLE);
    // Bez detektora Opole (przyłączone sołectwa w 2017 r.) wróciłoby do porównania.
    const blind = buildList(growth, { ...lists, rows: 1000 }, { ...listInput(ctx, indicators[0]!), boundaryJump: Infinity });
    expect(blind.skippedBoundary).toBe(0);
    expect(blind.entries.map((e) => e.teryt)).toContain(OPOLE);
  });

  it('kolejność od największego wzrostu, zmiana procentowa i wstęp z liczbami z danych', () => {
    const changes = result.entries.map((e) => e.change!);
    expect(changes).toEqual([...changes].sort((a, b) => b - a));
    const first = result.entries[0]!;
    const v = values.population!;
    const series = v.values[first.teryt]!;
    expect(first.value).toBe(series[v.years.indexOf(2025)]);
    expect(first.change).toBeCloseTo((first.value - first.fromValue!) / first.fromValue!, 10);
    const page = buildListPage(growth, ctx);
    expect(page.lead.join(' ')).toContain('w 2015 i 2025 r.');
    expect(page.lead.join(' ')).toContain('zmiany granic');
    expect(page.rows[0]!.change).toMatch(/^\+\d/);
  });

  it('zestawienie wartości: od najniższej przy dir −1, remisy z tym samym miejscem', () => {
    const def = lists.lists.find((l) => l.slug === 'powiaty-z-najnizszym-bezrobociem')!;
    const r = buildList(def, lists, listInput(ctx, indicators.find((i) => i.id === def.indicatorId)!));
    expect(r.entries).toHaveLength(12);
    const vals = r.entries.map((e) => e.value);
    expect(vals).toEqual([...vals].sort((a, b) => a - b));
    const expected = r.entries.map((e, i) => r.entries.findIndex((x) => x.value === e.value) + 1 || i + 1);
    expect(r.entries.map((e) => e.rank)).toEqual(expected);
  });
});

describe('F04 linki i dane strukturalne', () => {
  it('brak martwych linków wewnętrznych z nowych stron', () => {
    const knownSet = new Set([...known, ...audited.map((p) => p.path)]);
    const dead = audited.flatMap((p) => p.links.filter((l) => !knownSet.has(l)).map((l) => `${p.path} → ${l}`));
    expect(dead).toEqual([]);
    const issues = auditPages(audited, sitemapUrls, { knownPaths: known });
    expect(issues.filter((i) => i.code === 'dead-link')).toEqual([]);
    // Zestawienie linkuje do stron miejsc, rankingu i tematu; temat – do rankingów i zestawień.
    const list = audited.find((p) => p.path === '/zestawienie/najszybciej-rosnace-gminy')!;
    expect(list.links).toContain('/ranking/ludnosc-ogolem/gminy');
    expect(list.links).toContain('/temat/ludnosc');
    expect(list.links.some((l) => l.startsWith('/gmina/'))).toBe(true);
    const topic = audited.find((p) => p.path === '/temat/mieszkania')!;
    expect(topic.links).toContain('/zestawienie/gminy-gdzie-buduje-sie-najwiecej');
    expect(topic.links.filter((l) => l.startsWith('/ranking/'))).toHaveLength(6);
  });

  it('zestawienie ma ItemList w JSON-LD, tabelę ≤ 50 pozycji i link do mapy', () => {
    const html = site.find((p) => p.path === '/zestawienie/najbogatsze-gminy')!.html;
    const ld = [...html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)].map((m) => JSON.parse(m[1]!));
    const itemList = ld.find((x) => x['@type'] === 'ItemList');
    expect(itemList.itemListElement.length).toBeGreaterThan(0);
    expect(itemList.itemListElement.length).toBeLessThanOrEqual(50);
    expect(itemList.itemListElement[0]).toMatchObject({ '@type': 'ListItem', position: 1 });
    expect(itemList.itemListElement[0].url).toMatch(/^https:\/\/faktografia\.eu\//);
    expect(html).toContain('href="/mapa?i=income-per-capita&amp;l=gmi"');
    expect(html.match(/<tbody>[\s\S]*<\/tbody>/)![0].match(/<tr>/g)!.length).toBe(itemList.itemListElement.length);
  });

  it('temat ma 3 najsilniejsze fakty, najwyżej/najniżej i spis linkuje każdy temat', () => {
    const html = site.find((p) => p.path === '/temat/ludnosc')!.html;
    const factsSection = html.match(/<section aria-labelledby="fakty"[\s\S]*?<\/section>/)![0];
    expect(factsSection.match(/<li/g)).toHaveLength(3);
    expect(html).toContain('Najwyżej i najniżej');
    const index = site.find((p) => p.path === '/zestawienia')!.html;
    for (const t of topicsOf(indicators)) expect(index).toContain(`href="${t.path}"`);
    expect(topicsSection(topicsOf(indicators)).match(/href="\/temat\//g)).toHaveLength(7);
    expect(factsFromShards([{ units: { '16': [['F1', 'population', 2025, 1, 2, 1, 1, 16, 0]] } }])[0]).toMatchObject({ teryt: '16', type: 'F1' });
  });

  it('nazwa z HTML nie tworzy znaczników', () => {
    const page = buildListPage(growth, ctx);
    const evil = '<img src=x onerror=alert(1)>';
    const html = renderListPage({ ...page, h1: evil, rows: page.rows.map((r) => ({ ...r, name: evil })) }, ASSETS);
    expect(html).not.toContain('<img src=x');
  });
});

describe('F04 krótsze tytuły rankingów (ostrzeżenia S08)', () => {
  it('wszystkie 380 tytułów rankingów ≤ 65 znaków i unikalne', () => {
    const all = seoUnits as SlugUnit[];
    const rctx: RankingContext = {
      units: all,
      paths: buildUnitPaths(all),
      headings: rankingHeadings(all),
      indicators,
      explanations: [],
      indexGminy: false,
    };
    const v = (id: string): IndicatorValues => ({
      indicatorId: id,
      years: [2025],
      values: Object.fromEntries(all.map((u) => [u.teryt, [Number(u.teryt) / 1000]])),
      fetchedAt: '2026-11-17T10:00:00.000Z',
    });
    const pages = rankingSpecs(indicators, all).map((s) => buildRankingPage(s, v(s.indicatorId), rctx));
    const long = pages.filter((p) => p.title.length > 65).map((p) => p.title);
    expect(long).toEqual([]);
    expect(new Set(pages.map((p) => p.title)).size).toBe(380);
    // H1 zostaje pełny.
    expect(pages.find((p) => p.spec.indicatorId === 'library-readers-per-1000')!.h1).toContain('Czytelnicy bibliotek publicznych na 1000 ludności');
  });
});
