import { describe, it, expect } from 'vitest';
import { revealPlan, RevealUnit, RevealOptions } from '../../src/core/map/reveal';

describe('revealPlan', () => {
  const origin: [number, number] = [0, 0];

  function createUnits(count: number, seed: number = 42): RevealUnit[] {
    const units: RevealUnit[] = [];
    for (let i = 0; i < count; i++) {
      // Generate some deterministic spiral coordinates for testing
      const angle = i * seed;
      const radius = i;
      const teryt = `t_${i.toString().padStart(4, '0')}`;
      units.push({
        teryt,
        centroid: [Math.cos(angle) * radius, Math.sin(angle) * radius],
      });
    }
    return units;
  }

  const defaultOptions: RevealOptions = {
    total: 900,
    minTile: 150,
    reducedMotion: false,
  };

  it('handles 12 units correctly', () => {
    const units = createUnits(12);
    // Shuffle the units to test sorting
    const shuffled = [...units].reverse();

    const result = revealPlan(shuffled, origin, defaultOptions);

    expect(result.length).toBe(12);

    // Nearest should be the first unit (radius 0)
    expect(result[0].teryt).toBe('t_0000');

    // Check durations and delays
    for (const r of result) {
      expect(r.duration).toBeGreaterThanOrEqual(defaultOptions.minTile);
      expect(r.delay + r.duration).toBeLessThanOrEqual(defaultOptions.total);
    }

    // Last element should end at exactly total
    const lastResult = result[result.length - 1];
    expect(lastResult.delay + lastResult.duration).toBeCloseTo(defaultOptions.total, 5);
  });

  it('handles 22 units correctly', () => {
    const units = createUnits(22);
    const result = revealPlan(units, origin, defaultOptions);

    expect(result.length).toBe(22);

    // Nearest should be the first unit
    expect(result[0].teryt).toBe('t_0000');

    // Check durations and delays
    for (const r of result) {
      expect(r.duration).toBeGreaterThanOrEqual(defaultOptions.minTile);
      expect(r.delay + r.duration).toBeLessThanOrEqual(defaultOptions.total);
    }

    // Last element should end at exactly total
    const lastResult = result[result.length - 1];
    expect(lastResult.delay + lastResult.duration).toBeCloseTo(defaultOptions.total, 5);
  });

  it('handles 200 units correctly', () => {
    const units = createUnits(200);
    const result = revealPlan(units, origin, defaultOptions);

    expect(result.length).toBe(200);

    // Nearest should be the first unit
    expect(result[0].teryt).toBe('t_0000');

    // Check durations and delays
    for (const r of result) {
      expect(r.duration).toBeGreaterThanOrEqual(defaultOptions.minTile);
      expect(r.delay + r.duration).toBeLessThanOrEqual(defaultOptions.total);
    }

    // Last element should end at exactly total
    const lastResult = result[result.length - 1];
    expect(lastResult.delay + lastResult.duration).toBeCloseTo(defaultOptions.total, 5);
  });

  it('returns delay 0 and duration 0 when reducedMotion is true', () => {
    const units = createUnits(10);
    const options: RevealOptions = { ...defaultOptions, reducedMotion: true };
    const result = revealPlan(units, origin, options);

    for (const r of result) {
      expect(r.delay).toBe(0);
      expect(r.duration).toBe(0);
    }
  });

  it('is deterministic', () => {
    const units = createUnits(50);
    const result1 = revealPlan(units, origin, defaultOptions);
    const result2 = revealPlan(units, origin, defaultOptions);

    expect(result1).toEqual(result2);
  });

  it('handles ties using teryt', () => {
    const units: RevealUnit[] = [
      { teryt: '04', centroid: [10, 10] },
      { teryt: '02', centroid: [10, 10] },
      { teryt: '01', centroid: [10, 10] },
      { teryt: '03', centroid: [10, 10] },
    ];

    const result = revealPlan(units, origin, defaultOptions);

    expect(result.map(r => r.teryt)).toEqual(['01', '02', '03', '04']);
  });

  it('handles empty input', () => {
    const result = revealPlan([], origin, defaultOptions);
    expect(result).toEqual([]);
  });

  it('handles single unit input', () => {
    const units: RevealUnit[] = [{ teryt: '01', centroid: [10, 10] }];
    const result = revealPlan(units, origin, defaultOptions);

    expect(result).toEqual([
      {
        teryt: '01',
        order: 0,
        delay: 0,
        duration: defaultOptions.total,
      }
    ]);
  });
});
