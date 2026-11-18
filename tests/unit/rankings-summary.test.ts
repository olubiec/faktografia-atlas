import { describe, test, expect } from 'vitest';
import { summarizeRanking } from '../../src/core/ranking/rankings-summary';
import type { RankedUnit } from '../../src/core/ranking/ranking';
import type { Unit } from '../../src/core/units/types';
import unitsJson from '../../public/data/units.json';

const units = unitsJson as Unit[];
const byTeryt = new Map(units.map((u) => [u.teryt, u]));
const norm = (s: string | null) => (s ?? '').replace(/\s/g, ' ');

// Kody prawdziwych jednostek z public/data/units.json
const CODES = ['1465011', '0201011', '0201022', '0201032', '0201043'];

function ranked(values: number[]): RankedUnit[] {
  return values.map((value, i) => ({
    teryt: CODES[i],
    name: byTeryt.get(CODES[i])?.name ?? CODES[i],
    value,
    rank: i + 1,
    total: values.length,
  }));
}

describe('summarizeRanking', () => {
  test('najwyżej: nazwa z rodzajem i jednostka, bez kodu', () => {
    const s = summarizeRanking(ranked([3465, 900, 500]), byTeryt, 'os./km²');
    expect(norm(s.highest)).toBe('Najwyżej: Warszawa (miasto), 3 465,0 os./km²');
    expect(s.highest).not.toMatch(/\d{7}/);
    expect(norm(s.lowest)).toContain('Najniżej: Bolesławiec');
    expect(s.count).toBe(3);
  });

  test('mediana: nieparzysta = środkowa, parzysta = średnia dwóch środkowych', () => {
    const odd = summarizeRanking(ranked([50, 40, 30, 20, 10]), byTeryt, '%');
    expect(norm(odd.median)).toBe('Mediana: 30,0 %');
    const even = summarizeRanking(ranked([40, 30, 20, 10]), byTeryt, '%');
    expect(norm(even.median)).toBe('Mediana: 25,0 %');
  });

  test('jedna jednostka: najwyżej = najniżej = mediana, bez wyjątku', () => {
    const s = summarizeRanking(ranked([7]), byTeryt, '%');
    expect(s.highest?.replace('Najwyżej: ', '')).toBe(s.lowest?.replace('Najniżej: ', ''));
    expect(norm(s.median)).toBe('Mediana: 7,0 %');
    expect(s.count).toBe(1);
  });

  test('pusta lista: same null i count 0', () => {
    expect(summarizeRanking([], byTeryt, '%')).toEqual({
      highest: null,
      lowest: null,
      median: null,
      count: 0,
    });
  });

  test('liczby po polsku: 1234.5 → „1 234,5”', () => {
    const s = summarizeRanking(ranked([1234.5]), byTeryt, '%');
    expect(norm(s.median)).toBe('Mediana: 1 234,5 %');
  });

  test('własny format jest użyty', () => {
    const s = summarizeRanking(ranked([2, 1]), byTeryt, 'zł', (n) => `<${n}>`);
    expect(s.highest).toContain('<2> zł');
    expect(s.median).toBe('Mediana: <1.5> zł');
  });

  test('brak jednostki w mapie: używa nazwy z rankingu, kod tylko gdy brak nazwy', () => {
    const items = ranked([2, 1]);
    expect(summarizeRanking(items, new Map(), '%').highest).toContain('Warszawa');
    const noName = items.map((i) => ({ ...i, name: '' }));
    expect(summarizeRanking(noName, new Map(), '%').highest).toContain(CODES[0]);
  });

  test('remisy: bierze pierwszego wg kolejności rankingu', () => {
    const s = summarizeRanking(ranked([5, 5, 1]), byTeryt, '%');
    expect(s.highest).toContain('Warszawa');
  });
});
