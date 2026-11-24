import { describe, expect, it } from 'vitest';
import { checkLevel } from '../../src/core/validate/consistency';

const mk = (rows: Record<string, (number | null)[]>, unit = 'osoba', years = [2024, 2025]) =>
  checkLevel({ varId: '1', unit, level: 'gmi', data: { years, rows } });
const rules = (r: ReturnType<typeof mk>) => r.map((x) => x.rule);

describe('checkLevel – reguły spójności', () => {
  it('poprawne dane bez uwag', () => {
    const rows = Object.fromEntries(Array.from({ length: 50 }, (_, i) => [String(i), [i, i * 2 + 1]]));
    expect(mk(rows)).toEqual([]);
  });
  it('zła długość wiersza i NaN to błędy', () => {
    const r = mk({ a: [1], b: [Number.NaN, 2] });
    expect(rules(r)).toContain('ROW_LEN_NE_YEARS');
    expect(rules(r)).toContain('DATA_NONFINITE');
    expect(r.every((x) => x.severity === 'error' || x.severity === 'warning')).toBe(true);
  });
  it('same równe wartości = jeden kolor legendy', () => {
    expect(rules(mk({ a: [1, 5], b: [1, 5], c: [1, 5] }))).toContain('LEGEND_ONE_CLASS');
  });
  it('puste dane i pusty ostatni rok', () => {
    expect(rules(mk({}))).toContain('EMPTY_LEVEL');
    expect(rules(mk({ a: [1, null] }))).toContain('EMPTY_LAST_YEAR');
  });
  it('% powyżej 100', () => {
    expect(rules(mk({ a: [1, 120], b: [1, 50], c: [1, 60], d: [1, 70], e: [1, 80], f: [1, 90] }, '%'))).toContain('PERCENT_OVER_100');
  });
});
