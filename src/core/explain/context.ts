import type { IndicatorValues } from '../profile/profile';
import type { Unit } from '../units/types';

export type ContextStats = {
  percentBelow: number;
  median: number;
  min: number;
  max: number;
};

export type ContextResult = {
  rank: number;
  total: number;
  percentBelow: number;
  medianPoland: number;
  min: number;
  max: number;
  position0to1: number;
  sameInVoivodeship: ContextStats | null;
};

function calculateMedian(sortedArr: number[]): number {
  if (sortedArr.length === 0) return 0;
  const mid = Math.floor(sortedArr.length / 2);
  if (sortedArr.length % 2 === 0) {
    return (sortedArr[mid - 1] + sortedArr[mid]) / 2;
  }
  return sortedArr[mid];
}

export function context(
  values: IndicatorValues,
  units: Unit[],
  teryt: string,
  year: number,
  higherIsBetter: boolean | null
): ContextResult | null {
  const targetUnit = units.find((u) => u.teryt === teryt);
  if (!targetUnit) return null;

  const yearIndex = values.years.indexOf(year);
  if (yearIndex === -1) return null;

  const targetValue = values.values[teryt]?.[yearIndex];
  if (targetValue === undefined || targetValue === null || Number.isNaN(targetValue)) {
    return null;
  }

  const levelUnits = units.filter((u) => u.level === targetUnit.level);

  const levelValues: number[] = [];
  const voivodeshipValues: number[] = [];
  const targetVoivodeship = targetUnit.level === 'woj' ? null : teryt.slice(0, 2);

  let worseCount = 0;
  let wojWorseCount = 0;
  let betterCount = 0;

  for (const u of levelUnits) {
    const val = values.values[u.teryt]?.[yearIndex];
    if (val !== undefined && val !== null && !Number.isNaN(val)) {
      levelValues.push(val);

      if (higherIsBetter === false) {
         if (val > targetValue) worseCount++;
         if (val < targetValue) betterCount++;
      } else {
         if (val < targetValue) worseCount++;
         if (val > targetValue) betterCount++;
      }

      if (targetVoivodeship && u.teryt.startsWith(targetVoivodeship)) {
        voivodeshipValues.push(val);
        if (higherIsBetter === false) {
           if (val > targetValue) wojWorseCount++;
        } else {
           if (val < targetValue) wojWorseCount++;
        }
      }
    }
  }

  const total = levelValues.length;
  if (total === 0) return null;

  levelValues.sort((a, b) => a - b);
  const min = levelValues[0];
  const max = levelValues[levelValues.length - 1];
  const medianPoland = calculateMedian(levelValues);

  const rank = betterCount + 1;

  let percentBelow = Math.round((worseCount / total) * 100);
  let position0to1 = max === min ? 0 : (targetValue - min) / (max - min);

  let sameInVoivodeship: ContextStats | null = null;

  if (targetUnit.level !== 'woj' && voivodeshipValues.length > 0) {
    voivodeshipValues.sort((a, b) => a - b);
    sameInVoivodeship = {
      percentBelow: Math.round((wojWorseCount / voivodeshipValues.length) * 100),
      median: calculateMedian(voivodeshipValues),
      min: voivodeshipValues[0],
      max: voivodeshipValues[voivodeshipValues.length - 1],
    };
  }

  return {
    rank,
    total,
    percentBelow,
    medianPoland,
    min,
    max,
    position0to1,
    sameInVoivodeship,
  };
}
