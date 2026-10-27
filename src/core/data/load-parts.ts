export type PartsShard = {
  voivodeship: string;
  years: Record<string /* indicatorId */, number[]>;
  values: Record<string /* teryt części */, Record<string /* indicatorId */, (number | null)[]>>;
};

const partsCache = new Map<string, PartsShard | null>();
const loadingPromises = new Map<string, Promise<PartsShard | null>>();

/**
 * Leniwie pobiera plik części miasto i wieś dla danego województwa /data/parts/<voivodeship>.json.
 * Kesżuje wyniki i obsługuje błędy sieci, 404 oraz zły kształt danych (zwracając null bez zgłaszania wyjątku).
 */
export function loadPartsShard(
  voivodeship: string,
  fetchImpl: typeof fetch = (...args) => fetch(...args)
): Promise<PartsShard | null> {
  if (partsCache.has(voivodeship)) {
    return Promise.resolve(partsCache.get(voivodeship) ?? null);
  }

  if (loadingPromises.has(voivodeship)) {
    return loadingPromises.get(voivodeship)!;
  }

  const promise = fetchImpl(`/data/parts/${voivodeship}.json`)
    .then((res) => {
      if (!res.ok) {
        partsCache.set(voivodeship, null);
        return null;
      }
      return res.json() as Promise<PartsShard>;
    })
    .then((data) => {
      if (
        data &&
        typeof data === 'object' &&
        typeof data.voivodeship === 'string' &&
        data.years &&
        typeof data.years === 'object' &&
        data.values &&
        typeof data.values === 'object'
      ) {
        partsCache.set(voivodeship, data);
        return data;
      }
      partsCache.set(voivodeship, null);
      return null;
    })
    .catch(() => {
      partsCache.set(voivodeship, null);
      return null;
    })
    .finally(() => {
      loadingPromises.delete(voivodeship);
    });

  loadingPromises.set(voivodeship, promise);
  return promise;
}

/**
 * Czyści pamięć podręczną pobranych części miasto i wieś (używane w testach).
 */
export function resetPartsCache(): void {
  partsCache.clear();
  loadingPromises.clear();
}
