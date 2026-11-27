// Pobieranie danych karuzeli zestawień (KONCEPT-ZESTAWIENIA-KARUZELA §3.4): jedno żądanie na plik, pamięć na wizytę.
// Pliki dochodzą dopiero po pierwszym ruchu w karuzeli, nie w pierwszych sekundach strony.
import type { FactsLists } from '../facts/carousel';
import { getJson } from './load-discoveries';

type Fetch = typeof fetch;
export const FACTS_LISTS_URL = '/data/facts-lists.json';
export const GMINA_SMALL_URL = '/data/gmina-small.json';

/** Dalsze zestawienia karuzeli (≤ 12 KB). */
export function loadFactsLists(fetchImpl?: Fetch): Promise<FactsLists> {
  return getJson<FactsLists>(FACTS_LISTS_URL, fetchImpl);
}

/** Kody TERYT gmin poniżej progu ludności (≤ 8 KB), do pomijania w zestawieniach liczonych w przeglądarce. */
export async function loadGminaSmall(fetchImpl?: Fetch): Promise<Set<string>> {
  const file = await getJson<{ t: string }>(GMINA_SMALL_URL, fetchImpl);
  return new Set(typeof file.t === 'string' && file.t ? file.t.split(',') : []);
}
