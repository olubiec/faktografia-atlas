import type { IndicatorValues } from '../facts/types';

export interface OverviewItem {
  value: number | null;
  year: number | null;
  series: { year: number; value: number | null }[];
}

/**
 * Wartość, rok i seria jednostki dla WYBRANEGO wskaźnika (view.values) i roku.
 * Nigdy nie sięga po inny wskaźnik: brak danych = value null.
 */
export function overviewItem(
  values: IndicatorValues | null,
  teryt: string,
  year: number | null,
): OverviewItem {
  const row = values?.values[teryt];
  if (!values || !row) return { value: null, year, series: [] };
  const series = values.years.map((y, i) => ({ year: y, value: row[i] ?? null }));
  const idx = year === null ? -1 : values.years.indexOf(year);
  const value = idx >= 0 ? (row[idx] ?? null) : null;
  return { value, year, series };
}
