import { useEffect, useMemo, useState } from 'react';
import { buildSearchIndex, search, type SearchIndex, type SearchResult } from '@/core/search';
import type { Unit } from '@/core/units/types';

// Lista jednostek jest pobierana z public/data dopiero przy pierwszym otwarciu okna
// (nie jest importowana do kodu, żeby nie powiększać głównego pakietu).
export const UNITS_URL = '/data/units.json';

let cachedIndex: SearchIndex | null = null;
let loading: Promise<SearchIndex> | null = null;

export function loadSearchIndex(fetchImpl: typeof fetch = (...args) => fetch(...args)): Promise<SearchIndex> {
  if (cachedIndex) return Promise.resolve(cachedIndex);
  if (!loading) {
    loading = fetchImpl(UNITS_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Nie udało się wczytać ${UNITS_URL}: HTTP ${res.status}`);
        return res.json() as Promise<Unit[]>;
      })
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
