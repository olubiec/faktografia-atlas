import type { IndicatorValues } from '../profile/profile';
import type { Unit, UnitLevel } from '../units/types';
import { libraryBase } from './config';

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

export type CompactValues = {
  y?: (number | string)[];
  d?: Record<string, (number | null)[]>;
  years?: (number | string)[];
  values?: Record<string, (number | null)[]>;
  [key: string]: unknown;
};

export type LibraryValues = {
  v?: string | number;
  id?: string | number;
  indicatorId?: string;
  fetchedAt?: string;
  l5?: CompactValues;
  l6?: CompactValues;
  l3?: CompactValues;
  y?: (number | string)[];
  d?: Record<string, (number | null)[]>;
  years?: (number | string)[];
  values?: Record<string, (number | null)[]>;
  [key: string]: unknown;
};

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
 * Zamienia klucze (12-znakowe identyfikatory BDL) na kody TERYT na podstawie units.json (bdlId),
 * pomijając części gmin i nieznane identyfikatory.
 */
export function valuesByTeryt(
  values: LibraryValues,
  level: UnitLevel | string | number,
  units: Unit[]
): IndicatorValues {
  const levelStr = String(level);

  let compact: CompactValues | undefined;
  if (levelStr === 'pow' || levelStr === '5' || levelStr === 'l5') {
    compact = values.l5 ?? (values['pow'] as CompactValues) ?? (values['5'] as CompactValues);
  } else if (levelStr === 'gmi' || levelStr === '6' || levelStr === 'l6') {
    compact = values.l6 ?? (values['gmi'] as CompactValues) ?? (values['6'] as CompactValues);
  } else if (levelStr === 'woj' || levelStr === '3' || levelStr === 'l3') {
    compact = values.l3 ?? (values['woj'] as CompactValues) ?? (values['3'] as CompactValues);
  } else if (values[levelStr] && typeof values[levelStr] === 'object') {
    compact = values[levelStr] as CompactValues;
  }

  if (!compact) {
    compact = values as CompactValues;
  }

  const rawYears = compact.y ?? compact.years ?? values.y ?? values.years ?? [];
  const years = rawYears.map((y) => Number(y));

  const rawDict =
    compact.d ?? compact.values ?? values.d ?? values.values ?? {};

  const bdlToTeryt = new Map<string, string>();
  for (const unit of units) {
    if (unit.bdlId) {
      bdlToTeryt.set(unit.bdlId, unit.teryt);
    }
  }

  const mappedValues: Record<string, (number | null)[]> = {};
  for (const [bdlId, row] of Object.entries(rawDict)) {
    const teryt = bdlToTeryt.get(bdlId);
    if (teryt !== undefined) {
      mappedValues[teryt] = row;
    }
  }

  const indicatorId = String(
    values.v ?? values.id ?? values.indicatorId ?? ''
  );
  const fetchedAt =
    typeof values.fetchedAt === 'string'
      ? values.fetchedAt
      : new Date().toISOString();

  return {
    indicatorId,
    years,
    values: mappedValues,
    fetchedAt,
  };
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
