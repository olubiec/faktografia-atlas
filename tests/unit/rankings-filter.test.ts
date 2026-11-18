import { describe, expect, it } from 'vitest';
import { filterRanking } from '../../src/core/ranking/rankings-filter';
import type { RankedUnit } from '../../src/core/ranking/ranking';
import type { Unit } from '../../src/core/units/types';

function makeUnit(teryt: string, name: string): Unit {
  return {
    teryt,
    bdlId: null,
    name,
    level: 'gmi',
    parent: null,
    bbox: [0, 0, 0, 0],
    centroid: [0, 0],
  };
}

const names: Array<[string, string]> = [
  ['1061011', 'Łódź'],
  ['1261011', 'Kraków'],
  ['1262011', 'Nowy Targ'],
  ['0261011', 'Wrocław'],
  ['2061011', 'Białystok'],
  ['3061011', 'Poznań'],
];

function build(list: Array<[string, string]>, firstRank = 14) {
  const units = new Map<string, Unit>();
  const items: RankedUnit[] = list.map(([teryt, name], i) => {
    units.set(teryt, makeUnit(teryt, name));
    return { teryt, name, value: 100 - i, rank: firstRank + i, total: list.length };
  });
  return { units, items };
}

describe('filterRanking', () => {
  const { units, items } = build(names);

  it('„lodz” znajduje „Łódź”, „LÓDŹ” też, „ł” znajduje wszystkie z „ł”', () => {
    expect(filterRanking(items, { q: 'lodz', w: null }, units).map((x) => x.name)).toEqual(['Łódź']);
    expect(filterRanking(items, { q: 'LÓDŹ', w: null }, units).map((x) => x.name)).toEqual(['Łódź']);
    expect(filterRanking(items, { q: 'ł', w: null }, units).map((x) => x.name)).toEqual([
      'Łódź',
      'Wrocław',
      'Białystok',
    ]);
  });

  it('w=12 zostawia tylko małopolskie; 02 nie myli się z 20', () => {
    expect(filterRanking(items, { q: '', w: '12' }, units).map((x) => x.teryt)).toEqual([
      '1261011',
      '1262011',
    ]);
    expect(filterRanking(items, { q: '', w: '02' }, units).map((x) => x.teryt)).toEqual(['0261011']);
  });

  it('q i w razem dają przecięcie', () => {
    expect(filterRanking(items, { q: 'targ', w: '12' }, units).map((x) => x.name)).toEqual([
      'Nowy Targ',
    ]);
    expect(filterRanking(items, { q: 'lodz', w: '12' }, units)).toEqual([]);
  });

  it('zachowuje miejsce z pełnego rankingu i te same obiekty', () => {
    const result = filterRanking(items, { q: 'lodz', w: null }, units);
    expect(result[0].rank).toBe(14);
    expect(result[0]).toBe(items[0]);
    const second = filterRanking(items, { q: 'krakow', w: null }, units);
    expect(second[0].rank).toBe(15);
  });

  it('brak trafień → []; puste q, same spacje i w=null → ta sama zawartość', () => {
    expect(filterRanking(items, { q: 'xyz', w: null }, units)).toEqual([]);
    expect(filterRanking(items, { q: '', w: null }, units)).toEqual(items);
    expect(filterRanking(items, { q: '   ', w: null }, units)).toEqual(items);
  });

  it('nie mutuje wejścia', () => {
    const before = items.length;
    const first = items[0];
    const result = filterRanking(items, { q: 'lodz', w: '10' }, units);
    expect(result).not.toBe(items);
    expect(items.length).toBe(before);
    expect(items[0]).toBe(first);
  });

  it('wydajność: 2 500 jednostek < 50 ms', () => {
    const big: Array<[string, string]> = Array.from({ length: 2500 }, (_, i) => [
      `${String((i % 16) * 2 + 2).padStart(2, '0')}${String(i).padStart(5, '0')}`,
      `Gmina Żółć ${i}`,
    ]);
    const { units: bigUnits, items: bigItems } = build(big, 1);
    const start = performance.now();
    const result = filterRanking(bigItems, { q: 'zolc 12', w: '02' }, bigUnits);
    const elapsed = performance.now() - start;
    expect(result.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(50);
  });
});
