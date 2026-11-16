import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { checkAnomalies } from '../../scripts/data/nightly-checks.mjs';

// Fixture: nagrany kształt pliku wartości (tests/fixtures/synthetic/values-sample.json).
const sample = JSON.parse(readFileSync('tests/fixtures/synthetic/values-sample.json', 'utf8'));
const big = (n: number) => ({ years: [1, 2], values: Object.fromEntries(Array.from({ length: n }, (_, i) => [String(i), [1, 2]])) });

describe('checkAnomalies', () => {
  it('przepuszcza identyczne dane z fixtures', () => {
    expect(checkAnomalies('x', sample, sample)).toEqual([]);
  });
  it('przepuszcza nowy wskaźnik (brak poprzedniej wersji)', () => {
    expect(checkAnomalies('x', null, big(10))).toEqual([]);
  });
  it('odrzuca spadek liczby jednostek o >20%', () => {
    expect(checkAnomalies('x', big(100), big(79)).length).toBeGreaterThan(0);
    expect(checkAnomalies('x', big(100), big(80))).toEqual([]);
  });
  it('odrzuca spadek liczby wartości o >20% mimo tych samych jednostek', () => {
    const next = big(100);
    for (let i = 0; i < 50; i++) next.values[String(i)] = [null as unknown as number, null as unknown as number];
    expect(checkAnomalies('x', big(100), next).length).toBeGreaterThan(0);
  });
  it('odrzuca brak pliku / zły kształt', () => {
    expect(checkAnomalies('x', big(5), null).length).toBe(1);
  });
});
