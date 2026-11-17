import { formatValue, getFractionDigits } from '../format/number';
import type { Unit } from '../units/types';
import { unitLabel } from '../units/label';
import type { RankedUnit } from './ranking';

export type RankingSummary = {
  highest: string | null;
  lowest: string | null;
  median: string | null;
  count: number;
};

// Mediana policzona z wartości; dla parzystej liczby średnia dwóch środkowych.
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Zamienia policzony ranking na trzy zdania: najwyżej, najniżej, mediana.
 * `items` zakładamy już uporządkowane (remisy: pierwszy wg kolejności rankingu).
 * `format` formatuje samą liczbę (bez jednostki); domyślnie polski zapis wg wskaźnika.
 */
export function summarizeRanking(
  items: RankedUnit[],
  unitsByTeryt: Map<string, Unit>,
  unit: string,
  format: (n: number) => string = (n) => formatValue(n, null, getFractionDigits(unit)),
): RankingSummary {
  if (items.length === 0) {
    return { highest: null, lowest: null, median: null, count: 0 };
  }
  const withUnit = (n: number) => `${format(n)} ${unit}`.trim();
  const label = (item: RankedUnit) => {
    const u = unitsByTeryt.get(item.teryt);
    return u ? unitLabel(u) : item.name || item.teryt;
  };

  // Najwyżej/najniżej wg wartości; przy remisie wygrywa pierwszy z listy.
  let hi = items[0];
  let lo = items[0];
  for (const item of items) {
    if (item.value > hi.value) hi = item;
    if (item.value < lo.value) lo = item;
  }

  return {
    highest: `Najwyżej: ${label(hi)}, ${withUnit(hi.value)}`,
    lowest: `Najniżej: ${label(lo)}, ${withUnit(lo.value)}`,
    median: `Mediana: ${withUnit(median(items.map((i) => i.value)))}`,
    count: items.length,
  };
}
