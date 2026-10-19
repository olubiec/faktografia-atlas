import type { IndicatorValues } from '../profile/profile';
import type { Unit, UnitLevel } from '../units/types';
import {
  computeBreaks,
  classify,
  type ClassificationMethod,
  type ClassificationScheme,
  type ClassifyResult,
} from './classes';

export type BuildChoroplethParams = {
  values?: IndicatorValues | null;
  units: Unit[];
  level: UnitLevel;
  year?: number;
  n?: number;
  method?: ClassificationMethod;
};

export type ChoroplethResult = {
  year: number | null;
  breaks: number[];
  scheme: ClassificationScheme;
  classByTeryt: Record<string, ClassifyResult>;
};

/**
 * Zwraca 'diverging', gdy pośród podanych wartości występują zarówno ujemne, jak i dodatnie liczby.
 * W przeciwnym wypadku zwraca 'sequential'.
 */
export function schemeFor(
  numbers: (number | null | undefined)[]
): ClassificationScheme {
  let hasNegative = false;
  let hasPositive = false;

  for (const num of numbers) {
    if (typeof num === 'number' && !Number.isNaN(num)) {
      if (num < 0) hasNegative = true;
      if (num > 0) hasPositive = true;
    }
  }

  return hasNegative && hasPositive ? 'diverging' : 'sequential';
}

/**
 * Buduje podział na klasy koloru dla jednostek danego poziomu na podstawie wartości wskaźnika.
 * Progi są wyliczane ze wszystkich jednostek podanego poziomu w kraju.
 */
export function buildChoropleth({
  values,
  units,
  level,
  year,
  n = 5,
  method = 'quantile',
}: BuildChoroplethParams): ChoroplethResult {
  const unitsOfLevel = units.filter((u) => u.level === level);
  const classByTeryt: Record<string, ClassifyResult> = {};

  if (!values || !values.years || values.years.length === 0) {
    for (const u of unitsOfLevel) {
      classByTeryt[u.teryt] = 'no-data';
    }
    return {
      year: year ?? null,
      breaks: [],
      scheme: 'sequential',
      classByTeryt,
    };
  }

  let effectiveYear: number | null = null;
  let yearIdx = -1;

  if (typeof year === 'number' && values.years.includes(year)) {
    effectiveYear = year;
    yearIdx = values.years.indexOf(year);
  } else {
    // Od najnowszego roku szukamy roku z jakąkolwiek wartością na podanym poziomie
    for (let i = values.years.length - 1; i >= 0; i--) {
      const hasAnyVal = unitsOfLevel.some((u) => {
        const val = values.values[u.teryt]?.[i];
        return val !== null && val !== undefined;
      });
      if (hasAnyVal) {
        effectiveYear = values.years[i];
        yearIdx = i;
        break;
      }
    }

    // Jeśli w żadnym roku nie ma wartości dla danego poziomu, wybieramy ostatni dostępny rok
    if (yearIdx === -1) {
      yearIdx = values.years.length - 1;
      effectiveYear = values.years[yearIdx];
    }
  }

  const rawValues = unitsOfLevel.map((u) => values.values[u.teryt]?.[yearIdx]);
  const scheme = schemeFor(rawValues);
  const breaks = computeBreaks(rawValues, method, n);

  for (const u of unitsOfLevel) {
    const val = values.values[u.teryt]?.[yearIdx];
    classByTeryt[u.teryt] = classify(val, breaks);
  }

  return {
    year: effectiveYear,
    breaks,
    scheme,
    classByTeryt,
  };
}
