// Wczytanie małego pliku status.json (PD01): kiedy automat sprawdzał dane. Błąd = null, strona działa dalej.
import { libraryBase } from '../library/config';

export type DataStatus = {
  version: number;
  checkedAt: string | null;
  values: {
    count: number | null;
    latestFetchedAt: string | null;
    latestYear: number | null;
    oldestFetchedAt: string | null;
  } | null;
  library: {
    availableCount: number | null;
    availableGeneratedAt: string | null;
    doneCount: number | null;
    pendingCount: number | null;
  } | null;
};

let pending: Promise<DataStatus | null> | null = null;

/** Jedno żądanie na sesję (pamięć + wspólna obietnica); 404, sieć, zły JSON lub wersja ≠ 1 = null. */
export function loadDataStatus(
  fetchImpl: typeof fetch = (...args) => fetch(...args),
): Promise<DataStatus | null> {
  pending ??= fetchImpl(`${libraryBase()}/status.json`)
    .then((res) => (res.ok ? res.json() : null))
    .then((json): DataStatus | null =>
      json && typeof json === 'object' && (json as { version?: unknown }).version === 1
        ? (json as DataStatus)
        : null,
    )
    .catch(() => null);
  return pending;
}

/** Tylko dla testów: czyści pamięć sesji. */
export function resetDataStatusCache(): void {
  pending = null;
}
