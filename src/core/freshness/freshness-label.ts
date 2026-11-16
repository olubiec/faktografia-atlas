import { freshnessLabel } from './freshness';
import { loadIndicatorValues } from '../data/load-values';
import { DEFAULT_INDICATOR_ID } from '../map/main-view';

/**
 * Etykieta świeżości z pliku wskaźnika (z pamięci podręcznej loadIndicatorValues).
 * Zależność: FRESHNESS_URL (freshness.ts) wskazuje /data/values/density.json,
 * czyli ten sam plik co DEFAULT_INDICATOR_ID - gdyby się rozjechały, trzeba to poprawić tu.
 */
export async function loadFreshnessLabel(
  load: typeof loadIndicatorValues = loadIndicatorValues,
  now: Date = new Date(),
): Promise<string | null> {
  const values = await load(DEFAULT_INDICATOR_ID);
  return freshnessLabel(values?.fetchedAt, now);
}

/** Biblioteka nie pobiera plików głównej mapy (PRODUKT §7), więc bez linijki świeżości. */
export function freshnessFetchAllowed(pathname: string): boolean {
  return !/^\/biblioteka(\/|$)/.test(pathname);
}
