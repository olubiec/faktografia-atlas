// Premiery z biblioteki w Odkryciach (W29-D09): świeże zmienne z księgi kalendarium wchodzą do silnika faktów
// jako wskaźniki tymczasowe `b<varId>` – tylko fakty krajowe, tylko do Odkrycia dnia i zestawień.
// Czyste funkcje, bez sieci i bez zegara („teraz” to generatedAt z danych). Pliki województw się nie zmieniają:
// zmienne biblioteki mają osobny FactsBuild, którego buildShards nie widzi.
import { effectiveUnit } from '../catalog/effective-unit';
import { standaloneName } from '../catalog/standalone-name';
import { mergeLevels } from '../indicators/load-any-values';
import { libraryIndicatorId, type AvailableVariable } from '../indicators/registry';
import { valuesByTeryt, type LibraryValues } from '../library/load-library';
import type { Unit } from '../units/types';
import type { FactsBuild } from './build';
import { createContext } from './context';
import { detectAll } from './detectors';
import { boostFresh, lastDataYear } from './fresh';
import { compareFacts } from './select';
import { factSentence } from './sentences';
import type { Fact, FactIndicator, FactsConfig, FactsInput, IndicatorValues } from './types';

const DAY_MS = 86_400_000;
/** Ile zmiennych biblioteki wchodzi do Odkryć naraz, gdy config/facts.json nie podaje fresh.libraryMax. */
export const DEFAULT_LIBRARY_MAX = 3;

/** Księga kalendarium (library/calendar.json) – pola potrzebne tutaj. */
export interface CalendarLedger {
  entries?: { date?: string; library?: { id: number | string; state?: string; on?: string }[] }[];
}

export interface LibraryFreshOptions {
  /** Okno świeżości w dniach (fresh.days). */
  days: number;
  /** Najwyżej tyle zmiennych (fresh.libraryMax). */
  max: number;
}

/** Opcje z config/facts.json; brak sekcji `fresh` = 0 dni, więc nic nie jest świeże. */
export function libraryFreshOptions(config: Pick<FactsConfig, 'fresh'>): LibraryFreshOptions {
  const fresh = config.fresh as (FactsConfig['fresh'] & { libraryMax?: number }) | undefined;
  const max = fresh?.libraryMax;
  return { days: fresh?.days ?? 0, max: typeof max === 'number' && max >= 0 ? max : DEFAULT_LIBRARY_MAX };
}

/**
 * Id zmiennych (BDL, tekst), które księga ma w stanie `downloaded` z datą w ciągu `days` dni przed `now`.
 * Najpierw najnowsze pobranie, potem mniejszy id; najwyżej `max`. Brak księgi = pusta lista.
 */
export function freshLibraryIds(calendar: CalendarLedger | null | undefined, now: string, { days, max }: LibraryFreshOptions): string[] {
  const latest = new Map<string, number>();
  for (const e of calendar?.entries ?? []) {
    for (const v of e.library ?? []) {
      const on = Date.parse(v.on ?? '');
      const diff = Date.parse(now) - on;
      if (v.state !== 'downloaded' || !Number.isFinite(diff) || diff < 0 || diff > days * DAY_MS) continue;
      const id = String(v.id);
      latest.set(id, Math.max(latest.get(id) ?? 0, on));
    }
  }
  return [...latest.entries()]
    .sort((a, b) => b[1] - a[1] || Number(a[0]) - Number(b[0]) || a[0].localeCompare(b[0]))
    .slice(0, max)
    .map(([id]) => id);
}

/** Jednostki, dla których szablony zdań (sentences.ts) dają poprawne polskie zdanie: jak wskaźniki główne albo „na N …”. */
const SUPPORTED_UNITS = new Set(['osoba', 'osoby', '%', 'zł', 'm²', 'lata', 'os./km²', 'na 1000', 'na 10 tys.']);
const PER_UNIT = /^na (?:\d+(?: \d{3})*|\d+)(?: tys\.)? \p{L}/u;

export const isSupportedUnit = (unit: string): boolean => SUPPORTED_UNITS.has(unit) || PER_UNIT.test(unit);

const GROUPLESS = 'Biblioteka GUS';

/** Wskaźnik tymczasowy `b<varId>`: nazwa i jednostka z available.json, grupa z pierwszego członu ścieżki tematu. */
export function libraryIndicator(v: AvailableVariable, minLevel: FactIndicator['minLevel']): FactIndicator {
  return {
    id: libraryIndicatorId(v.id),
    name: standaloneName(v.n, v.c),
    unit: effectiveUnit(v.n, v.u),
    group: (v.c ?? '').split(' > ')[0] || GROUPLESS,
    minLevel,
  };
}

export interface LibraryFresh {
  indicators: FactIndicator[];
  values: Record<string, IndicatorValues>;
  /** id `b<varId>` → ostatni rok z danymi (jak księga świeżości wskaźników głównych). */
  fresh: Record<string, number>;
  /** Zmienne, które wypadły, bo jednostka nie daje poprawnego zdania (do listy w opisie PR). */
  droppedUnits: { id: string; unit: string }[];
}

export interface PrepareInput {
  calendar: CalendarLedger | null | undefined;
  available: { variables?: AvailableVariable[] } | null | undefined;
  /** Zawartość library/values/<id>.json albo null, gdy pliku brak. */
  readValues: (varId: string) => LibraryValues | null;
  units: Unit[];
  generatedAt: string;
  config: Pick<FactsConfig, 'fresh'>;
  /** Zasada „nie niszowe” (ta sama funkcja co w księdze: premieres.mjs → factsFromValues); true = wypada. */
  isNiche?: (varId: string, raw: LibraryValues, v: AvailableVariable) => boolean;
}

const LEVELS: [keyof Pick<LibraryValues, 'l3' | 'l5' | 'l6'>, 'woj' | 'pow' | 'gmi'][] = [
  ['l3', 'woj'],
  ['l5', 'pow'],
  ['l6', 'gmi'],
];

/** Świeże, nieniszowe zmienne biblioteki jako wskaźniki do silnika faktów. Brak księgi, dostępnych albo wartości = pusty wynik. */
export function prepareLibraryFresh(input: PrepareInput): LibraryFresh {
  const out: LibraryFresh = { indicators: [], values: {}, fresh: {}, droppedUnits: [] };
  const variables = new Map((input.available?.variables ?? []).map((v) => [String(v.id), v]));
  for (const varId of freshLibraryIds(input.calendar, input.generatedAt, libraryFreshOptions(input.config))) {
    const v = variables.get(varId);
    const raw = v ? input.readValues(varId) : null;
    if (!v || !raw || input.isNiche?.(varId, raw, v)) continue;
    const present = LEVELS.filter(([key]) => raw[key]);
    if (present.length === 0) continue;
    const parts = present.map(([, level]) => valuesByTeryt(raw, level, input.units));
    const merged = mergeLevels(parts);
    const year = lastDataYear(merged);
    if (year === null) continue;
    const indicator = libraryIndicator(v, present.some(([, l]) => l === 'gmi') ? 'gmi' : present.some(([, l]) => l === 'pow') ? 'pow' : 'woj');
    if (!isSupportedUnit(indicator.unit)) {
      out.droppedUnits.push({ id: indicator.id, unit: indicator.unit });
      continue;
    }
    out.indicators.push(indicator);
    out.values[indicator.id] = { fetchedAt: typeof raw.fetchedAt === 'string' ? raw.fetchedAt : undefined, years: merged.years, values: merged.values };
    out.fresh[indicator.id] = year;
  }
  return out;
}

/** Fakt krajowy dozwolony dla biblioteki: 1. miejsce bez remisu (F1) albo rekord serii (F5). */
export function isLibraryNational(f: Fact): boolean {
  const c = f.compare;
  if (f.type === 'F5') return c.kind === 'record';
  return f.type === 'F1' && c.kind === 'rank' && c.rank === 1 && !c.tie;
}

/**
 * Wejście silnika dla zmiennych biblioteki: te same jednostki i ludność (próg małych gmin), ale tylko wskaźniki tymczasowe,
 * bez sąsiadów. Nic z tego nie trafia do `buildShards`.
 */
export function libraryInput(base: FactsInput, lib: LibraryFresh): FactsInput {
  const shared: Record<string, IndicatorValues> = {};
  for (const id of ['population', 'density']) if (base.values[id]) shared[id] = base.values[id];
  return { indicators: lib.indicators, units: base.units, config: base.config, values: { ...shared, ...lib.values }, fresh: lib.fresh };
}

/**
 * Fakty krajowe zmiennych bibliotecznych z najnowszego roku (siła z mnożnikiem świeżości jak przy wskaźnikach głównych).
 * Fakt, dla którego szablon nie daje zdania, wypada. null, gdy nie ma żadnej świeżej zmiennej.
 */
export function buildLibraryFacts(base: FactsInput, lib: LibraryFresh): FactsBuild | null {
  if (lib.indicators.length === 0) return null;
  const input = libraryInput(base, lib);
  const ctx = createContext(input);
  const byUnit = new Map<string, { selected: Fact[]; counts: Record<string, number> }>();
  for (const unit of input.units) {
    const kept = detectAll(ctx, unit).filter((f) => {
      const ind = ctx.indicators.get(f.indicatorId);
      return ind !== undefined && f.year >= (lib.fresh[f.indicatorId] ?? Infinity) && isLibraryNational(f) && factSentence(f, { indicator: ind, level: unit.level }) !== null;
    });
    byUnit.set(unit.teryt, { selected: boostFresh(kept, input.config.fresh, lib.fresh).sort(compareFacts), counts: {} });
  }
  return { ctx, byUnit, twins: new Map() };
}
