import { normalize } from '../search/normalize';
import {
  getPreparedIndex,
  getVarCategory,
  matchesLevel,
  type LibraryCategory,
  type LibraryIndex,
  type LibraryQuery,
  type LibraryVariable,
} from './query-index';

// Typy żyją w query-index.ts; re-eksport zachowuje dotychczasowe importy.
export type { LibraryCategory, LibraryIndex, LibraryQuery, LibraryVariable } from './query-index';

/** Zwraca pusty / domyślny zapytanie biblioteki. */
export function emptyQuery(): LibraryQuery {
  return {
    cat: null,
    text: '',
    level: null,
    unit: null,
    onlyReady: false,
  };
}

/** Zwraca bezpośrednie podkategorie wybranej kategorii nadrzędnej (lub krainowe gdy parent === null). */
export function childCategories(index: LibraryIndex, parent: string | null): LibraryCategory[] {
  const prepared = getPreparedIndex(index);
  const result: LibraryCategory[] = [];
  const targetParent = parent !== null ? String(parent) : null;

  for (const categoryObj of prepared.catsMap.values()) {
    const catParent = categoryObj.parent !== undefined && categoryObj.parent !== null && categoryObj.parent !== '' ? String(categoryObj.parent) : null;
    if (catParent === targetParent) {
      result.push(categoryObj);
    }
  }

  return result.sort((a, b) => a.name.localeCompare(b.name, 'pl', { sensitivity: 'base' }));
}

/** Zwraca ścieżkę kategorii od korzenia do wskazanej kategorii. */
export function categoryPath(index: LibraryIndex, id: string): LibraryCategory[] {
  const prepared = getPreparedIndex(index);
  const path: LibraryCategory[] = [];
  let currentId: string | null = String(id);
  const visited = new Set<string>();

  while (currentId !== null && prepared.catsMap.has(currentId) && !visited.has(currentId)) {
    visited.add(currentId);
    const categoryObj: LibraryCategory = prepared.catsMap.get(currentId)!;
    path.unshift(categoryObj);
    currentId = categoryObj.parent !== undefined && categoryObj.parent !== null && categoryObj.parent !== '' ? String(categoryObj.parent) : null;
  }

  return path;
}

function filterVarsInternal(index: LibraryIndex, query: LibraryQuery, sortResults: boolean = true): LibraryVariable[] {
  const prepared = getPreparedIndex(index);
  const vars = prepared.vars;

  let allowedCatIds: Set<string> | null = null;
  if (query.cat !== null && query.cat !== '') {
    allowedCatIds = prepared.subcategoriesMap.get(String(query.cat)) ?? new Set<string>([String(query.cat)]);
  }

  const normQuery = normalize(query.text);
  const queryWords = normQuery.length > 0 ? normQuery.split(' ').filter(Boolean) : [];
  const numWords = queryWords.length;

  const matched: LibraryVariable[] = [];

  for (let i = 0; i < vars.length; i++) {
    const v = vars[i];

    // 1. Kategoria
    if (allowedCatIds !== null) {
      const varCat = getVarCategory(v);
      if (varCat === null || !allowedCatIds.has(varCat)) {
        continue;
      }
    }

    // 2. Wyszukiwanie tekstowe
    if (numWords > 0) {
      const normName = v.normName ?? normalize(v.name);
      let matchesText = true;
      for (let w = 0; w < numWords; w++) {
        if (!normName.includes(queryWords[w])) {
          matchesText = false;
          break;
        }
      }
      if (!matchesText) continue;
    }

    // 3. Poziom
    if (query.level !== null) {
      if (!matchesLevel(v, query.level)) continue;
    }

    // 4. Jednostka
    if (query.unit !== null && query.unit !== '') {
      if (v.unit !== query.unit) continue;
    }

    // 5. onlyReady
    if (query.onlyReady) {
      const isReady = v.has === 1 || v.has === true || v.hasReady === true;
      if (!isReady) continue;
    }

    matched.push(v);
  }

  if (!sortResults) {
    return matched;
  }

  const collator = new Intl.Collator('pl', { sensitivity: 'base' });

  // Sortowanie: początek nazwy wg tekstu, potem alfabetycznie po nazwie
  if (normQuery.length > 0) {
    matched.sort((a, b) => {
      const aNorm = a.normName ?? normalize(a.name);
      const bNorm = b.normName ?? normalize(b.name);
      const aPrefix = aNorm.startsWith(normQuery);
      const bPrefix = bNorm.startsWith(normQuery);
      if (aPrefix && !bPrefix) return -1;
      if (!aPrefix && bPrefix) return 1;
      return collator.compare(a.name, b.name);
    });
  } else {
    matched.sort((a, b) => collator.compare(a.name, b.name));
  }

  return matched;
}

/** Filtruje zmienne wg podanych kryteriów. */
export function filterVars(index: LibraryIndex, query: LibraryQuery): LibraryVariable[] {
  return filterVarsInternal(index, query, true);
}

/** Zlicza liczbę wyników pasujących do zapytania (z pominięciem filtra kategorii) w każdej kategorii i jej podkategoriach. */
export function countByCategory(index: LibraryIndex, query: LibraryQuery): Record<string, number> {
  const prepared = getPreparedIndex(index);
  const counts: Record<string, number> = {};

  for (const catId of prepared.catsMap.keys()) {
    counts[catId] = 0;
  }

  // Zapytanie bez filtra kategorii, bez konieczności sortowania
  const queryWithoutCat: LibraryQuery = { ...query, cat: null };
  const matchingVars = filterVarsInternal(index, queryWithoutCat, false);

  for (let i = 0; i < matchingVars.length; i++) {
    const v = matchingVars[i];
    const varCat = getVarCategory(v);
    if (varCat !== null) {
      const ancestors = prepared.ancestorsMap.get(varCat);
      if (ancestors) {
        for (let j = 0; j < ancestors.length; j++) {
          const catId = ancestors[j];
          counts[catId] = (counts[catId] ?? 0) + 1;
        }
      }
    }
  }

  return counts;
}
