import { useMemo } from 'react';
import unitsData from '../../../public/data/units.json';
import { buildSearchIndex, search, type SearchIndex, type SearchResult } from '@/core/search';
import type { Unit } from '@/core/units/types';

let cachedIndex: SearchIndex | null = null;

export function getSearchIndex(): SearchIndex {
  if (!cachedIndex) {
    cachedIndex = buildSearchIndex(unitsData as Unit[]);
  }
  return cachedIndex;
}

export function useSearch(query: string, limit = 8): SearchResult[] {
  const index = useMemo(() => getSearchIndex(), []);
  return useMemo(() => {
    if (!query || query.trim().length < 2) {
      return [];
    }
    return search(index, query, { limit });
  }, [index, query, limit]);
}
