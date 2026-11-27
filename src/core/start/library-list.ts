// Zestawienie 5 + 5 dla dowolnego wskaźnika z biblioteki (KONCEPT-ZESTAWIENIA-KARUZELA §3.4): liczone w przeglądarce
// z wartości pobranych po wyborze w „Więcej danych”, w tym samym kształcie co zestawienia z facts-start.json.
import type { StartList } from '../facts/start';
import type { Level } from '../facts/types';
import type { IndicatorValues } from '../profile/profile';
import type { Unit } from '../units/types';
import { LIST_ROWS } from '../facts/start';

export interface LibraryListInput {
  indicator: { id: string; name: string; unit: string };
  values: IndicatorValues;
  units: Pick<Unit, 'teryt' | 'name' | 'level'>[];
  /** Kody TERYT gmin pomijanych w zestawieniach (poniżej progu ludności; gmina-small.json). */
  small: ReadonlySet<string>;
}

/** Poziom zestawienia: gminy, gdy wskaźnik ma dla nich dane, inaczej powiaty, inaczej województwa. */
export function libraryLevel(values: IndicatorValues, units: LibraryListInput['units']): Level {
  const has = (level: Level) => units.some((u) => u.level === level && values.values[u.teryt]?.some((v) => v != null));
  return has('gmi') ? 'gmi' : has('pow') ? 'pow' : 'woj';
}

/** Udział jednostek poziomu z wartością, przy którym rok uznajemy za wystarczająco pełny. */
export const MIN_YEAR_SHARE = 0.5;

/**
 * 5 jednostek z najwyższą i 5 z najniższą wartością w ostatnim roku, w którym dane ma co najmniej połowa jednostek poziomu
 * (rok z kilkoma wynikami dałby przypadkowe rekordy). Gminy z `small` są pominięte. null, gdy żaden rok nie spełnia progu.
 */
export function libraryList({ indicator, values, units, small }: LibraryListInput): StartList | null {
  const level = libraryLevel(values, units);
  const pool = units.filter((u) => u.level === level && !(level === 'gmi' && small.has(u.teryt)));
  if (pool.length === 0) return null;
  for (let idx = values.years.length - 1; idx >= 0; idx--) {
    const rows = pool
      .map((u) => [u.teryt, u.name, values.values[u.teryt]?.[idx]] as const)
      .filter((r): r is readonly [string, string, number] => typeof r[2] === 'number' && Number.isFinite(r[2]));
    if (rows.length / pool.length < MIN_YEAR_SHARE) continue;
    const pick = (r: readonly [string, string, number]): [string, string, number] => [r[0], r[1], r[2]];
    // Przy remisie kolejność TERYT, jak w zestawieniach robota (buildList).
    const high = [...rows].sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0])).slice(0, LIST_ROWS);
    const low = [...rows].sort((a, b) => a[2] - b[2] || a[0].localeCompare(b[0])).slice(0, LIST_ROWS);
    return { indicatorId: indicator.id, level, dir: 1, year: values.years[idx], top: high.map(pick), bottom: low.map(pick), i: [indicator.name, indicator.unit] };
  }
  return null;
}
