import { libraryBase } from './config';
import type { LibraryValues } from './library-values';

// Przekształcanie wartości mieszka w library-values.ts; re-eksport zachowuje importy.
export { valuesByTeryt } from './library-values';
export type { CompactValues, LibraryValues } from './library-values';

export type LibraryIndexItem = {
  id: string | number;
  name?: string;
  subjectId?: string;
  level?: number | string;
  years?: number[];
  [key: string]: unknown;
};

export type LibraryIndex =
  | {
      version?: number;
      subjects?: Record<string, unknown>;
      variables?: Record<string, LibraryIndexItem>;
      items?: LibraryIndexItem[];
      [key: string]: unknown;
    }
  | LibraryIndexItem[];

let indexPromise: Promise<LibraryIndex | null> | null = null;
let indexCache: LibraryIndex | null = null;
let isIndexCached = false;

const valuesCache = new Map<string, LibraryValues | null>();
const valuesPromises = new Map<string, Promise<LibraryValues | null>>();

function isValidIndex(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  if (Array.isArray(data)) return true;
  const obj = data as Record<string, unknown>;
  return (
    'subjects' in obj ||
    'variables' in obj ||
    'items' in obj ||
    'version' in obj ||
    'catalog' in obj
  );
}

function isValidValues(data: unknown): boolean {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  const obj = data as Record<string, unknown>;
  return (
    'v' in obj ||
    'id' in obj ||
    'indicatorId' in obj ||
    'l5' in obj ||
    'l6' in obj ||
    'l3' in obj ||
    'y' in obj ||
    'years' in obj ||
    'd' in obj ||
    'values' in obj
  );
}

/**
 * Pobiera spis biblioteki (<base>/index.json).
 * Kesżuje wynik tak, aby wielokrotne wywołania wygenerowały tylko jedno żądanie sieciowe.
 * Zwraca null w przypadku błędu (np. 404 lub złego kształtu danych).
 */
export function loadLibraryIndex(
  fetchImpl: typeof fetch = (...args) => fetch(...args)
): Promise<LibraryIndex | null> {
  if (isIndexCached) {
    return Promise.resolve(indexCache);
  }
  if (indexPromise) {
    return indexPromise;
  }

  const url = `${libraryBase()}/index.json`;
  indexPromise = fetchImpl(url)
    .then((res) => {
      if (!res.ok) {
        isIndexCached = true;
        indexCache = null;
        return null;
      }
      return res.json();
    })
    .then((data) => {
      if (isValidIndex(data)) {
        isIndexCached = true;
        indexCache = data as LibraryIndex;
        return indexCache;
      }
      isIndexCached = true;
      indexCache = null;
      return null;
    })
    .catch(() => {
      isIndexCached = true;
      indexCache = null;
      return null;
    })
    .finally(() => {
      indexPromise = null;
    });

  return indexPromise;
}

/**
 * Pobiera wartości wskaźnika biblioteki (<base>/values/<id>.json).
 * Kesżuje wyniki i deduplikuje równoległe zapytania.
 */
export function loadLibraryValues(
  id: string,
  fetchImpl: typeof fetch = (...args) => fetch(...args)
): Promise<LibraryValues | null> {
  if (valuesCache.has(id)) {
    return Promise.resolve(valuesCache.get(id) ?? null);
  }
  if (valuesPromises.has(id)) {
    return valuesPromises.get(id)!;
  }

  const url = `${libraryBase()}/values/${id}.json`;
  const promise = fetchImpl(url)
    .then((res) => {
      if (!res.ok) {
        valuesCache.set(id, null);
        return null;
      }
      return res.json();
    })
    .then((data) => {
      if (isValidValues(data)) {
        const valuesObj = data as LibraryValues;
        valuesCache.set(id, valuesObj);
        return valuesObj;
      }
      valuesCache.set(id, null);
      return null;
    })
    .catch(() => {
      valuesCache.set(id, null);
      return null;
    })
    .finally(() => {
      valuesPromises.delete(id);
    });

  valuesPromises.set(id, promise);
  return promise;
}

/**
 * Czyszczenie pamięci podręcznej (używane w testach).
 */
export function resetLibraryCache(): void {
  indexPromise = null;
  indexCache = null;
  isIndexCached = false;
  valuesCache.clear();
  valuesPromises.clear();
}
