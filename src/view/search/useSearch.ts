import { useEffect, useMemo, useState } from 'react';
import { buildSearchIndex, search, type SearchIndex, type SearchResult } from '@/core/search';
import { loadUnits, UNITS_URL as SHARED_UNITS_URL, resetAtlasDataCache } from '@/core/data/load-atlas-data';

// Lista jednostek jest pobierana z public/data dopiero przy pierwszym otwarciu okna
// (nie jest importowana do kodu, żeby nie powiększać głównego pakietu).
export const UNITS_URL = SHARED_UNITS_URL;

let cachedIndex: SearchIndex | null = null;
let loading: Promise<SearchIndex> | null = null;

export function loadSearchIndex(fetchImpl: typeof fetch = (...args) => fetch(...args)): Promise<SearchIndex> {
  if (cachedIndex) return Promise.resolve(cachedIndex);
  if (!loading) {
    loading = loadUnits(fetchImpl)
      .then((units) => {
        cachedIndex = buildSearchIndex(units);
        return cachedIndex;
      })
      .catch((err: unknown) => {
        loading = null;
        throw err;
      });
  }
  return loading;
}

/** Tylko do testów: czyści zapamiętany indeks. */
export function resetSearchIndexCache(): void {
  cachedIndex = null;
  loading = null;
  resetAtlasDataCache();
}

export interface UseSearchResult {
  results: SearchResult[];
  ready: boolean;
  error: boolean;
}

export function useSearch(query: string, limit = 8): UseSearchResult {
  const [index, setIndex] = useState<SearchIndex | null>(cachedIndex);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (index) return;
    let cancelled = false;
    loadSearchIndex()
      .then((loaded) => {
        if (!cancelled) setIndex(loaded);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [index]);

  const results = useMemo(() => {
    if (!index || !query || query.trim().length < 2) {
      return [];
    }
    return search(index, query, { limit });
  }, [index, query, limit]);

  return { results, ready: index !== null, error };
}
