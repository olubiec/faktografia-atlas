import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SELECTION,
  indicatorsInGroup,
  levelsFor,
  normalizeSelection,
  rankingGroups,
  yearsDesc,
} from '../../src/core/ranking/ranking-options';
import realIndicators from '../../config/indicators.json';

const inds = [
  { id: 'a', group: 'Ludność', minLevel: 'gmi' },
  { id: 'b', group: 'Praca', minLevel: 'pow' },
  { id: 'c', group: 'Ludność', minLevel: 'gmi' },
  { id: 'd', group: 'Praca', minLevel: 'pow' },
];
const vals = { years: [2019, 2021, 2020] };

describe('ranking-options', () => {
  it('działy są unikalne i w kolejności z pliku', () => {
    expect(rankingGroups(inds)).toEqual(['Ludność', 'Praca']);
    const g = rankingGroups(realIndicators);
    expect(new Set(g).size).toBe(g.length);
    expect(g[0]).toBe('Ludność');
  });

  it('indicatorsInGroup zwraca wskaźniki działu w kolejności', () => {
    expect(indicatorsInGroup(inds, 'Ludność').map((i) => i.id)).toEqual(['a', 'c']);
  });

  it('levelsFor przycina do minLevel', () => {
    expect(levelsFor({ minLevel: 'gmi' })).toEqual(['woj', 'pow', 'gmi']);
    expect(levelsFor({ minLevel: 'pow' })).toEqual(['woj', 'pow']);
  });

  it('yearsDesc zaczyna od najnowszego', () => {
    expect(yearsDesc(vals)).toEqual([2021, 2020, 2019]);
    expect(yearsDesc(null)).toEqual([]);
  });

  it('normalizeSelection: wskaźnik spoza działu → pierwszy z działu', () => {
    const r = normalizeSelection({ group: 'Praca', indicatorId: 'a', level: 'woj', year: null }, inds, vals);
    expect(r.indicatorId).toBe('b');
  });

  it('normalizeSelection: poziom spoza levelsFor → woj', () => {
    const r = normalizeSelection({ group: 'Praca', indicatorId: 'b', level: 'gmi', year: null }, inds, vals);
    expect(r.level).toBe('woj');
    const ok = normalizeSelection({ group: 'Ludność', indicatorId: 'a', level: 'gmi', year: null }, inds, vals);
    expect(ok.level).toBe('gmi');
  });

  it('normalizeSelection: rok spoza danych → najnowszy (null), poprawny zostaje', () => {
    const bad = normalizeSelection({ group: 'Ludność', indicatorId: 'a', level: 'woj', year: 1999 }, inds, vals);
    expect(bad.year).toBeNull();
    const ok = normalizeSelection({ group: 'Ludność', indicatorId: 'a', level: 'woj', year: 2019 }, inds, vals);
    expect(ok.year).toBe(2019);
  });

  it('domyślny wybór = density / woj / najnowszy rok', () => {
    expect(DEFAULT_SELECTION).toEqual({ group: 'Ludność', indicatorId: 'density', level: 'woj', year: null });
    expect(normalizeSelection(DEFAULT_SELECTION, realIndicators, null)).toEqual(DEFAULT_SELECTION);
  });
});
