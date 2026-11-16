import type { IndicatorValues } from '../profile/profile';
import type { Unit, UnitLevel } from '../units/types';

export type Change = {
  teryt: string;
  from: number;
  to: number;
  delta: number;
  deltaPercent: number | null;
};

export type ComputeChangesParams = {
  values: IndicatorValues;
  units: Unit[];
  level: UnitLevel;
  parent?: string;
  fromYear: number;
  toYear: number;
  mode: 'percent' | 'absolute';
  limit?: number;
};

const isNum = (v: unknown): v is number =>
  typeof v === 'number' && !Number.isNaN(v);

/** Zmiany wszystkich jednostek poziomu (bez braków danych i zer w trybie procentowym). */
function collectChanges({
  values,
  units,
  level,
  parent,
  fromYear,
  toYear,
  mode,
}: ComputeChangesParams): Change[] {
  const years = values?.years ?? [];
  const fromIdx = years.indexOf(fromYear);
  const toIdx = years.indexOf(toYear);
  if (fromIdx === -1 || toIdx === -1) return [];

  const result: Change[] = [];
  for (const u of units) {
    if (u.level !== level) continue;
    if (parent && !u.teryt.startsWith(parent)) continue;
    const row = values.values[u.teryt];
    const from = row?.[fromIdx];
    const to = row?.[toIdx];
    if (!isNum(from) || !isNum(to)) continue;
    if (mode === 'percent' && from === 0) continue;
    result.push({
      teryt: u.teryt,
      from,
      to,
      delta: to - from,
      deltaPercent: from === 0 ? null : ((to - from) / Math.abs(from)) * 100,
    });
  }
  return result;
}

/** Miara sortowania zależna od trybu. */
function measure(c: Change, mode: 'percent' | 'absolute'): number {
  return mode === 'percent' ? (c.deltaPercent ?? 0) : c.delta;
}

/**
 * Wylicza jednostki z największym wzrostem i spadkiem między dwoma latami.
 * Remis rozstrzyga TERYT rosnąco; zmiana zerowa nie trafia do żadnej listy.
 */
export function computeChanges(params: ComputeChangesParams): {
  rising: Change[];
  falling: Change[];
} {
  const { mode, limit = 5 } = params;
  const all = collectChanges(params);
  const byTeryt = (a: Change, b: Change) => (a.teryt < b.teryt ? -1 : 1);
  const rising = all
    .filter((c) => measure(c, mode) > 0)
    .sort((a, b) => measure(b, mode) - measure(a, mode) || byTeryt(a, b))
    .slice(0, limit);
  const falling = all
    .filter((c) => measure(c, mode) < 0)
    .sort((a, b) => measure(a, mode) - measure(b, mode) || byTeryt(a, b))
    .slice(0, limit);
  return { rising, falling };
}

/**
 * Odsetek (0-100) porównywanych jednostek, których zmiana jest mniejsza
 * od zmiany wskazanej jednostki. Brak jednostki lub danych → null.
 */
export function shareBelow(
  params: ComputeChangesParams,
  teryt: string,
): number | null {
  const all = collectChanges(params);
  const target = all.find((c) => c.teryt === teryt);
  if (!target || all.length === 0) return null;
  const m = measure(target, params.mode);
  const below = all.filter((c) => measure(c, params.mode) < m).length;
  return (below / all.length) * 100;
}
