import { describe, expect, it } from 'vitest';
import { compareExtraRow, compareExtraRows } from '../../src/core/compare/compare-extra';
import type { Indicator, IndicatorValues } from '../../src/core/profile/profile';
import type { Unit } from '../../src/core/units/types';

function unit(teryt: string, level: Unit['level']): Unit {
  return { teryt, bdlId: null, name: teryt, level, parent: null, bbox: [0, 0, 0, 0], centroid: [0, 0] };
}

function indicator(over: Partial<Indicator> = {}): Indicator {
  return {
    id: 'e101', bdlVarId: 101, name: 'Test', unit: 'szt.', description: '', group: 'x',
    higherIsBetter: true, minLevel: 'pow', ...over,
  };
}

function vals(rows: Record<string, (number | null)[]>, years = [2022, 2023, 2024]): IndicatorValues {
  return { indicatorId: 'e101', years, values: rows, fetchedAt: '2026-01-01' };
}

const a = unit('0201', 'pow');
const b = unit('0202', 'pow');

describe('compareExtraRow – przypadki skrajne (QT03)', () => {
  it('brak wartości dla A: a null, b ma wartość, miejsce A puste', () => {
    const row = compareExtraRow(indicator(), vals({ '0202': [1, 2, 3] }), a, b)!;
    expect(row.a).toBeNull();
    expect(row.b).toBe(3);
    expect(row.rankA).toBeNull();
    expect(row.rankB).toBe(1);
    expect(row.diffText).toBe('brak danych');
  });

  it('brak wartości dla B: b null, a ma wartość, miejsce B puste', () => {
    const row = compareExtraRow(indicator(), vals({ '0201': [1, 2, 3] }), a, b)!;
    expect(row.b).toBeNull();
    expect(row.a).toBe(3);
    expect(row.rankB).toBeNull();
    expect(row.yearB).toBeNull();
    expect(row.diffText).toBe('brak danych');
  });

  it('wskaźnik bez poziomu gminy: gmina bez wartości daje wiersz tylko dla powiatu', () => {
    const g = unit('0201011', 'gmi');
    const row = compareExtraRow(indicator({ minLevel: 'pow' }), vals({ '0201': [1, 2, 3], '0202': [4, 5, 6] }), a, g)!;
    expect(row.a).toBe(3);
    expect(row.b).toBeNull();
    expect(row.rankB).toBeNull();
  });

  it('wskaźnik bez poziomu gminy: dwie gminy bez danych dają null', () => {
    const g1 = unit('0201011', 'gmi');
    const g2 = unit('0201022', 'gmi');
    expect(compareExtraRow(indicator(), vals({ '0201': [1, 2, 3] }), g1, g2)).toBeNull();
  });

  it('miejsce gminy liczone tylko wśród gmin (powiaty się nie wliczają)', () => {
    const g1 = unit('0201011', 'gmi');
    const g2 = unit('0201022', 'gmi');
    const row = compareExtraRow(
      indicator(),
      vals({ '0201': [0, 0, 999], '0201011': [0, 0, 10], '0201022': [0, 0, 20] }),
      g1, g2,
    )!;
    expect(row.rankA).toBe(2);
    expect(row.rankB).toBe(1);
  });

  it('remis wartości: obie jednostki dzielą to samo miejsce', () => {
    const row = compareExtraRow(indicator(), vals({ '0201': [0, 0, 5], '0202': [0, 0, 5] }), a, b)!;
    expect(row.rankA).toBe(1);
    expect(row.rankB).toBe(1);
  });

  it('ta sama jednostka po obu stronach: równe wartości i miejsca', () => {
    const row = compareExtraRow(indicator(), vals({ '0201': [1, 2, 3] }), a, a)!;
    expect(row.a).toBe(row.b);
    expect(row.rankA).toBe(row.rankB);
  });

  it('wartość zero jest wartością, nie brakiem danych', () => {
    const row = compareExtraRow(indicator(), vals({ '0201': [0, 0, 0], '0202': [0, 0, 5] }), a, b)!;
    expect(row.a).toBe(0);
    expect(row.rankA).toBe(2);
  });

  it('jawny rok spoza listy lat: brak danych po obu stronach, wynik null', () => {
    expect(compareExtraRow(indicator(), vals({ '0201': [1, 2, 3], '0202': [4, 5, 6] }), a, b, 1999)).toBeNull();
  });

  it('pusta lista lat i wartości: null', () => {
    expect(compareExtraRow(indicator(), vals({}, []), a, b)).toBeNull();
  });
});

describe('compareExtraRows – lista (QT03)', () => {
  it('pusta lista wpisów daje pustą tablicę', () => {
    expect(compareExtraRows([], a, b)).toEqual([]);
  });

  it('kolejność wierszy zgodna z kolejnością wejścia, pominięte bez danych', () => {
    const v = vals({ '0201': [1, 2, 3], '0202': [4, 5, 6] });
    const rows = compareExtraRows(
      [
        { indicator: indicator({ id: 'z' }), values: v },
        { indicator: indicator({ id: 'pusty' }), values: vals({}) },
        { indicator: indicator({ id: 'a' }), values: v },
        { indicator: indicator({ id: 'm' }), values: v },
      ],
      a, b,
    );
    expect(rows.map((r) => r.indicatorId)).toEqual(['z', 'a', 'm']);
  });

  it('duplikaty id wskaźnika nie są scalane: każdy wpis daje osobny wiersz', () => {
    const v = vals({ '0201': [1, 2, 3], '0202': [4, 5, 6] });
    const rows = compareExtraRows(
      [
        { indicator: indicator({ id: 'dup' }), values: v },
        { indicator: indicator({ id: 'dup' }), values: v },
      ],
      a, b,
    );
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual(rows[1]);
  });
});
