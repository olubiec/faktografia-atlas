// Etykieta „Nowość” (W28-D06): jedna definicja, kiedy wskaźnik albo zmienna jest nowa.
// Czyste funkcje, bez zegara i bez sieci: „teraz” przychodzi z generatedAt danych albo z argumentu.
import { LIBRARY_ID_PREFIX } from '../indicators/registry';
import type { FreshLedger } from './fresh';

/** Ile dni etykieta „Nowość” jest widoczna, gdy config/facts.json nie podaje fresh.labelDays. */
export const DEFAULT_LABEL_DAYS = 7;

const DAY_MS = 86_400_000;

/** Liczba dni z config/facts.json (fresh.labelDays); zła albo brakująca wartość → domyślna. */
export function labelDaysOf(config: { fresh?: { labelDays?: number } } | undefined): number {
  const d = config?.fresh?.labelDays;
  return typeof d === 'number' && Number.isFinite(d) && d > 0 ? d : DEFAULT_LABEL_DAYS;
}

/** Czy rok pojawił się najwyżej `days` dni przed `now`. Brak albo zła data → false (nic się nie psuje). */
export function isNewSince(since: string | null | undefined, now: string, days: number): boolean {
  if (!since) return false;
  const diff = Date.parse(now) - Date.parse(since);
  return Number.isFinite(diff) && diff >= 0 && diff <= days * DAY_MS;
}

/** Wpis księgi kalendarium (library/calendar.json) – tylko pola, których tu potrzebujemy. */
export interface CalendarLedger {
  entries?: { library?: { id: number | string; state?: string; on?: string }[] }[];
}

/** Id wskaźników głównych, których najnowszy rok pojawił się w ciągu `days` dni (księga fresh.json). */
export function newMainIds(ledger: FreshLedger | null | undefined, now: string, days: number): string[] {
  return Object.entries(ledger ?? {})
    .filter(([, e]) => isNewSince(e?.since, now, days))
    .map(([id]) => id)
    .sort();
}

/** Id zmiennych biblioteki (BDL, jako tekst), pobranych (`downloaded`) w ciągu `days` dni według kalendarium. */
export function newLibraryIds(calendar: CalendarLedger | null | undefined, now: string, days: number): string[] {
  const out = new Set<string>();
  for (const e of calendar?.entries ?? []) {
    for (const v of e.library ?? []) if (v.state === 'downloaded' && isNewSince(v.on, now, days)) out.add(String(v.id));
  }
  return [...out].sort((a, b) => Number(a) - Number(b) || a.localeCompare(b));
}

/** Lista `new` do library/available.json: id wskaźników głównych i zmiennych biblioteki, posortowane. */
export function newIdList(
  input: { ledger?: FreshLedger | null; calendar?: CalendarLedger | null; now: string; days: number },
): string[] {
  const ids = new Set([...newMainIds(input.ledger, input.now, input.days), ...newLibraryIds(input.calendar, input.now, input.days)]);
  return [...ids].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

/** Czy wiersz katalogu (id wskaźnika: główne albo `b<varId>`) jest na liście `new`. Brak listy → false. */
export function isNewIndicator(id: string, list: readonly string[] | null | undefined): boolean {
  if (!list || list.length === 0) return false;
  if (list.includes(id)) return true;
  return id.startsWith(LIBRARY_ID_PREFIX) && /^\d+$/.test(id.slice(LIBRARY_ID_PREFIX.length)) && list.includes(id.slice(LIBRARY_ID_PREFIX.length));
}

/** Świeże (≤ days) wskaźniki główne: id → ostatni rok danych. Do oznaczania faktów przy budowie plików. */
export function newMainYears(ledger: FreshLedger | null | undefined, now: string, days: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [id, e] of Object.entries(ledger ?? {})) if (isNewSince(e?.since, now, days)) out[id] = e.year;
  return out;
}

/** Fakt z flagą nowości (zakodowany jako opcjonalny ostatni element). */
export type NewFlagged<T> = T & { isNew?: boolean };

/** Dopisuje isNew faktom z najnowszego roku świeżego wskaźnika; reszta bez zmian (te same obiekty). */
export function markNew<T extends { indicatorId: string; year: number }>(
  facts: T[],
  newYears: Readonly<Record<string, number>> | undefined,
): NewFlagged<T>[] {
  if (!newYears) return facts;
  return facts.map((f) => (newYears[f.indicatorId] !== undefined && f.year >= newYears[f.indicatorId] ? { ...f, isNew: true } : f));
}
