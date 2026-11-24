import { describe, expect, it } from 'vitest';
import { context } from '../../src/core/explain/context';

const units = Array.from({ length: 400 }, (_, i) => ({
  teryt: String(1000000 + i), name: `G${i}`, level: 'gmi' as const,
  population: 1000, lat: 0, lon: 0,
})) as never;
const values = {
  years: [2025],
  values: Object.fromEntries(Array.from({ length: 400 }, (_, i) => [String(1000000 + i), [i]])),
};

describe('context – „wyżej niż X%”', () => {
  it('pierwsze miejsce nie dostaje 100%', () => {
    const c = context(values, units, '1000399', 2025, true)!;
    expect(c.rank).toBe(1);
    expect(c.percentBelow).toBe(99);
  });
  it('ostatnie miejsce ma 0%', () => {
    expect(context(values, units, '1000000', 2025, true)!.percentBelow).toBe(0);
  });
});
