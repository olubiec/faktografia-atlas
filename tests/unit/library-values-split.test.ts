import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { valuesByTeryt as fromLoader } from '../../src/core/library/load-library';
import { valuesByTeryt as fromValues } from '../../src/core/library/library-values';
import type { LibraryValues } from '../../src/core/library/library-values';
import type { Unit } from '../../src/core/units/types';

const root = resolve(__dirname, '../..');

function lineCount(rel: string): number {
  return readFileSync(resolve(root, rel), 'utf8').split('\n').length;
}

function unit(teryt: string, bdlId: string | null, level: Unit['level']): Unit {
  return { teryt, bdlId, name: teryt, level, parent: null, bbox: [0, 0, 0, 0], centroid: [0, 0] };
}

describe('Podział load-library / library-values (N-21)', () => {
  it('oba pliki mają najwyżej 200 linii', () => {
    expect(lineCount('src/core/library/load-library.ts')).toBeLessThanOrEqual(200);
    expect(lineCount('src/core/library/library-values.ts')).toBeLessThanOrEqual(200);
  });

  it('valuesByTeryt z load-library to ta sama funkcja co z library-values', () => {
    expect(fromLoader).toBe(fromValues);
  });

  it('poziom powiatów: klucze to 4-cyfrowe TERYT jako string, brak wartości nie daje zera', () => {
    const sample = JSON.parse(
      readFileSync(resolve(root, 'tests/fixtures/library/values-sample.json'), 'utf8')
    ) as LibraryValues;
    const units = [
      unit('0210', '030210101000', 'pow'),
      unit('0211', '030210302000', 'pow'),
      unit('0212', '030210203000', 'pow'),
    ];
    const result = fromLoader(sample, 'pow', units);
    const keys = Object.keys(result.values);
    expect(keys.length).toBe(3);
    for (const k of keys) {
      expect(typeof k).toBe('string');
      expect(k).toMatch(/^\d{4}$/);
    }
    expect(result.values['0210']).toEqual([100, 105, 110]);

    const withGap: LibraryValues = {
      l5: { y: [2023, 2024], d: { '030210101000': [null, 5] } },
    };
    const gap = fromLoader(withGap, 'pow', [units[0]]);
    expect(gap.values['0210'][0]).toBeNull();
    expect(gap.values['0210'][0]).not.toBe(0);
  });
});
