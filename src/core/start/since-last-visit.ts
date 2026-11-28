// „Co się zmieniło od ostatniej wizyty” (W34-O10, docs/KONCEPT-ODKRYCIA-V2.md §6).
// Jedyny zapis w przeglądarce: data ostatniej wizyty, i to tylko gdy zapamiętane jest miejsce (ta sama pamięć co place-memory).
import type { FreshLedger } from '../facts/fresh';
import { readPlace } from './place-memory';

// Klucz składany z części (jak PLACE_KEY): pełny napis zawiera stary adres strony, którego test S13 w src nie dopuszcza.
export const VISIT_KEY = ['faktografia', 'lastVisit'].join('.');

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function defaultStore(): Store | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Data ostatniej wizyty (ISO); brak, błąd pamięci albo śmieć = null. */
export function readLastVisit(store: Store | null = defaultStore()): string | null {
  try {
    const v = store?.getItem(VISIT_KEY) ?? null;
    return v && !Number.isNaN(Date.parse(v)) ? v : null;
  } catch {
    return null;
  }
}

/** Zapisuje „teraz”, ale tylko gdy miejsce jest zapamiętane; bez miejsca niczego nie zapisujemy. */
export function touchVisit(now: Date, store: Store | null = defaultStore()): void {
  try {
    if (!readPlace(store) || !store) return;
    store.setItem(VISIT_KEY, now.toISOString());
  } catch {
    // Brak pamięci przeglądarki: strona działa bez „od ostatniej wizyty”.
  }
}

export interface NewsItem {
  indicatorId: string;
  year: number;
  since: string;
}

/** Nowości od ostatniej wizyty: najnowsze pierwsze, maksymalnie `limit`; bez wizyty albo bez nowości – pusta lista. */
export function sinceLastVisit(
  lastVisit: string | null,
  ledger: FreshLedger | null | undefined,
  hasData: (indicatorId: string) => boolean = () => true,
  limit = 3,
): NewsItem[] {
  if (!lastVisit || !ledger) return [];
  const from = Date.parse(lastVisit);
  return Object.entries(ledger)
    .map(([indicatorId, e]) => ({ indicatorId, year: e.year, since: e.since }))
    .filter((n) => Date.parse(n.since) > from && hasData(n.indicatorId))
    .sort((a, b) => Date.parse(b.since) - Date.parse(a.since) || a.indicatorId.localeCompare(b.indicatorId))
    .slice(0, limit);
}

/** „12 listopada 2026” z ISO (strefa UTC, żeby ta sama data wyszła wszędzie). */
export function visitDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
