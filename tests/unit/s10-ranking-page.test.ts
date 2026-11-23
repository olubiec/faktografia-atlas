import { describe, expect, it } from 'vitest';
import indicatorsData from '../../config/indicators.json';
import explanationsData from '../fixtures/explanations.json';
import profileData from '../fixtures/seo/profile-12.json';
import unitsData from '../fixtures/seo/units.json';
import type { IndicatorValues } from '../../src/core/profile/profile';
import { auditPages, readPage, summarize } from '../../src/core/seo/audit';
import {
  buildRankingPage,
  median,
  NATIONAL_GMINA_SHOWN,
  rankingPath,
  type RankingContext,
  type RankingPage,
} from '../../src/core/seo/ranking-page';
import {
  buildRankingSite,
  rankingHeadings,
  rankingIndexSection,
  rankingSitemap,
  rankingSpecs,
  renderRankingPage,
  withSitemapEntry,
} from '../../src/core/seo/ranking-template';
import { buildUnitPaths, indicatorSlug, type SlugUnit } from '../../src/core/seo/slug';

// Dane: units.json i wycinek profilu województwa 12 (S06) – prawdziwe wartości GUS dla kilku jednostek.
const units = unitsData as SlugUnit[];
const indicators = indicatorsData as RankingContext['indicators'][number][];
const paths = buildUnitPaths(units);
const headings = rankingHeadings(units);
const ASSETS = { css: ['/assets/index-abc.css'] };
const ctx = (extra: Partial<RankingContext> = {}): RankingContext => ({
  units,
  paths,
  headings,
  indicators,
  explanations: explanationsData.items,
  indexGminy: false,
  ...extra,
});

type ProfileFixture = {
  generatedAt: string;
  years: Record<string, number[]>;
  units: Record<string, { indicatorId: string; series: (number | null)[] }[]>;
};
const profile = profileData as unknown as ProfileFixture;

/** Serie z profilu 12 w kształcie public/data/values/<id>.json. */
function valuesFromProfile(id: string): IndicatorValues {
  const values: Record<string, (number | null)[]> = {};
  for (const [teryt, items] of Object.entries(profile.units)) {
    const item = items.find((i) => i.indicatorId === id);
    if (item) values[teryt] = item.series;
  }
  return { indicatorId: id, years: profile.years[id] ?? [], values, fetchedAt: profile.generatedAt };
}

/** Pełny zestaw gmin z units.json: wartość = TERYT jako liczba (bez remisów) – sprawdza podział 100 + 100 i wagę strony. */
function terytValues(id: string): IndicatorValues {
  const values: Record<string, (number | null)[]> = {};
  for (const u of units) values[u.teryt] = [Number(u.teryt) / 1000];
  return { indicatorId: id, years: [2025], values, fetchedAt: '2026-11-17T10:00:00.000Z' };
}

const allValues = Object.fromEntries(indicators.map((i) => [i.id, valuesFromProfile(i.id)]));
const specs = rankingSpecs(indicators, units);
const lastValue = (p: RankingPage) => (p.bottom.at(-1) ?? p.top.at(-1))!;
const num = (v: string) => Number(v.replace(/[^\d,−-]/g, '').replace(',', '.').replace('−', '-'));

describe('S10 adresy rankingów', () => {
  it('380 unikalnych adresów: 60 krajowych i 320 rankingów gmin w województwach', () => {
    expect(specs).toHaveLength(380);
    expect(new Set(specs.map((s) => s.path)).size).toBe(380);
    expect(specs.filter((s) => s.voivodeship === null)).toHaveLength(60);
    expect(specs.filter((s) => s.voivodeship !== null)).toHaveLength(320);
    for (const s of specs) expect(s.path).toMatch(/^\/ranking\/[a-z0-9-]+\/(wojewodztwa|powiaty|gminy)(\/[a-z0-9-]+)?$/);
  });

  it('slug wskaźnika bez jednostki, unikalny dla 20 wskaźników', () => {
    expect(indicatorSlug('Lesistość (%)')).toBe('lesistosc');
    expect(indicatorSlug('Gęstość zaludnienia (os./km²)')).toBe('gestosc-zaludnienia');
    expect(new Set(indicators.map((i) => indicatorSlug(i.name))).size).toBe(indicators.length);
    const forest = indicators.find((i) => i.id === 'forest-cover')!;
    const malopolska = units.find((u) => u.teryt === '12')!;
    expect(rankingPath(forest, 'pow')).toBe('/ranking/lesistosc/powiaty');
    expect(rankingPath(forest, 'gmi', malopolska)).toBe('/ranking/lesistosc/gminy/malopolskie');
  });
});

describe('S10 model strony', () => {
  const pages = specs.map((s) => buildRankingPage(s, allValues[s.indicatorId]!, ctx()));

  it('tytuły i opisy są unikalne na 380 stronach', () => {
    expect(new Set(pages.map((p) => p.title)).size).toBe(380);
    expect(new Set(pages.map((p) => p.description)).size).toBe(380);
    for (const p of pages) expect(p.description.length).toBeLessThanOrEqual(160);
  });

  it('tabela posortowana zgodnie z kierunkiem wskaźnika (niżej lepiej: rosnąco, wyżej lepiej i neutralny: malejąco)', () => {
    const checked = new Set<boolean | null>();
    for (const p of pages.filter((x) => x.total >= 3)) {
      const ind = indicators.find((i) => i.id === p.spec.indicatorId)!;
      const vals = p.top.map((r) => num(r.value));
      const sorted = [...vals].sort((a, b) => (ind.higherIsBetter === false ? a - b : b - a));
      expect(vals).toEqual(sorted);
      expect(p.top.map((r) => r.rank)).toEqual([...p.top.map((r) => r.rank)].sort((a, b) => a - b));
      expect(p.top[0]!.rank).toBe(1);
      checked.add(ind.higherIsBetter);
    }
    expect(checked).toEqual(new Set([true, false, null]));
  });

  it('zdanie wprowadzające podaje wartości pierwszego i ostatniego miejsca z tabeli oraz medianę', () => {
    const withData = pages.filter((p) => p.total > 0);
    expect(withData.length).toBeGreaterThan(0);
    for (const p of withData) {
      const lead = p.lead.join(' ');
      expect(lead).toContain(`Listę otwiera ${p.top[0]!.name} z`);
      expect(lead).toContain(`(${p.top[0]!.value})`);
      expect(lead).toContain(`zamyka ${lastValue(p).name} z`);
      expect(lead).toContain(`(${lastValue(p).value})`);
      expect(lead).toMatch(/Mediana wynosi /);
    }
  });

  it('ranking krajowy gmin: 100 najwyżej + 100 najniżej, linki do 16 rankingów wojewódzkich', () => {
    const forest = indicators.find((i) => i.id === 'forest-cover')!;
    const spec = specs.find((s) => s.indicatorId === forest.id && s.level === 'gmi' && !s.voivodeship)!;
    const page = buildRankingPage(spec, terytValues(forest.id), ctx());
    expect(page.total).toBe(2479);
    expect(page.top).toHaveLength(NATIONAL_GMINA_SHOWN);
    expect(page.bottom).toHaveLength(NATIONAL_GMINA_SHOWN);
    expect(page.bottom.at(-1)!.rank).toBe(2479);
    expect(page.lead.join(' ')).toContain(`(${page.bottom.at(-1)!.value})`);
    const voiv = page.related.find((r) => r.id === 'wojewodztwa')!;
    expect(voiv.links).toHaveLength(16);
    expect(new Set(voiv.links.map((l) => l.path)).size).toBe(16);
    expect(page.mapHref).toBe('/mapa?i=forest-cover&l=gmi');
  });

  it('H1 z nazwą, poziomem i rokiem; mediana liczona z danych', () => {
    const p = pages.find((x) => x.path === '/ranking/lesistosc/powiaty')!;
    expect(p.h1).toBe('Lesistość – ranking powiatów w Polsce 2025');
    const d = pages.find((x) => x.path === '/ranking/gestosc-zaludnienia/gminy/malopolskie')!;
    expect(d.h1).toBe('Gęstość zaludnienia – ranking gmin w województwie małopolskim 2025');
    expect(d.explanation.short).toBe(explanationsData.items[0]!.short);
    expect(median([1, 2, 3])).toBe(2);
    expect(median([1, 2, 3, 10])).toBe(2.5);
    expect(median([])).toBeNull();
  });

  it('rankingi gmin podlegają indexGminy (D7), województwa i powiaty z danymi są indeksowane', () => {
    const gmi = pages.filter((p) => p.spec.level === 'gmi');
    expect(gmi.every((p) => !p.indexable)).toBe(true);
    const on = specs.filter((s) => s.level === 'gmi').map((s) => buildRankingPage(s, allValues[s.indicatorId]!, ctx({ indexGminy: true })));
    expect(on.filter((p) => p.indexable).every((p) => p.total > 0)).toBe(true);
    expect(on.some((p) => p.indexable)).toBe(true);
    expect(pages.filter((p) => p.spec.level !== 'gmi' && p.total > 0).every((p) => p.indexable)).toBe(true);
    // Brak danych (wskaźnik tylko do powiatów) → noindex niezależnie od przełącznika.
    expect(on.filter((p) => p.total === 0).every((p) => !p.indexable)).toBe(true);
  });
});

describe('S10 dokument HTML', () => {
  const forest = indicators.find((i) => i.id === 'forest-cover')!;
  const ld = (html: string) =>
    [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]!));

  it('ma Dataset (jeden wskaźnik, rok) i BreadcrumbList, przycisk mapy i definicję GUS', () => {
    const spec = specs.find((s) => s.path === '/ranking/lesistosc/powiaty')!;
    const html = renderRankingPage(buildRankingPage(spec, allValues[forest.id]!, ctx()), ASSETS);
    const blocks = ld(html);
    const dataset = blocks.find((b) => b['@type'] === 'Dataset');
    expect(dataset.temporalCoverage).toBe('2025');
    expect(dataset.variableMeasured.name).toBe('Lesistość');
    expect(blocks.find((b) => b['@type'] === 'BreadcrumbList').itemListElement.at(-1).item).toBe(
      'https://faktografia.eu/ranking/lesistosc/powiaty',
    );
    expect(html).toContain('href="/mapa?i=forest-cover&amp;l=pow"');
    expect(html).toContain('Zobacz na mapie');
    expect(html).not.toContain('Definicja GUS'); // fixture explanations nie ma lesistości
    const density = specs.find((s) => s.path === '/ranking/gestosc-zaludnienia/powiaty')!;
    const dHtml = renderRankingPage(buildRankingPage(density, allValues.density!, ctx()), ASSETS);
    expect(dHtml).toContain(`href="${explanationsData.items[0]!.definitionUrl}"`);
    expect(dHtml).toContain('Definicja GUS');
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain('<meta name="robots" content="index,follow">');
  });

  it('strona rankingu gmin w największym województwie mieści się w 120 KB', () => {
    const maz = units.find((u) => u.name === 'mazowieckie')!;
    const spec = specs.find((s) => s.indicatorId === forest.id && s.voivodeship === maz.teryt)!;
    const page = buildRankingPage(spec, terytValues(forest.id), ctx());
    expect(page.total).toBeGreaterThan(300);
    const html = renderRankingPage(page, ASSETS);
    expect(Buffer.byteLength(html, 'utf8')).toBeLessThanOrEqual(120 * 1024);
    expect(html).toContain('<meta name="robots" content="noindex,follow">');
  });

  it('nazwa z HTML nie tworzy znaczników', () => {
    const evil = '<img src=x onerror=alert(1)>';
    const spec = specs.find((s) => s.path === '/ranking/lesistosc/powiaty')!;
    const page = buildRankingPage(spec, allValues[forest.id]!, ctx());
    const html = renderRankingPage({ ...page, h1: evil, top: page.top.map((r) => ({ ...r, name: evil })) }, ASSETS);
    expect(html).not.toContain('<img src=x');
  });

  it('cała witryna rankingów przechodzi audyt S08, mapa strony ma tylko strony indeksowane', () => {
    const site = buildRankingSite(allValues, ctx(), ASSETS);
    expect(site).toHaveLength(381);
    const known = ['/', '/mapa', ...paths.terytByPath.keys()];
    const sitemap = rankingSitemap(site);
    const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
    expect(urls).toHaveLength(site.filter((p) => p.indexable).length);
    expect(urls.some((u) => u.includes('/gminy'))).toBe(false);
    const { errors } = summarize(auditPages(site.map((p) => readPage(p.path, p.html)), urls, { knownPaths: known }));
    expect(errors).toEqual([]);
  });

  it('indeks sitemap.xml dostaje wpis sitemap-rankingi.xml; sekcja „Rankingi” linkuje 60 rankingów', () => {
    const index = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="x">\n</sitemapindex>\n';
    const out = withSitemapEntry(index, 'sitemap-rankingi.xml', '2026-11-17T10:00:00.000Z');
    expect(out).toContain('<loc>https://faktografia.eu/sitemap-rankingi.xml</loc><lastmod>2026-11-17</lastmod>');
    const section = rankingIndexSection(indicators);
    expect(section.match(/href="\/ranking\//g)).toHaveLength(60);
  });
});
