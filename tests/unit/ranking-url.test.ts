import { describe, expect, it } from 'vitest';
import indicators from '../../config/indicators.json';
import { DEFAULT_SELECTION, type RankingSelection } from '../../src/core/ranking/ranking-options';
import { parseRankingParams, rankingSearch } from '../../src/core/ranking/ranking-url';

const other = indicators.find((i) => i.group !== DEFAULT_SELECTION.group)!;
const powOnly = indicators.find((i) => i.minLevel === 'pow')!;

describe('parseRankingParams', () => {
  it('pusty adres daje wybór domyślny i pusty tekst', () => {
    expect(parseRankingParams('', indicators)).toEqual({ selection: DEFAULT_SELECTION, query: '' });
  });

  it('wskaźnik z innego działu ustawia dział, poziom i rok', () => {
    const r = parseRankingParams(`?i=${other.id}&l=pow&y=2020`, indicators);
    expect(r.selection).toEqual({ group: other.group, indicatorId: other.id, level: 'pow', year: 2020 });
  });

  it('nieznany poziom i rok nie-liczba dają wartości domyślne', () => {
    expect(parseRankingParams('?l=xyz&y=abc', indicators).selection).toEqual(DEFAULT_SELECTION);
  });

  it('nieznany wskaźnik daje widok domyślny', () => {
    expect(parseRankingParams('?i=nieistnieje', indicators).selection).toEqual(DEFAULT_SELECTION);
  });

  it('poziom niedostępny dla wskaźnika jest przycięty', () => {
    const r = parseRankingParams(`?i=${powOnly.id}&l=gmi`, indicators);
    expect(r.selection.indicatorId).toBe(powOnly.id);
    expect(r.selection.level).not.toBe('gmi');
  });
});

describe('rankingSearch', () => {
  it('stan domyślny daje pusty adres', () => {
    expect(rankingSearch(DEFAULT_SELECTION, '')).toBe('');
  });

  it('obieg parse(rankingSearch) zachowuje wybór i tekst', () => {
    const cases: Array<[RankingSelection, string]> = [
      [{ group: other.group, indicatorId: other.id, level: 'pow', year: 2021 }, ''],
      [{ ...DEFAULT_SELECTION, level: 'pow' }, 'Łódź'],
      [{ group: powOnly.group, indicatorId: powOnly.id, level: 'woj', year: 2019 }, 'zielona góra'],
    ];
    for (const [sel, q] of cases) {
      expect(parseRankingParams(rankingSearch(sel, q), indicators)).toEqual({ selection: sel, query: q });
    }
  });

  it('polskie znaki w q są kodowane i odczytywane', () => {
    const s = rankingSearch(DEFAULT_SELECTION, 'Śląskie żółć');
    expect(s).toMatch(/^\?q=/);
    expect(s).not.toContain('Ś');
    expect(parseRankingParams(s, indicators).query).toBe('Śląskie żółć');
  });
});
