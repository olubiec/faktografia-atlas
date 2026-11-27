import { describe, expect, it } from 'vitest';
import { filterRows, orderRows, pageOf } from '../../src/core/ranking/rankings-view';
import { readRankingsState, writeRankingsSearch, applyRankingsChange } from '../../src/core/ranking/rankings-url';
import type { RankedUnit } from '../../src/core/ranking/ranking';

const items: RankedUnit[] = [
  { teryt: 'a', name: 'Łódź', value: 5, rank: 1, total: 3 },
  { teryt: 'b', name: 'Gdańsk', value: 9, rank: 2, total: 3 },
  { teryt: 'c', name: 'Zabrze', value: 1, rank: 3, total: 3 },
];

describe('rankings-view: kolejność, szukajka, strony', () => {
  it('najwyższe i najniższe odwracają listę, numer to miejsce w całej liście', () => {
    expect(orderRows(items, 'high').map((r) => r.teryt)).toEqual(['b', 'a', 'c']);
    expect(orderRows(items, 'low').map((r) => r.teryt)).toEqual(['c', 'a', 'b']);
    expect(orderRows(items, 'low').map((r) => r.pos)).toEqual([1, 2, 3]);
  });
  it('szukajka ignoruje polskie znaki, a numer miejsca zostaje z pełnej listy', () => {
    const rows = filterRows(orderRows(items, 'high'), (t) => items.find((i) => i.teryt === t)!.name, 'lodz');
    expect(rows).toEqual([{ teryt: 'a', value: 5, pos: 2 }]);
  });
  it('strony po 50; numer spoza zakresu przechodzi na ostatnią', () => {
    const many = Array.from({ length: 120 }, (_, i) => i);
    expect(pageOf(many, 3).rows).toHaveLength(20);
    expect(pageOf(many, 99).page).toBe(3);
    expect(pageOf([], 1).pages).toBe(1);
  });
  it('adres: kolejność i strona są zapisywane, zmiana filtra wraca na stronę 1', () => {
    const s = readRankingsState('?d=low&p=3');
    expect(s.d).toBe('low');
    expect(s.p).toBe(3);
    expect(writeRankingsSearch(s)).toBe('?d=low&p=3');
    expect(applyRankingsChange(s, { l: 'pow' }).p).toBe(1);
    expect(applyRankingsChange(s, { p: 4 }).p).toBe(4);
    expect(readRankingsState('?d=x&p=0')).toMatchObject({ d: 'high', p: 1 });
  });
});
