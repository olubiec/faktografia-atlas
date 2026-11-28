// Na których poziomach wskaźnik ma w danym roku jakiekolwiek wartości (przełącznik poziomu).
import type { UnitLevel } from '../units/types';

const ORDER: UnitLevel[] = ['woj', 'pow', 'gmi'];
const TERYT_LENGTH: Record<UnitLevel, number> = { woj: 2, pow: 4, gmi: 7 };

const has = (v: number | null | undefined) => typeof v === 'number' && !Number.isNaN(v);

/**
 * Poziomy, dla których są wartości liczbowe w roku `year` (gdy roku brak – w którymkolwiek roku).
 * Poziom ustala się po długości kodu TERYT (2/4/7 znaków).
 */
export function levelsWithData(
  values: { years: number[]; values: Record<string, (number | null)[]> } | null | undefined,
  year: number | null | undefined
): UnitLevel[] {
  if (!values) return [];
  const yi = year != null ? values.years.indexOf(year) : -1;
  const found = new Set<UnitLevel>();
  for (const [teryt, series] of Object.entries(values.values)) {
    const level = ORDER.find((l) => TERYT_LENGTH[l] === teryt.length);
    if (!level || found.has(level)) continue;
    if (yi >= 0 ? has(series[yi]) : series.some(has)) found.add(level);
  }
  return ORDER.filter((l) => found.has(l));
}

/** Poziom do pokazania, gdy wybrany jest pusty: najbliższy z danymi (przy remisie płytszy). */
export function fallbackLevel(level: UnitLevel, available: UnitLevel[]): UnitLevel {
  if (available.length === 0 || available.includes(level)) return level;
  const d = (l: UnitLevel) => Math.abs(ORDER.indexOf(l) - ORDER.indexOf(level));
  return [...available].sort((a, b) => d(a) - d(b) || ORDER.indexOf(a) - ORDER.indexOf(b))[0];
}
