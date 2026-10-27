import partsConfig from '../../../config/parts.json';
import type { Indicator, IndicatorValues } from '../profile/profile';
import { gminaKind } from '../units/label';

export type PartsShard = {
  voivodeship?: string;
  years?: Record<string, number[]> | number[];
  values?: Record<string, Record<string, (number | null)[]>>;
};

export interface PartsRow {
  indicatorId: string;
  name: string;
  unit: string;
  gmina: number | null;
  city: number | null;
  rural: number | null;
}

export interface PartsRowsResult {
  year: number | null;
  rows: PartsRow[];
}

export interface PartsRowsParams {
  gminaTeryt: string;
  shard?: PartsShard | null;
  values?: IndicatorValues | Record<string, IndicatorValues> | (IndicatorValues | null)[] | null;
  indicators: Indicator[];
}

function getYearsForIndicator(shard: PartsShard, indId: string): number[] | null {
  if (!shard.years) return null;
  if (Array.isArray(shard.years)) return shard.years;
  if (typeof shard.years === 'object' && indId in shard.years) {
    return shard.years[indId];
  }
  return null;
}

function extractGminaValue(
  values: IndicatorValues | Record<string, IndicatorValues> | (IndicatorValues | null)[] | null | undefined,
  indId: string,
  gminaTeryt: string,
  year: number | null
): number | null {
  if (!values || year === null) return null;

  let indValues: IndicatorValues | null | undefined = null;

  if (Array.isArray(values)) {
    indValues = values.find((v) => v && v.indicatorId === indId);
  } else if ('indicatorId' in values && typeof values.indicatorId === 'string') {
    if (values.indicatorId === indId) {
      indValues = values as IndicatorValues;
    }
  } else if (typeof values === 'object') {
    const record = values as Record<string, IndicatorValues>;
    indValues = record[indId];
  }

  if (!indValues || !indValues.years || !indValues.values) {
    return null;
  }

  const idx = indValues.years.indexOf(year);
  if (idx === -1) {
    return null;
  }

  const valArray = indValues.values[gminaTeryt];
  if (!valArray || idx >= valArray.length) {
    return null;
  }

  const val = valArray[idx];
  if (val === null || val === undefined || Number.isNaN(val)) {
    return null;
  }
  return val;
}

/**
 * Składa wiersze tabeli "Gmina · Miasto · Obszar wiejski" dla gminy miejsko-wiejskiej.
 */
export function partsRows({
  gminaTeryt,
  shard,
  values,
  indicators,
}: PartsRowsParams): PartsRowsResult {
  if (!gminaTeryt || gminaKind(gminaTeryt) !== 'gmina miejsko-wiejska') {
    return { year: null, rows: [] };
  }

  if (!shard || !shard.values) {
    return { year: null, rows: [] };
  }

  const cityTeryt = gminaTeryt.slice(0, 6) + '4';
  const ruralTeryt = gminaTeryt.slice(0, 6) + '5';

  const cityData = shard.values[cityTeryt];
  const ruralData = shard.values[ruralTeryt];

  const indicatorIds = partsConfig as string[];

  // Szukamy najnowszego roku, w którym jest wartość miasta lub wsi któregokolwiek wskaźnika
  let latestYear: number | null = null;

  for (const indId of indicatorIds) {
    const yearsArr = getYearsForIndicator(shard, indId);
    if (!yearsArr) continue;

    const cityVals = cityData?.[indId];
    const ruralVals = ruralData?.[indId];

    for (let i = 0; i < yearsArr.length; i++) {
      const yr = yearsArr[i];
      const cVal = cityVals?.[i];
      const rVal = ruralVals?.[i];

      const hasCityVal = cVal !== null && cVal !== undefined && !Number.isNaN(cVal);
      const hasRuralVal = rVal !== null && rVal !== undefined && !Number.isNaN(rVal);

      if (hasCityVal || hasRuralVal) {
        if (latestYear === null || yr > latestYear) {
          latestYear = yr;
        }
      }
    }
  }

  const indicatorsById = new Map<string, Indicator>();
  if (Array.isArray(indicators)) {
    for (const ind of indicators) {
      if (ind && ind.id) {
        indicatorsById.set(ind.id, ind);
      }
    }
  }

  const rows: PartsRow[] = indicatorIds.map((indId) => {
    const indObj = indicatorsById.get(indId);
    const name = indObj?.name ?? indId;
    const unit = indObj?.unit ?? '';

    let city: number | null = null;
    let rural: number | null = null;

    if (latestYear !== null) {
      const yearsArr = getYearsForIndicator(shard, indId);
      if (yearsArr) {
        const idx = yearsArr.indexOf(latestYear);
        if (idx !== -1) {
          const cVal = cityData?.[indId]?.[idx];
          if (cVal !== null && cVal !== undefined && !Number.isNaN(cVal)) {
            city = cVal;
          }

          const rVal = ruralData?.[indId]?.[idx];
          if (rVal !== null && rVal !== undefined && !Number.isNaN(rVal)) {
            rural = rVal;
          }
        }
      }
    }

    const gmina = extractGminaValue(values, indId, gminaTeryt, latestYear);

    return {
      indicatorId: indId,
      name,
      unit,
      gmina,
      city,
      rural,
    };
  });

  return {
    year: latestYear,
    rows,
  };
}
