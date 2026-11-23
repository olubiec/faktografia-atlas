// Zestawienia (W26-F04, docs/KONCEPT-ODKRYCIA.md §7): kolejność jednostek jednego poziomu według wartości
// w ostatnim roku albo zmiany w oknie 10 lat. Czyste funkcje; liczby wyłącznie z public/data/values.
// Pułapki (§2): małe gminy (szum) pomijamy progiem ludności, okna ze zmianą granic – detektorem z boundaries.ts.
import { boundaryChangeYears, impliedArea, windowHasBoundaryChange } from './boundaries';
import type { Direction, FactUnit, IndicatorValues, Level } from './types';

export type ListKind = 'value' | 'change';

/** Jedna pozycja config/lists.json. */
export interface ListDef {
  slug: string;
  indicatorId: string;
  level: Exclude<Level, 'woj'>;
  kind: ListKind;
  dir: Direction;
  /** Tytuł strony bez roku (≤ 58 znaków). */
  title: string;
  h1: string;
}

export interface ListsConfig {
  gminaMinPopulation: number;
  rows: number;
  changeYears: number;
  lists: ListDef[];
}

export interface ListInput {
  values: Readonly<Record<string, IndicatorValues>>;
  units: readonly FactUnit[];
  /** Jednostka wskaźnika (z config/indicators.json). */
  unit: string;
  /** Jednostki ze zmianą procentową (config/facts.json relativeChangeUnits). */
  relativeChangeUnits: readonly string[];
  /** Próg skoku powierzchni (config/facts.json thresholds.boundaryJump). */
  boundaryJump: number;
}

export interface ListEntry {
  teryt: string;
  rank: number;
  /** Wartość w roku zestawienia. */
  value: number;
  /** Wartość na początku okna (tylko zmiana). */
  fromValue: number | null;
  /** Zmiana: ułamek (np. 0,25 = +25%) dla liczb, różnica dla wskaźników; null przy zestawieniu wartości. */
  change: number | null;
}

export interface ListResult {
  def: ListDef;
  year: number | null;
  fromYear: number | null;
  /** Ile jednostek porównano (po wykluczeniach). */
  compared: number;
  /** Pominięte: gminy poniżej progu ludności, okna ze zmianą granic. */
  skippedSmall: number;
  skippedBoundary: number;
  /** Mediana porównywanej miary (wartości albo zmiany). */
  median: number | null;
  entries: ListEntry[];
}

const lastNumber = (s: readonly (number | null)[] | undefined): number | null => {
  if (!s) return null;
  for (let i = s.length - 1; i >= 0; i--) if (s[i] != null) return s[i];
  return null;
};

/** Ostatni indeks roku, w którym dane ma co najmniej połowa jednostek (−1: brak). */
export function referenceIndex(values: IndicatorValues, units: readonly FactUnit[]): number {
  const need = units.length / 2;
  if (need === 0) return -1;
  for (let i = values.years.length - 1; i >= 0; i--) {
    if (units.filter((u) => values.values[u.teryt]?.[i] != null).length >= need) return i;
  }
  return -1;
}

export function medianOf(sorted: readonly number[]): number | null {
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Lata zmian granic jednostki (powierzchnia = ludność ÷ gęstość). */
function boundaryYears(input: ListInput, teryt: string): number[] {
  const pop = input.values.population;
  const den = input.values.density;
  if (!pop || !den) return [];
  return boundaryChangeYears(impliedArea(pop.years, pop.values[teryt], den.years, den.values[teryt]), input.boundaryJump);
}

/** Buduje zestawienie: `rows` pierwszych pozycji, miejsca z remisami (1, 2, 2, 4). */
export function buildList(def: ListDef, config: Pick<ListsConfig, 'gminaMinPopulation' | 'rows' | 'changeYears'>, input: ListInput): ListResult {
  const empty: ListResult = { def, year: null, fromYear: null, compared: 0, skippedSmall: 0, skippedBoundary: 0, median: null, entries: [] };
  const data = input.values[def.indicatorId];
  const scope = input.units.filter((u) => u.level === def.level);
  if (!data) return empty;
  const idx = referenceIndex(data, scope);
  if (idx < 0) return empty;
  const year = data.years[idx];
  const fromIdx = def.kind === 'change' ? data.years.indexOf(year - config.changeYears) : -1;
  if (def.kind === 'change' && fromIdx < 0) return { ...empty, year };
  const fromYear = fromIdx >= 0 ? data.years[fromIdx] : null;
  const relative = input.relativeChangeUnits.includes(input.unit);

  let skippedSmall = 0;
  let skippedBoundary = 0;
  const measured: { teryt: string; value: number; fromValue: number | null; change: number | null; key: number }[] = [];
  for (const u of scope) {
    const value = data.values[u.teryt]?.[idx];
    if (value == null) continue;
    if (def.level === 'gmi') {
      const pop = lastNumber(input.values.population?.values[u.teryt]);
      if (pop == null || pop < config.gminaMinPopulation) {
        skippedSmall++;
        continue;
      }
    }
    if (fromYear === null) {
      measured.push({ teryt: u.teryt, value, fromValue: null, change: null, key: value });
      continue;
    }
    const fromValue = data.values[u.teryt]?.[fromIdx];
    if (fromValue == null) continue;
    if (windowHasBoundaryChange(boundaryYears(input, u.teryt), fromYear, year)) {
      skippedBoundary++;
      continue;
    }
    if (relative && fromValue <= 0) continue;
    const change = relative ? (value - fromValue) / fromValue : value - fromValue;
    measured.push({ teryt: u.teryt, value, fromValue, change, key: change });
  }

  measured.sort((a, b) => def.dir * (b.key - a.key) || a.teryt.localeCompare(b.teryt));
  const entries: ListEntry[] = [];
  for (let i = 0; i < Math.min(config.rows, measured.length); i++) {
    const m = measured[i];
    const prev = entries[i - 1];
    const rank = prev && measured[i - 1].key === m.key ? prev.rank : i + 1;
    entries.push({ teryt: m.teryt, rank, value: m.value, fromValue: m.fromValue, change: m.change });
  }
  return {
    def,
    year,
    fromYear,
    compared: measured.length,
    skippedSmall,
    skippedBoundary,
    median: medianOf(measured.map((m) => m.key).sort((a, b) => a - b)),
    entries,
  };
}
