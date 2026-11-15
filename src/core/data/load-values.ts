import type { IndicatorValues } from '../profile/profile';

const valuesCache = new Map<string, IndicatorValues | null>();
const loadingPromises = new Map<string, Promise<IndicatorValues | null>>();

/**
 * Leniwie pobiera plik wartości wskaźnika /data/values/<id>.json.
 * Zawsze zwraca null zamiast rzucać wyjątek, ale nie każdy null jest zapamiętany:
 * - zapamiętywane na stałe: 404 i inne 4xx (pliku naprawdę nie ma) oraz plik
 *   z niepoprawną treścią (brak years/values) – kolejna próba dałaby to samo;
 * - NIE zapamiętywane: błąd sieci (odrzucony fetch) i 5xx – to stan chwilowy,
 *   więc następne wywołanie pobiera plik ponownie zamiast pokazywać „brak danych”
 *   do końca sesji. Równoległe wywołania dla tego samego id dzielą jedno żądanie.
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
        // 5xx = błąd chwilowy (bez wpisu w cache); pozostałe (4xx) zapamiętujemy
        if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
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
      // błąd sieci lub 5xx: nic nie zapisujemy, kolejna próba ponowi żądanie
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
