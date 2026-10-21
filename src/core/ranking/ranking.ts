import type { IndicatorValues } from '../profile/profile';
import type { Unit, UnitLevel } from '../units/types';

export type RankedUnit = {
  teryt: string;
  name: string;
  value: number;
  rank: number;
  total: number;
};

export type RankUnitsParams = {
  values: IndicatorValues;
  units: Unit[];
  level: UnitLevel;
  year: number;
  parentTeryt?: string;
  higherIsBetter?: boolean | null;
};

export type RankedResult = RankedUnit[] & {
  missingCount: number;
  noDataCount: number;
  items: RankedUnit[];
};

/**
 * Oblicza ranking jednostek dla danego wskaźnika, poziomu i roku.
 * Jednostki bez wartości w danym roku są pomijane w głównej liście (ich liczba jest dostępna w `missingCount`).
 * Uwzględnia remisy oraz kierunek wskaźnika (`higherIsBetter`).
 */
export function rankUnits({
  values,
  units,
  level,
  year,
  parentTeryt,
  higherIsBetter,
}: RankUnitsParams): RankedResult {
  if (!values || !values.years || values.years.length === 0) {
    const emptyResult: any = [];
    emptyResult.missingCount = 0;
    emptyResult.noDataCount = 0;
    emptyResult.items = emptyResult;
    return emptyResult;
  }

  const yearIdx = values.years.indexOf(year);
  if (yearIdx === -1) {
    const emptyResult: any = [];
    emptyResult.missingCount = 0;
    emptyResult.noDataCount = 0;
    emptyResult.items = emptyResult;
    return emptyResult;
  }

  // Filtrowanie jednostek o odpowiadającym poziomie oraz należących do rodzeństwa/dzieci parentTeryt
  const matchingUnits = units.filter((u) => {
    if (u.level !== level) return false;
    if (!parentTeryt) return true;
    return u.parent === parentTeryt || u.teryt.startsWith(parentTeryt);
  });

  const unitsWithValues: { unit: Unit; value: number }[] = [];
  let missingCount = 0;

  for (const u of matchingUnits) {
    const val = values.values[u.teryt]?.[yearIdx];
    if (val !== undefined && val !== null && !Number.isNaN(val)) {
      unitsWithValues.push({ unit: u, value: val });
    } else {
      missingCount++;
    }
  }

  const total = unitsWithValues.length;

  // Sortowanie: dla higherIsBetter === false rosnąco (najniższa wartość pierwsza), dla pozostałych malejąco
  const isDescending = higherIsBetter !== false;

  unitsWithValues.sort((a, b) => {
    if (a.value !== b.value) {
      return isDescending ? b.value - a.value : a.value - b.value;
    }
    return a.unit.name.localeCompare(b.unit.name, 'pl');
  });

  // Liczenie miejsc z uwzględnieniem remisów
  const rankedUnits: RankedUnit[] = unitsWithValues.map(({ unit, value }) => {
    let betterCount = 0;
    if (higherIsBetter === false) {
      // Niżej lepiej: miejsce 1 to najmniejsza wartość
      for (const item of unitsWithValues) {
        if (item.value < value) betterCount++;
      }
    } else {
      // Wyżej lepiej (lub neutralny/null): miejsce 1 to największa wartość
      for (const item of unitsWithValues) {
        if (item.value > value) betterCount++;
      }
    }

    return {
      teryt: unit.teryt,
      name: unit.name,
      value,
      rank: 1 + betterCount,
      total,
    };
  });

  const result: any = rankedUnits;
  result.missingCount = missingCount;
  result.noDataCount = missingCount;
  result.items = rankedUnits;

  return result;
}

/**
 * Zwraca `n` najwyższych oraz `n` najniższych pozycji z posortowanej listy rankingowej.
 */
export function topBottom(
  list: RankedUnit[],
  n: number
): { top: RankedUnit[]; bottom: RankedUnit[] } {
  if (!list || list.length === 0) {
    return { top: [], bottom: [] };
  }

  const top = list.slice(0, n);
  const bottom = list.length > n ? list.slice(-n) : [];

  return { top, bottom };
}
