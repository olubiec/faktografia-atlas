/**
 * Wybór wskaźników widocznych w porównaniu (parametr URL ?wsk=, lista id po przecinku).
 * Wartość `null` oznacza „wszystkie” (stan domyślny).
 */

export const SELECTION_PARAM = 'wsk';
export const SELECTION_STORAGE_KEY = 'fa-compare-indicators-v1';

/** Parsuje wartość parametru; pusty/brakujący napis = wszystkie (null). */
export function parseSelection(raw: string | null | undefined): string[] | null {
  if (raw === null || raw === undefined) return null;
  const ids = raw
    .split(',')
    .map((id) => id.trim())
    .filter((id, i, all) => id.length > 0 && all.indexOf(id) === i);
  return ids.length > 0 ? ids : null;
}

/** Zapisuje wybór jako napis do URL; gdy zaznaczone są wszystkie, zwraca null (parametr znika). */
export function serializeSelection(selected: string[], allIds: string[]): string | null {
  const set = new Set(selected);
  if (allIds.length > 0 && allIds.every((id) => set.has(id))) return null;
  return allIds.filter((id) => set.has(id)).join(',');
}

/** Lista widocznych id: null = wszystkie; nieznane id są pomijane. */
export function resolveSelection(stored: string[] | null, allIds: string[]): string[] {
  if (stored === null) return allIds;
  const set = new Set(stored);
  const known = allIds.filter((id) => set.has(id));
  // Same nieznane id (np. wskaźnik zniknął) → wracamy do wszystkich
  return known.length > 0 ? known : allIds;
}

/** Przełącza jeden wskaźnik, zachowując kolejność z allIds. */
export function toggleIndicator(selected: string[], id: string, allIds: string[]): string[] {
  const set = new Set(selected);
  if (set.has(id)) set.delete(id);
  else set.add(id);
  return allIds.filter((x) => set.has(x));
}
