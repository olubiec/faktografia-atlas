import type { IndicatorValues } from '../profile/profile';

const valuesCache = new Map<string, IndicatorValues | null>();
const loadingPromises = new Map<string, Promise<IndicatorValues | null>>();

/**
 * Leniwie pobiera plik wartości wskaźnika /data/values/<id>.json.
 * Kesżuje wyniki i obsługuje błędy sieci oraz 404 (zwracając null).
 */
export function loadIndicatorValues(
  id: string,
  fetchImpl: typeof fetch = (...args) => fetch(...args)
): Promise<IndicatorValues | null> {
  if (valuesCache.has(id)) {
    return Promise.resolve(valuesCache.get(id) ?? null);
  }

  if (loadingPromises.has(id)) {
    return loadingPromises.get(id)!;
  }

  const promise = fetchImpl(`/data/values/${id}.json`)
    .then((res) => {
      if (!res.ok) {
        valuesCache.set(id, null);
        return null;
      }
      return res.json() as Promise<IndicatorValues>;
    })
    .then((data) => {
      if (data && typeof data === 'object' && Array.isArray(data.years) && data.values) {
        valuesCache.set(id, data);
        return data;
      }
      valuesCache.set(id, null);
      return null;
    })
    .catch(() => {
      valuesCache.set(id, null);
      return null;
    })
    .finally(() => {
      loadingPromises.delete(id);
    });

  loadingPromises.set(id, promise);
  return promise;
}

/**
 * Czyści pamięć podręczną pobranych wartości wskaźników (używane w testach).
 */
export function resetValuesCache(): void {
  valuesCache.clear();
  loadingPromises.clear();
}
