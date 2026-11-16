import { describe, expect, it } from 'vitest';
import fixture from '../fixtures/story/density-sample.json';
import { computeChanges, shareBelow } from '../../src/core/story/changes';
import type { IndicatorValues } from '../../src/core/profile/profile';
import type { Unit } from '../../src/core/units/types';

const units = fixture.units as Unit[];
const base: IndicatorValues = {
  indicatorId: fixture.indicatorId,
  years: fixture.years,
  values: fixture.values as Record<string, (number | null)[]>,
  fetchedAt: '2026-01-01T00:00:00Z',
};
const p = { values: base, units, level: 'pow' as const, fromYear: 2015, toYear: 2025, mode: 'percent' as const };

describe('computeChanges', () => {
  it('zwraca po 5 pozycji posortowanych deterministycznie', () => {
    const r = computeChanges(p);
    expect(r.rising).toHaveLength(5);
    expect(r.falling).toHaveLength(5);
    for (let i = 1; i < 5; i++) {
      expect(r.rising[i - 1].deltaPercent!).toBeGreaterThanOrEqual(r.rising[i].deltaPercent!);
      expect(r.falling[i - 1].deltaPercent!).toBeLessThanOrEqual(r.falling[i].deltaPercent!);
    }
    expect(r.rising[0].deltaPercent!).toBeGreaterThan(0);
    expect(r.falling[0].deltaPercent!).toBeLessThan(0);
  });

  it('pomija jednostkę z brakiem wartości w jednym roku', () => {
    const t = units.find((u) => u.level === 'pow')!.teryt;
    const values = { ...base, values: { ...base.values, [t]: [null, 1, 2] } };
    const r = computeChanges({ ...p, values, limit: 500 });
    const all = [...r.rising, ...r.falling].map((c) => c.teryt);
    expect(all).not.toContain(t);
  });

  it('tryb percent pomija from === 0, absolute je uwzględnia', () => {
    const t = units.find((u) => u.level === 'pow')!.teryt;
    const values = { ...base, values: { ...base.values, [t]: [0, 5, 1000] } };
    const pct = computeChanges({ ...p, values, limit: 500 });
    expect([...pct.rising, ...pct.falling].map((c) => c.teryt)).not.toContain(t);
    const abs = computeChanges({ ...p, values, mode: 'absolute', limit: 500 });
    expect(abs.rising.map((c) => c.teryt)).toContain(t);
    expect(abs.rising[0].teryt).toBe(t);
  });

  it('filtr parent zwraca tylko TERYT z prefiksem i właściwy poziom', () => {
    const r = computeChanges({ ...p, parent: '12', limit: 500 });
    const all = [...r.rising, ...r.falling];
    expect(all.length).toBeGreaterThan(0);
    for (const c of all) {
      expect(c.teryt.startsWith('12')).toBe(true);
      expect(c.teryt).toHaveLength(4);
    }
  });

  it('nieznany rok daje puste listy', () => {
    expect(computeChanges({ ...p, fromYear: 1900 })).toEqual({ rising: [], falling: [] });
  });

  it('zmiana zerowa nie trafia do żadnej listy, remis po TERYT', () => {
    const [a, b, c] = units.filter((u) => u.level === 'pow').map((u) => u.teryt);
    const values: IndicatorValues = {
      ...base,
      values: { [a]: [10, 10, 20], [b]: [10, 10, 20], [c]: [10, 10, 10] },
    };
    const r = computeChanges({ ...p, values, limit: 10 });
    expect(r.rising.map((x) => x.teryt)).toEqual([a, b].sort());
    expect(r.falling).toEqual([]);
  });

  it('shareBelow liczy odsetek jednostek z mniejszą zmianą', () => {
    const [a, b, c, d] = units.filter((u) => u.level === 'pow').map((u) => u.teryt);
    const values: IndicatorValues = {
      ...base,
      values: { [a]: [10, 10, 11], [b]: [10, 10, 12], [c]: [10, 10, 13], [d]: [10, 10, 14] },
    };
    expect(shareBelow({ ...p, values }, d)).toBe(75);
    expect(shareBelow({ ...p, values }, a)).toBe(0);
    expect(shareBelow({ ...p, values }, 'brak')).toBeNull();
  });
});
