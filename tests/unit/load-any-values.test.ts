import { beforeEach, describe, expect, it, vi } from 'vitest';
import sample from '../fixtures/library/values-sample.json';
import { resetLibraryCache } from '../../src/core/library/load-library';
import { loadIndicatorValues, resetValuesCache } from '../../src/core/data/load-values';
import { loadAnyValues, mergeLevels } from '../../src/core/indicators/load-any-values';
import type { IndicatorValues } from '../../src/core/profile/profile';
import type { Unit } from '../../src/core/units/types';

function unit(teryt: string, bdlId: string | null, level: Unit['level']): Unit {
  return { teryt, bdlId, name: teryt, level, parent: null, bbox: [0, 0, 0, 0], centroid: [0, 0] };
}

// Dwa znane powiaty z fixture'a; trzeci bdlId (030210203000) jest „nieznany”.
const units: Unit[] = [
  unit('0201', '030210101000', 'pow'),
  unit('0202', '030210302000', 'pow'),
];

const mainValues: IndicatorValues = {
  indicatorId: '9',
  years: [2020, 2021],
  values: { '02': [1, 2] },
  fetchedAt: '2026-01-01',
};

function okFetch(body: unknown): ReturnType<typeof vi.fn<typeof fetch>> {
  return vi.fn<typeof fetch>().mockResolvedValue({ ok: true, json: async () => body } as Response);
}

function expectShape(r: IndicatorValues): void {
  const sorted = [...r.years].sort((a, b) => a - b);
  expect(r.years).toEqual(sorted);
  for (const row of Object.values(r.values)) expect(row.length).toBe(r.years.length);
}

describe('loadAnyValues (QC604)', () => {
  beforeEach(() => {
    resetLibraryCache();
    resetValuesCache();
  });

  it('wskaźnik główny zwraca to samo co loadIndicatorValues', async () => {
    const f = okFetch(mainValues);
    const r = await loadAnyValues('9', { units, fetchImpl: f });
    expect(r).toEqual(mainValues);
    expect(r).toBe(await loadIndicatorValues('9', f));
    expectShape(r!);
  });

  it('b101 na values-sample.json: klucze TERYT, lata 2022–2024, indicatorId z prefiksem', async () => {
    const r = await loadAnyValues('b101', { units, fetchImpl: okFetch(sample) });
    expect(r).not.toBeNull();
    expect(r!.indicatorId).toBe('b101');
    expect(r!.years).toEqual([2022, 2023, 2024]);
    expect(Object.keys(r!.values).sort()).toEqual(['0201', '0202']);
    expect(r!.values['0201']).toEqual([100, 105, 110]);
    expect(r!.fetchedAt).toBe('');
    expectShape(r!);
  });

  it('nieznany bdlId jest pominięty', async () => {
    const r = await loadAnyValues('b101', { units, fetchImpl: okFetch(sample) });
    expect(Object.keys(r!.values)).not.toContain('030210203000');
    expect(Object.keys(r!.values)).toHaveLength(2);
  });

  it('scala poziomy o różnych latach i bierze fetchedAt z pliku', async () => {
    const body = {
      v: '7',
      fetchedAt: '2026-02-02',
      l3: { y: [2023], d: { w1: [5] } },
      l5: { y: [2022, 2023], d: { p1: [1, 2] } },
    };
    const us = [unit('02', 'w1', 'woj'), unit('0201', 'p1', 'pow')];
    const r = await loadAnyValues('b7', { units: us, fetchImpl: okFetch(body) });
    expect(r!.years).toEqual([2022, 2023]);
    expect(r!.values['02']).toEqual([null, 5]);
    expect(r!.values['0201']).toEqual([1, 2]);
    expect(r!.fetchedAt).toBe('2026-02-02');
    expectShape(r!);
  });

  it('respektuje ctx.levels', async () => {
    const body = {
      l3: { y: [2023], d: { w1: [5] } },
      l5: { y: [2023], d: { p1: [1] } },
    };
    const us = [unit('02', 'w1', 'woj'), unit('0201', 'p1', 'pow')];
    const r = await loadAnyValues('b7', { units: us, levels: ['pow'], fetchImpl: okFetch(body) });
    expect(Object.keys(r!.values)).toEqual(['0201']);
  });

  it('404 i zły JSON zwracają null bez rzucania', async () => {
    const f404 = vi.fn<typeof fetch>().mockResolvedValue({ ok: false, status: 404 } as Response);
    expect(await loadAnyValues('b101', { units, fetchImpl: f404 })).toBeNull();
    resetLibraryCache();
    expect(await loadAnyValues('b101', { units, fetchImpl: okFetch('x') })).toBeNull();
    const bad = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error('zły JSON');
      },
    } as unknown as Response);
    resetLibraryCache();
    expect(await loadAnyValues('b101', { units, fetchImpl: bad })).toBeNull();
    expect(await loadAnyValues('9', { units, fetchImpl: f404 })).toBeNull();
  });

  it('dwa wywołania b101 = jedno żądanie sieciowe', async () => {
    const f = okFetch(sample);
    await loadAnyValues('b101', { units, fetchImpl: f });
    await loadAnyValues('b101', { units, fetchImpl: f });
    expect(f).toHaveBeenCalledTimes(1);
  });
});

describe('mergeLevels', () => {
  it('ujednolica oś lat (suma posortowana), braki jako null', () => {
    const a: IndicatorValues = { indicatorId: 'b1', years: [2023, 2021], values: { '02': [3, 1] }, fetchedAt: 'x' };
    const b: IndicatorValues = { indicatorId: 'b1', years: [2022], values: { '0201': [9] }, fetchedAt: '' };
    const r = mergeLevels([a, b]);
    expect(r.years).toEqual([2021, 2022, 2023]);
    expect(r.values['02']).toEqual([1, null, 3]);
    expect(r.values['0201']).toEqual([null, 9, null]);
    expect(r.indicatorId).toBe('b1');
    expectShape(r);
  });

  it('pusta lista daje pusty wynik', () => {
    expect(mergeLevels([]).years).toEqual([]);
  });
});
