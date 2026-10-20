import { describe, test, expect } from 'vitest';
import { rankUnits, topBottom } from '../../src/core/ranking/ranking';
import { buildProfile, type Indicator, type IndicatorValues } from '../../src/core/profile/profile';
import type { Unit } from '../../src/core/units/types';
import indicatorsJson from '../../config/indicators.json';
import unitsJson from '../../public/data/units.json';

// Import 5 indicator value files for alignment testing
import densityValues from '../../public/data/values/density.json';
import unemploymentRateValues from '../../public/data/values/unemployment-rate.json';
import populationValues from '../../public/data/values/population.json';
import avgWageValues from '../../public/data/values/avg-wage.json';
import forestCoverValues from '../../public/data/values/forest-cover.json';

const units = unitsJson as Unit[];
const indicators = indicatorsJson as Indicator[];

describe('rankUnits pure logic', () => {
  test('omits units without value in the target year and calculates missingCount', () => {
    const mockValues: IndicatorValues = {
      indicatorId: 'test-ind',
      years: [2022],
      fetchedAt: '2024-01-01',
      values: {
        '02': [100],
        '04': [null],
        '06': [200],
      },
    };

    const mockUnits: Unit[] = [
      { teryt: '02', name: 'Dolnośląskie', level: 'woj', parent: null, bdlId: '1', bbox: [0, 0, 0, 0], centroid: [0, 0] },
      { teryt: '04', name: 'Kujawsko-Pomorskie', level: 'woj', parent: null, bdlId: '2', bbox: [0, 0, 0, 0], centroid: [0, 0] },
      { teryt: '06', name: 'Lubelskie', level: 'woj', parent: null, bdlId: '3', bbox: [0, 0, 0, 0], centroid: [0, 0] },
      { teryt: '08', name: 'Lubuskie', level: 'woj', parent: null, bdlId: '4', bbox: [0, 0, 0, 0], centroid: [0, 0] },
    ];

    const result = rankUnits({
      values: mockValues,
      units: mockUnits,
      level: 'woj',
      year: 2022,
      higherIsBetter: true,
    });

    expect(result.length).toBe(2);
    expect(result.map((u) => u.teryt)).toEqual(['06', '02']); // 200 -> 100
    expect((result as any).missingCount).toBe(2); // 04 (null) and 08 (missing key)
  });

  test('assigns same rank for ties (remisy)', () => {
    const mockValues: IndicatorValues = {
      indicatorId: 'test-ind',
      years: [2022],
      fetchedAt: '2024-01-01',
      values: {
        '02': [150],
        '04': [200],
        '06': [200],
        '08': [100],
      },
    };

    const mockUnits: Unit[] = [
      { teryt: '02', name: 'Dolnośląskie', level: 'woj', parent: null, bdlId: '1', bbox: [0, 0, 0, 0], centroid: [0, 0] },
      { teryt: '04', name: 'Kujawsko-Pomorskie', level: 'woj', parent: null, bdlId: '2', bbox: [0, 0, 0, 0], centroid: [0, 0] },
      { teryt: '06', name: 'Lubelskie', level: 'woj', parent: null, bdlId: '3', bbox: [0, 0, 0, 0], centroid: [0, 0] },
      { teryt: '08', name: 'Lubuskie', level: 'woj', parent: null, bdlId: '4', bbox: [0, 0, 0, 0], centroid: [0, 0] },
    ];

    const result = rankUnits({
      values: mockValues,
      units: mockUnits,
      level: 'woj',
      year: 2022,
      higherIsBetter: true,
    });

    // 04 and 06 tie for 1st place with value 200
    const kujawsko = result.find((r) => r.teryt === '04');
    const lubelskie = result.find((r) => r.teryt === '06');
    const dolnoslaskie = result.find((r) => r.teryt === '02');
    const lubuskie = result.find((r) => r.teryt === '08');

    expect(kujawsko?.rank).toBe(1);
    expect(lubelskie?.rank).toBe(1);
    expect(dolnoslaskie?.rank).toBe(3);
    expect(lubuskie?.rank).toBe(4);
    expect(result[0].total).toBe(4);
  });

  test('parentTeryt restricts units to children of parent', () => {
    const mockValues: IndicatorValues = {
      indicatorId: 'test-ind',
      years: [2022],
      fetchedAt: '2024-01-01',
      values: {
        '1401': [10],
        '1402': [20],
        '0201': [30],
      },
    };

    const mockUnits: Unit[] = [
      { teryt: '1401', name: 'Powiat A', level: 'pow', parent: '14', bdlId: '1', bbox: [0, 0, 0, 0], centroid: [0, 0] },
      { teryt: '1402', name: 'Powiat B', level: 'pow', parent: '14', bdlId: '2', bbox: [0, 0, 0, 0], centroid: [0, 0] },
      { teryt: '0201', name: 'Powiat C', level: 'pow', parent: '02', bdlId: '3', bbox: [0, 0, 0, 0], centroid: [0, 0] },
    ];

    const result = rankUnits({
      values: mockValues,
      units: mockUnits,
      level: 'pow',
      year: 2022,
      parentTeryt: '14',
      higherIsBetter: true,
    });

    expect(result.length).toBe(2);
    expect(result.map((r) => r.teryt)).toEqual(['1402', '1401']);
  });

  test('higherIsBetter: false reverses ranking order (lowest value gets rank 1)', () => {
    const mockValues: IndicatorValues = {
      indicatorId: 'unemployment-rate',
      years: [2022],
      fetchedAt: '2024-01-01',
      values: {
        '02': [10], // 10%
        '04': [5],  // 5% -> best (rank 1)
        '06': [8],  // 8% -> 2nd best (rank 2)
      },
    };

    const mockUnits: Unit[] = [
      { teryt: '02', name: 'Dolnośląskie', level: 'woj', parent: null, bdlId: '1', bbox: [0, 0, 0, 0], centroid: [0, 0] },
      { teryt: '04', name: 'Kujawsko-Pomorskie', level: 'woj', parent: null, bdlId: '2', bbox: [0, 0, 0, 0], centroid: [0, 0] },
      { teryt: '06', name: 'Lubelskie', level: 'woj', parent: null, bdlId: '3', bbox: [0, 0, 0, 0], centroid: [0, 0] },
    ];

    const result = rankUnits({
      values: mockValues,
      units: mockUnits,
      level: 'woj',
      year: 2022,
      higherIsBetter: false,
    });

    expect(result[0].teryt).toBe('04'); // value 5
    expect(result[0].rank).toBe(1);
    expect(result[1].teryt).toBe('06'); // value 8
    expect(result[1].rank).toBe(2);
    expect(result[2].teryt).toBe('02'); // value 10
    expect(result[2].rank).toBe(3);
  });

  test('aligns with rankNational from buildProfile for 5 real indicators', () => {
    const testCases = [
      { indicatorId: 'density', values: densityValues, level: 'gmi' as const },
      { indicatorId: 'unemployment-rate', values: unemploymentRateValues, level: 'pow' as const },
      { indicatorId: 'population', values: populationValues, level: 'woj' as const },
      { indicatorId: 'avg-wage', values: avgWageValues, level: 'pow' as const },
      { indicatorId: 'forest-cover', values: forestCoverValues, level: 'gmi' as const },
    ];

    for (const tc of testCases) {
      const indicator = indicators.find((i) => i.id === tc.indicatorId)!;
      expect(indicator).toBeDefined();

      const valuesById = { [indicator.id]: tc.values as unknown as IndicatorValues };
      const latestYear = tc.values.years[tc.values.years.length - 1];

      const ranking = rankUnits({
        values: tc.values as unknown as IndicatorValues,
        units,
        level: tc.level,
        year: latestYear,
        higherIsBetter: indicator.higherIsBetter,
      });

      // Sample 10 units at that level and check buildProfile match
      const matchingUnits = units.filter((u) => u.level === tc.level).slice(0, 10);

      for (const u of matchingUnits) {
        const profile = buildProfile(u.teryt, [indicator], valuesById, units);
        const profileItem = profile.indicators.find((i) => i.indicatorId === indicator.id);

        const rankItem = ranking.find((r) => r.teryt === u.teryt);

        expect(profileItem).toBeDefined();
        expect(profileItem?.value).not.toBeNull();
        expect(rankItem).toBeDefined();
        expect(rankItem?.rank).toBe(profileItem?.rankNational);
        expect(rankItem?.total).toBe(profileItem?.totalNational);
      }
    }
  });

  test('topBottom splits list into top and bottom items correctly', () => {
    const items = Array.from({ length: 16 }, (_, i) => ({
      teryt: String(i + 1).padStart(2, '0'),
      name: `Unit ${i + 1}`,
      value: 100 - i,
      rank: i + 1,
      total: 16,
    }));

    const { top, bottom } = topBottom(items, 5);

    expect(top.length).toBe(5);
    expect(top.map((i) => i.rank)).toEqual([1, 2, 3, 4, 5]);

    expect(bottom.length).toBe(5);
    expect(bottom.map((i) => i.rank)).toEqual([12, 13, 14, 15, 16]);
  });
});
