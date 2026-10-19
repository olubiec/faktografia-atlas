import type { Locality } from './types';

export const LOCALITIES_URL = '/data/localities.json';

let cachedLocalities: Locality[] | null = null;
let loadingPromise: Promise<Locality[]> | null = null;

/**
 * Leniwie pobiera listę miejscowości z /data/localities.json.
 * Obsługuje brak pliku (404) oraz błędy sieci, zwracając pustą tablicę
 * bez zgłaszania nieobsłużonych błędów w konsoli.
 */
export function loadLocalities(
  fetchImpl: typeof fetch = (...args) => fetch(...args)
): Promise<Locality[]> {
  if (cachedLocalities) {
    return Promise.resolve(cachedLocalities);
  }

  if (!loadingPromise) {
    loadingPromise = fetchImpl(LOCALITIES_URL)
      .then((res) => {
        if (!res.ok) {
          cachedLocalities = [];
          return cachedLocalities;
        }
        return res.json() as Promise<Locality[]>;
      })
      .then((data) => {
        if (Array.isArray(data)) {
          cachedLocalities = data;
        } else {
          cachedLocalities = [];
        }
        return cachedLocalities;
      })
      .catch(() => {
        cachedLocalities = [];
        return cachedLocalities;
      });
  }

  return loadingPromise;
}

/**
 * Funkcja pomocnicza do czyszczenia pamięci podręcznej (używana w testach).
 */
export function resetLocalitiesCache(): void {
  cachedLocalities = null;
  loadingPromise = null;
}
