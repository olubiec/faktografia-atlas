import { describe, expect, it } from 'vitest';
import sample from '../fixtures/library/values-sample.json';
import { compare } from '../../src/core/compare/compare';
import { compareExtraRow, compareExtraRows } from '../../src/core/compare/compare-extra';
import type { Indicator, IndicatorValues, UnitProfile } from '../../src/core/profile/profile';
import type { Unit } from '../../src/core/units/types';

function unit(teryt: string, level: Unit['level']): Unit {
  return { teryt, bdlId: null, name: teryt, level, parent: null, bbox: [0, 0, 0, 0], centroid: [0, 0] };
}

function indicator(over: Partial<Indicator> = {}): Indicator {
  return {
    id: 'b101', bdlVarId: 101, name: 'Test', unit: 'szt.', description: '', group: 'x',
    higherIsBetter: true, minLevel: 'pow', ...over,
  };
}

// Wartości z values-sample.json (powiaty 0201, 0202, 0203), klucze zamienione na TERYT.
const d = sample.l5.d;
const values: IndicatorValues = {
  indicatorId: 'b101',
  years: sample.l5.y,
  values: { '0201': d['030210101000'], '0202': d['030210302000'], '0203': d['030210203000'] },
  fetchedAt: '2026-01-01',
};
const a = unit('0201', 'pow');
const b = unit('0202', 'pow');

describe('compareExtraRow (QC610)', () => {
  it('wiersz ma wartości obu miejsc i niepustą słowną różnicę', () => {
    const row = compareExtraRow(indicator(), values, a, b)!;
    expect(row.indicatorId).toBe('b101');
    expect(row.a).toBe(110);
    expect(row.b).toBe(210);
    expect(row.diffText).toBe('niżej o 47,6%');
  });

  it('różnica słowna jest w stylu compare() dla analogicznych liczb', () => {
    const mk = (v: number): UnitProfile => ({
      teryt: 'x', unit: null,
      indicators: [{ indicatorId: 'b101', indicator: indicator({ unit: '%' }), value: v, year: 2024 } as never],
    });
    const main = compare(mk(110), mk(210)).rows[0].diffText;
    const extra = compareExtraRow(indicator({ unit: '%' }), values, a, b)!.diffText;
    expect(extra).toBe(main);
    expect(extra).toBe('niżej o 100,0 p.p.');
  });

  it('higherIsBetter null: bez słów lepiej/gorzej', () => {
    const row = compareExtraRow(indicator({ higherIsBetter: null }), values, a, b)!;
    expect(row.diffText).not.toMatch(/lepiej|gorzej/);
    expect(row.diffText).toMatch(/niżej/);
  });

  it('brak wartości u jednej strony: „brak danych” po tej stronie', () => {
    const c = unit('0299', 'pow');
    const row = compareExtraRow(indicator(), values, a, c)!;
    expect(row.a).toBe(110);
    expect(row.b).toBeNull();
    expect(row.diffText).toBe('brak danych');
    expect(row.rankB).toBeNull();
  });

  it('brak u obu: null, a compareExtraRows ich nie zwraca', () => {
    const c = unit('0298', 'pow');
    const e = unit('0299', 'pow');
    expect(compareExtraRow(indicator(), values, c, e)).toBeNull();
    const rows = compareExtraRows(
      [{ indicator: indicator(), values }, { indicator: indicator({ id: 'b102' }), values: { ...values, values: {} } }],
      a, b,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].indicatorId).toBe('b101');
  });

  it('wspólny rok: A ma 2024, B tylko 2023 → rok 2023', () => {
    const v: IndicatorValues = { ...values, values: { '0201': [100, 105, 110], '0202': [200, 205, null] } };
    const row = compareExtraRow(indicator(), v, a, b)!;
    expect(row.yearA).toBe(2023);
    expect(row.yearB).toBe(2023);
    expect(row.a).toBe(105);
    expect(row.b).toBe(205);
  });

  it('brak wspólnego roku: każdy ze swojego, różnica „brak porównania (różne lata)”', () => {
    const v: IndicatorValues = { ...values, values: { '0201': [100, null, null], '0202': [null, null, 210] } };
    const row = compareExtraRow(indicator(), v, a, b)!;
    expect(row.yearA).toBe(2022);
    expect(row.yearB).toBe(2024);
    expect(row.diffText).toBe('brak porównania (różne lata)');
  });

  it('jawny year ma pierwszeństwo', () => {
    const row = compareExtraRow(indicator(), values, a, b, 2022)!;
    expect(row.a).toBe(100);
    expect(row.b).toBe(200);
    expect(row.yearA).toBe(2022);
  });

  it('miejsce w rankingu liczone wśród jednostek tego samego poziomu', () => {
    const v: IndicatorValues = {
      ...values,
      values: { ...values.values, '0201011': [null, null, 9999] },
    };
    const row = compareExtraRow(indicator(), v, a, b)!;
    // powiaty 0203=160, 0202=210, 0201=110; gmina 9999 nie wlicza się
    expect(row.rankA).toBe(3);
    expect(row.rankB).toBe(1);
    const low = compareExtraRow(indicator({ higherIsBetter: false }), v, a, b)!;
    expect(low.rankA).toBe(1);
  });
});
