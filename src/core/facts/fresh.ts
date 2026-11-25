// Świeże dane (W27-D02, docs/KONCEPT-ODKRYCIA.md „Świeże dane”): księga świeżości wskaźników i mnożniki siły faktów.
// Czyste funkcje, bez zegara: „teraz” to generatedAt z danych, więc ten sam stan danych daje ten sam plik.
import type { Fact, FreshConfig, IndicatorValues } from './types';

/** Wpis księgi: ostatni rok wskaźnika i kiedy robot go zobaczył. */
export interface FreshEntry {
  year: number;
  since: string;
}

/** public/data/facts/fresh.json: id wskaźnika → wpis. */
export type FreshLedger = Record<string, FreshEntry>;

/** Wskaźnik, którego nie widzieliśmy wcześniej, przy pierwszym uruchomieniu: nie jest świeży. */
export const NEVER_FRESH = '1970-01-01T00:00:00.000Z';

const DAY_MS = 86_400_000;

/** Ostatni rok, w którym wskaźnik ma jakąkolwiek wartość (null: brak danych). */
export function lastDataYear(values: IndicatorValues): number | null {
  for (let i = values.years.length - 1; i >= 0; i--) {
    if (Object.values(values.values).some((s) => s[i] != null)) return values.years[i];
  }
  return null;
}

const withinDays = (from: string, to: string, days: number): boolean => {
  const diff = Date.parse(to) - Date.parse(from);
  return diff >= 0 && diff <= days * DAY_MS;
};

/**
 * Nowa księga: zmieniony ostatni rok albo nowy wskaźnik → since = generatedAt; ten sam rok → bez zmian.
 * Bez poprzedniej księgi (pierwsze uruchomienie) nic nie jest świeże, chyba że plik wartości ma fetchedAt
 * w ciągu `days` przed generatedAt. Wpisy wskaźników bez pliku wartości zostają (plik mógł zniknąć na chwilę).
 * Klucze posortowane – stabilny plik.
 */
export function updateLedger(
  prev: FreshLedger | null,
  values: Readonly<Record<string, IndicatorValues>>,
  generatedAt: string,
  days: number,
): FreshLedger {
  const out: FreshLedger = { ...(prev ?? {}) };
  for (const [id, data] of Object.entries(values)) {
    const year = lastDataYear(data);
    if (year === null) continue;
    const old = prev?.[id];
    if (old && old.year === year) continue;
    if (!prev) {
      const fetched = data.fetchedAt;
      out[id] = { year, since: fetched && withinDays(fetched, generatedAt, days) ? fetched : NEVER_FRESH };
    } else {
      out[id] = { year, since: generatedAt };
    }
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}

/** Świeży = generatedAt − since ≤ days. */
export function isFresh(entry: FreshEntry, generatedAt: string, days: number): boolean {
  return withinDays(entry.since, generatedAt, days);
}

/** Świeże wskaźniki: id → ostatni rok danych. */
export function freshYears(ledger: FreshLedger, generatedAt: string, days: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [id, e] of Object.entries(ledger)) if (isFresh(e, generatedAt, days)) out[id] = e.year;
  return out;
}

/** Skrajność: 1. miejsce w kraju bez remisu albo rekord serii (F5). (Zmiana rok do roku: pominięta, patrz KONCEPT.) */
export function isExtreme(f: Fact): boolean {
  const c = f.compare;
  if (c.kind === 'record') return true;
  return f.type === 'F1' && c.kind === 'rank' && c.rank === 1 && !c.tie;
}

/** Mnożnik faktu świeżego wskaźnika z najnowszego roku (1, gdy fakt nie jest świeży). */
export function freshMultiplier(f: Fact, config: FreshConfig | undefined, fresh: Readonly<Record<string, number>> | undefined): number {
  const year = fresh?.[f.indicatorId];
  if (!config || year === undefined || f.year < year) return 1;
  return config.boost * (isExtreme(f) ? config.extremeBoost : 1);
}

/** Fakty ze zwiększoną siłą (zaokrąglenie 0,01); bez świeżych wskaźników zwraca te same obiekty. */
export function boostFresh(facts: Fact[], config: FreshConfig | undefined, fresh: Readonly<Record<string, number>> | undefined): Fact[] {
  if (!config || !fresh || Object.keys(fresh).length === 0) return facts;
  return facts.map((f) => {
    const m = freshMultiplier(f, config, fresh);
    return m === 1 ? f : { ...f, strength: Math.round(f.strength * m * 100) / 100 };
  });
}
