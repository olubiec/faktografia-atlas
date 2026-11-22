import { describe, expect, it } from 'vitest';
import units from '../fixtures/seo/units.json';
import indicators from '../../config/indicators.json';
import { buildUnitPaths, indicatorSlug, type SlugUnit } from '../../src/core/seo/slug';
import { buildRankingPage, rankingLevels, rankingPath, type RankingIndicator, type RankingLevel } from '../../src/core/seo/ranking-page';
import { renderRankingPage } from '../../src/core/seo/ranking-html';

const ALL = units as SlugUnit[];
const paths = buildUnitPaths(ALL);
const IND = indicators as RankingIndicator[];

// Wartości testowe: deterministyczne, różne dla każdej jednostki.
const valueOf = (teryt: string) => (Number(teryt) * 7919) % 1000 / 10;

const make = (indicator: RankingIndicator, level: RankingLevel, wojTeryt?: string) =>
  buildRankingPage({
    indicator,
    year: 2025,
    level,
    woj: wojTeryt ? ALL.find((u) => u.teryt === wojTeryt) : undefined,
    units: ALL,
    paths,
    valueOf,
    explanation: { short: 'Krótko.', howToRead: 'Jak czytać.', definitionUrl: 'https://stat.gov.pl/x' },
    lastmod: '2026-11-17T00:00:00Z',
  })!;

describe('W25-S10: strony rankingów', () => {
  it('slugi wskaźników są unikalne, a adresy rankingów mają właściwy kształt', () => {
    expect(new Set(IND.map((i) => indicatorSlug(i.name))).size).toBe(IND.length);
    expect(indicatorSlug('Lesistość (%)')).toBe('lesistosc');
    expect(rankingPath('Lesistość (%)', 'pow')).toBe('/ranking/lesistosc/powiaty');
    expect(rankingPath('Lesistość (%)', 'gmi', 'małopolskie')).toBe('/ranking/lesistosc/gminy/malopolskie');
  });

  it('poziomy wynikają z minLevel; adresy wszystkich rankingów są unikalne', () => {
    expect(rankingLevels({ ...IND[0]!, minLevel: 'pow' })).toEqual(['woj', 'pow']);
    expect(rankingLevels({ ...IND[0]!, minLevel: 'gmi' })).toEqual(['woj', 'pow', 'gmi']);
    const all = new Set<string>();
    const wojs = ALL.filter((u) => u.level === 'woj');
    for (const i of IND) {
      for (const level of rankingLevels(i)) {
        all.add(rankingPath(i.name, level));
        if (level === 'gmi') for (const w of wojs) all.add(rankingPath(i.name, level, w.name));
      }
    }
    const gminyIndicators = IND.filter((i) => i.minLevel === 'gmi').length;
    const expected = IND.length + IND.filter((i) => i.minLevel !== 'woj').length + gminyIndicators + gminyIndicators * 16;
    expect(all.size).toBe(expected);
  });

  it('tabela jest posortowana zgodnie z kierunkiem wskaźnika', () => {
    const higher = IND.find((i) => i.higherIsBetter === true)!;
    const lower = IND.find((i) => i.higherIsBetter === false)!;
    const neutral = IND.find((i) => i.higherIsBetter === null)!;
    const num = (v: string) => Number(v.replace(/[^\d,-]/g, '').replace(',', '.'));
    const desc = make(higher, 'pow').rows.map((r) => num(r.value));
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
    const asc = make(lower, 'pow').rows.map((r) => num(r.value));
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    const neu = make(neutral, 'pow').rows.map((r) => num(r.value));
    expect(neu).toEqual([...neu].sort((a, b) => b - a));
  });

  it('zdanie wstępne podaje te same wartości co skrajne miejsca tabeli', () => {
    for (const ind of [IND.find((i) => i.higherIsBetter === true)!, IND.find((i) => i.higherIsBetter === false)!]) {
      const page = make(ind, 'pow');
      const first = page.rows[0]!;
      const last = page.rows[page.rows.length - 1]!;
      expect(page.intro).toContain(`${first.label} (${first.value})`);
      expect(page.intro).toContain(`${last.label} (${last.value})`);
    }
  });

  it('ranking gmin w Polsce pokazuje 100 + 100, w województwie wszystkie; tytuły województw różne', () => {
    const ind = IND.find((i) => i.minLevel === 'gmi' && i.higherIsBetter === true)!;
    const national = make(ind, 'gmi');
    expect(national.truncated).toBe(true);
    expect(national.rows).toHaveLength(200);
    expect(national.total).toBe(2479);
    const a = make(ind, 'gmi', '12');
    const b = make(ind, 'gmi', '14');
    expect(a.truncated).toBe(false);
    expect(a.rows.length).toBe(a.total);
    expect(a.title).not.toBe(b.title);
    expect(a.path).toBe(rankingPath(ind.name, 'gmi', 'małopolskie'));
  });

  it('HTML: jeden H1, tabela, link do mapy, JSON-LD, noindex wg parametru, nazwy zabezpieczone', () => {
    const ind = IND.find((i) => i.minLevel === 'gmi')!;
    const page = { ...make(ind, 'pow'), h1: '<b>x</b>' };
    const html = renderRankingPage(page, [{ label: 'Inny', path: '/ranking/x/y' }], ['/a.css'], true);
    expect(html.match(/<h1[ >]/g)).toHaveLength(1);
    expect(html).not.toContain('<b>x</b>');
    expect(html).toContain('<table');
    expect(html).toContain(`href="/mapa?i=${ind.id}&amp;l=pow"`);
    expect(html).toContain('<meta name="robots" content="noindex,follow">');
    const ld = [...html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)].map((m) => (JSON.parse(m[1]!) as { '@type': string })['@type']);
    expect(ld).toEqual(['Dataset', 'BreadcrumbList']);
    expect(renderRankingPage(make(ind, 'pow'), [], [], false)).not.toContain('name="robots"');
  });
});
