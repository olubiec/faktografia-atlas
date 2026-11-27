// Pobieranie danych „Odkryć” w czasie działania strony (nigdy import plików public/data do kodu).
// Sieć podawana z zewnątrz, żeby test mógł ją podmienić; jeden plik = jedno żądanie na całą wizytę.
import type { FactsStart } from '../facts/start';
import { FACTS_START_URL, factsFileUrl, type FactsFile } from './discoveries';

type Fetch = typeof fetch;
const defaultFetch: Fetch = (...a) => fetch(...a);

const cache = new Map<string, Promise<unknown>>();

export function getJson<T>(url: string, fetchImpl: Fetch = defaultFetch): Promise<T> {
  let p = cache.get(url) as Promise<T> | undefined;
  if (!p) {
    p = fetchImpl(url).then((res) => {
      if (!res.ok) throw new Error(`Nie udało się wczytać ${url}: HTTP ${res.status}`);
      return res.json() as Promise<T>;
    });
    // Błąd sieci: następna próba pobiera od nowa.
    p.catch(() => cache.delete(url));
    cache.set(url, p);
  }
  return p;
}

/** Odkrycie dnia i zestawienia (≤ 5 KB). */
export function loadFactsStart(fetchImpl: Fetch = defaultFetch): Promise<FactsStart> {
  return getJson<FactsStart>(FACTS_START_URL, fetchImpl);
}

/** Fakty jednostek jednego województwa – dopiero po wyborze miejsca. */
export function loadPlaceFacts(teryt: string, fetchImpl: Fetch = defaultFetch): Promise<FactsFile> {
  return getJson<FactsFile>(factsFileUrl(teryt), fetchImpl);
}

/** Tylko do testów. */
export function resetDiscoveriesCache(): void {
  cache.clear();
}
