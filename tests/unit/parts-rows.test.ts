import { describe, expect, it } from 'vitest';
import partsConfig from '../../config/parts.json';
import type { Indicator, IndicatorValues } from '../../src/core/profile/profile';
import { partsRows, type PartsShard } from '../../src/core/parts/rows';

const mockIndicators: Indicator[] = [
  {
    id: 'population',
    bdlVarId: 72305,
    name: 'Ludność',
    unit: 'osoba',
    description: '',
    group: 'demografia',
    higherIsBetter: null,
    minLevel: 'gmi',
  },
  {
    id: 'density',
    bdlVarId: 60559,
    name: 'Gęstość zaludnienia',
    unit: 'os./km²',
    description: '',
    group: 'demografia',
    higherIsBetter: null,
    minLevel: 'gmi',
  },
  {
    id: 'median-age',
    bdlVarId: 10001,
    name: 'Mediana wieku',
    unit: 'lata',
    description: '',
    group: 'demografia',
    higherIsBetter: null,
    minLevel: 'gmi',
  },
];

describe('partsRows - W1.20', () => {
  const gminaMwTeryt = '1206113'; // Gmina miejsko-wiejska
  const gminaCityTeryt = '1206114';
  const gminaRuralTeryt = '1206115';

  const mockShard: PartsShard = {
    voivodeship: '12',
    years: {
      population: [2022, 2023],
      density: [2022, 2023],
    },
    values: {
      [gminaCityTeryt]: {
        population: [5000, 5200],
        density: [150.0, 155.0],
      },
      [gminaRuralTeryt]: {
        population: [3000, 3100],
        density: [40.0, 42.0],
      },
    },
  };

  const mockValuesRecord: Record<string, IndicatorValues> = {
    population: {
      indicatorId: 'population',
      years: [2022, 2023],
      values: {
        [gminaMwTeryt]: [8000, 8300],
      },
      fetchedAt: '2025-01-01',
    },
    density: {
      indicatorId: 'density',
      years: [2022, 2023],
      values: {
        [gminaMwTeryt]: [80.0, 83.5],
      },
      fetchedAt: '2025-01-01',
    },
  };

  it('gmina m-w → 14 wierszy w kolejności z config/parts.json', () => {
    const result = partsRows({
      gminaTeryt: gminaMwTeryt,
      shard: mockShard,
      values: mockValuesRecord,
      indicators: mockIndicators,
    });

    expect(result.rows).toHaveLength(14);
    expect(result.rows.map((r) => r.indicatorId)).toEqual(partsConfig);
  });

  it('gmina miejska i wiejska oraz powiat i województwo → pusto (rows: [])', () => {
    const gminaM = '1206111'; // Gmina miejska
    const gminaW = '1206112'; // Gmina wiejska
    const powiat = '1206000'; // Powiat
    const woj = '1200000'; // Województwo

    for (const teryt of [gminaM, gminaW, powiat, woj, '123']) {
      const res = partsRows({
        gminaTeryt: teryt,
        shard: mockShard,
        values: mockValuesRecord,
        indicators: mockIndicators,
      });
      expect(res.year).toBeNull();
      expect(res.rows).toEqual([]);
    }
  });

  it('brak shardu → rows: []', () => {
    const res1 = partsRows({
      gminaTeryt: gminaMwTeryt,
      shard: null,
      values: mockValuesRecord,
      indicators: mockIndicators,
    });
    expect(res1.year).toBeNull();
    expect(res1.rows).toEqual([]);

    const res2 = partsRows({
      gminaTeryt: gminaMwTeryt,
      shard: undefined,
      values: mockValuesRecord,
      indicators: mockIndicators,
    });
    expect(res2.year).toBeNull();
    expect(res2.rows).toEqual([]);
  });

  it('miasto + wieś = gmina dla ludności', () => {
    const result = partsRows({
      gminaTeryt: gminaMwTeryt,
      shard: mockShard,
      values: mockValuesRecord,
      indicators: mockIndicators,
    });

    expect(result.year).toBe(2023);

    const popRow = result.rows.find((r) => r.indicatorId === 'population');
    expect(popRow).toBeDefined();
    expect(popRow?.city).toBe(5200);
    expect(popRow?.rural).toBe(3100);
    expect(popRow?.gmina).toBe(8300);

    expect(popRow!.city! + popRow!.rural!).toBe(popRow!.gmina);
  });

  it('rok pierwszy z wartością: wybiera najnowszy rok z danymi miasta/wsi', () => {
    const multiYearShard: PartsShard = {
      years: {
        population: [2020, 2021, 2022],
        density: [2020, 2021, 2022, 2023],
      },
      values: {
        [gminaCityTeryt]: {
          population: [4800, 4900, 5000],
          density: [140.0, 145.0, null, 155.0],
        },
        [gminaRuralTeryt]: {
          population: [2800, 2900, 3000],
          density: [38.0, 39.0, null, null],
        },
      },
    };

    const result = partsRows({
      gminaTeryt: gminaMwTeryt,
      shard: multiYearShard,
      values: mockValuesRecord,
      indicators: mockIndicators,
    });

    // year 2023 has density city value (155.0)
    expect(result.year).toBe(2023);

    const densityRow = result.rows.find((r) => r.indicatorId === 'density');
    expect(densityRow?.city).toBe(155.0);
    expect(densityRow?.rural).toBeNull();

    const popRow = result.rows.find((r) => r.indicatorId === 'population');
    // population indicator has no 2023 data in shard.years['population']
    expect(popRow?.city).toBeNull();
    expect(popRow?.rural).toBeNull();
  });

  it('null zostaje null w brakujących wartościach', () => {
    const shardWithNulls: PartsShard = {
      years: {
        population: [2023],
      },
      values: {
        [gminaCityTeryt]: {
          population: [null],
        },
        [gminaRuralTeryt]: {
          population: [3100],
        },
      },
    };

    const result = partsRows({
      gminaTeryt: gminaMwTeryt,
      shard: shardWithNulls,
      values: null,
      indicators: mockIndicators,
    });

    expect(result.year).toBe(2023);
    const popRow = result.rows.find((r) => r.indicatorId === 'population');
    expect(popRow?.city).toBeNull();
    expect(popRow?.rural).toBe(3100);
    expect(popRow?.gmina).toBeNull();
  });

  it('obsługuje pojedynczy obiekt IndicatorValues oraz tablicę IndicatorValues[]', () => {
    const singleValue: IndicatorValues = {
      indicatorId: 'population',
      years: [2023],
      values: {
        [gminaMwTeryt]: [8300],
      },
      fetchedAt: '2025-01-01',
    };

    const resSingle = partsRows({
      gminaTeryt: gminaMwTeryt,
      shard: mockShard,
      values: singleValue,
      indicators: mockIndicators,
    });
    expect(resSingle.rows.find((r) => r.indicatorId === 'population')?.gmina).toBe(8300);
    expect(resSingle.rows.find((r) => r.indicatorId === 'density')?.gmina).toBeNull();

    const resArray = partsRows({
      gminaTeryt: gminaMwTeryt,
      shard: mockShard,
      values: [singleValue],
      indicators: mockIndicators,
    });
    expect(resArray.rows.find((r) => r.indicatorId === 'population')?.gmina).toBe(8300);
  });
});
