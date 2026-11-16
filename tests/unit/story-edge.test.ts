import { describe, expect, it } from 'vitest';
import { computeChanges, shareBelow, type ComputeChangesParams } from '../../src/core/story/changes';
import { changeSentence } from '../../src/core/story/change-sentence';
import type { Unit } from '../../src/core/units/types';
import type { IndicatorValues } from '../../src/core/profile/profile';

const mk = (teryt: string, name: string): Unit => ({
  teryt, bdlId: null, name, level: 'pow', parent: null, bbox: [0, 0, 0, 0], centroid: [0, 0],
});
const units = [mk('0201000', 'Łódź'), mk('0202000', 'Żywiec'), mk('0203000', 'Gdańsk')];
const base = (values: Record<string, (number | null)[]>, years = [2020, 2021]): ComputeChangesParams => ({
  values: { years, values } as unknown as IndicatorValues,
  units, level: 'pow', fromYear: years[0], toYear: years[1], mode: 'percent',
});

describe('computeChanges – brzegi', () => {
  it('puste dane → puste listy', () => {
    expect(computeChanges({ ...base({}), units: [] })).toEqual({ rising: [], falling: [] });
    expect(computeChanges(base({}))).toEqual({ rising: [], falling: [] });
  });
  it('null / undefined values i brak lat nie rzuca', () => {
    const p = { ...base({}), values: null as unknown as IndicatorValues };
    expect(computeChanges(p)).toEqual({ rising: [], falling: [] });
    const q = { ...base({}), values: {} as unknown as IndicatorValues };
    expect(computeChanges(q)).toEqual({ rising: [], falling: [] });
  });
  it('nieistniejący rok daje puste listy', () => {
    expect(computeChanges({ ...base({ '0201000': [1, 2] }), toYear: 1999 }).rising).toEqual([]);
  });
  it('null, NaN i Infinity-owe braki są pomijane', () => {
    const r = computeChanges(base({ '0201000': [null, 5], '0202000': [Number.NaN, 5], '0203000': [10, 20] }));
    expect(r.rising.map((c) => c.teryt)).toEqual(['0203000']);
  });
  it('from=0: pominięte w procentach, uwzględnione w absolutnych', () => {
    const v = { '0201000': [0, 5] };
    expect(computeChanges(base(v)).rising).toEqual([]);
    const abs = computeChanges({ ...base(v), mode: 'absolute' });
    expect(abs.rising[0]).toMatchObject({ teryt: '0201000', delta: 5, deltaPercent: null });
  });
  it('ujemna wartość bazowa liczy procent względem modułu', () => {
    const r = computeChanges(base({ '0201000': [-10, -5] }));
    expect(r.rising[0].deltaPercent).toBe(50);
  });
  it('limit 0 i limit większy niż dane', () => {
    const v = { '0201000': [1, 2], '0202000': [1, 3], '0203000': [2, 1] };
    expect(computeChanges({ ...base(v), limit: 0 })).toEqual({ rising: [], falling: [] });
    expect(computeChanges({ ...base(v), limit: 100 }).rising).toHaveLength(2);
  });
  it('remis rozstrzyga TERYT rosnąco', () => {
    const v = { '0203000': [1, 2], '0201000': [1, 2], '0202000': [1, 2] };
    expect(computeChanges(base(v)).rising.map((c) => c.teryt)).toEqual(['0201000', '0202000', '0203000']);
  });
  it('bardzo długa lista jednostek (5000) działa i respektuje limit', () => {
    const many: Unit[] = Array.from({ length: 5000 }, (_, i) => mk(String(1000000 + i), `Ż${i}`));
    const values: Record<string, number[]> = {};
    many.forEach((u, i) => { values[u.teryt] = [1, 1 + (i % 97) + 1]; });
    const r = computeChanges({ ...base({}), units: many, values: { years: [2020, 2021], values } as unknown as IndicatorValues, limit: 3 });
    expect(r.rising).toHaveLength(3);
  });
  it('filtr parent z polskimi/złośliwymi znakami nie rzuca', () => {
    const r = computeChanges({ ...base({ '0201000': [1, 2] }), parent: '.*(' });
    expect(r.rising).toEqual([]);
  });
});

describe('shareBelow – brzegi', () => {
  it('nieznany teryt i puste dane → null', () => {
    expect(shareBelow(base({ '0201000': [1, 2] }), '9999999')).toBeNull();
    expect(shareBelow(base({}), '0201000')).toBeNull();
    expect(shareBelow(base({ '0201000': [1, 2] }), '')).toBeNull();
  });
  it('jedyna jednostka → 0', () => {
    expect(shareBelow(base({ '0201000': [1, 2] }), '0201000')).toBe(0);
  });
  it('najwyższa z trzech → ~66,7', () => {
    const p = base({ '0201000': [1, 5], '0202000': [1, 2], '0203000': [1, 3] });
    expect(shareBelow(p, '0201000')).toBeCloseTo(66.667, 2);
  });
});

describe('changeSentence – brzegi', () => {
  const ctx = { unitName: 'Łódź', fromYear: 2015, toYear: 2025, share: null };
  const ch = (delta: number, deltaPercent: number | null) => ({ teryt: 'x', from: 1, to: 1 + delta, delta, deltaPercent });
  it('zero → nie zmieniła się', () => {
    expect(changeSentence(ch(0, 0), ctx)).toBe('Od 2015 do 2025 r. wartość nie zmieniła się.');
  });
  it('deltaPercent null używa wartości bezwzględnej i jednostki', () => {
    const s = changeSentence(ch(-5, null), { ...ctx, indicatorUnit: 'os.' });
    expect(s).toMatch(/spadła o 5/);
    expect(s.endsWith('.')).toBe(true);
  });
  it('share 0 i 100 dla wzrostu i spadku', () => {
    expect(changeSentence(ch(1, 10), { ...ctx, share: 100 })).toContain('szybciej niż w 100% jednostek');
    expect(changeSentence(ch(1, 10), { ...ctx, share: 0 })).toContain('szybciej niż w 0% jednostek');
    expect(changeSentence(ch(-1, -10), { ...ctx, share: 0 })).toContain('mocniej niż w 100% jednostek');
  });
  it('bardzo duże i ułamkowe wartości nie dają NaN/undefined', () => {
    const s = changeSentence(ch(1e12, 1e9), { ...ctx, share: 33.333 });
    expect(s).not.toMatch(/NaN|undefined|Infinity/);
    expect(changeSentence(ch(0.0001, 0.0001), ctx)).not.toMatch(/NaN|undefined/);
  });
});
