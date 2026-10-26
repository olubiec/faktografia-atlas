import { normalize } from '../search/normalize';

export type LibraryQuery = {
  cat: string | null;
  text: string;
  level: 5 | 6 | null;
  unit: string | null;
  onlyReady: boolean;
};

export type LibraryCategory = {
  id: string;
  name: string;
  parent?: string | null;
  path?: string[];
};

export type LibraryVariable = {
  id: string | number;
  name: string;
  cat?: string | null;
  categoryId?: string | null;
  subjectId?: string | null;
  level?: number | null;
  levels?: number[];
  unit?: string | null;
  has?: number | boolean | null;
  hasReady?: boolean;
};

export type LibraryIndex = {
  categories?: Record<string, LibraryCategory> | LibraryCategory[];
  subjects?: Record<string, LibraryCategory> | LibraryCategory[];
  variables: Record<string | number, LibraryVariable> | LibraryVariable[];
};

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

/** Pomocnicza mapa kategorii z indeksu. */
function getCategoriesMap(index: LibraryIndex): Map<string, LibraryCategory> {
  const map = new Map<string, LibraryCategory>();
  const rawCats = index.categories ?? index.subjects;
  if (!rawCats) return map;
  if (Array.isArray(rawCats)) {
    for (const item of rawCats) {
      if (item && item.id !== undefined) map.set(String(item.id), item);
    }
  } else {
    for (const [id, item] of Object.entries(rawCats)) {
      if (item) map.set(String(item.id ?? id), item);
    }
  }
  return map;
}

/** Pomocnicza lista zmiennych z indeksu. */
function getVariablesList(index: LibraryIndex): LibraryVariable[] {
  const rawVars = index.variables;
  if (!rawVars) return [];
  if (Array.isArray(rawVars)) {
    return rawVars;
  }
  return Object.values(rawVars);
}

/** Pobiera identyfikator kategorii zmiennej. */
function getVarCategory(v: LibraryVariable): string | null {
  const c = v.cat ?? v.categoryId ?? v.subjectId;
  return c !== undefined && c !== null ? String(c) : null;
}

/** Zwraca bezpośrednie podkategorie wybranej kategorii nadrzędnej (lub krainowe gdy parent === null). */
export function childCategories(index: LibraryIndex, parent: string | null): LibraryCategory[] {
  const catsMap = getCategoriesMap(index);
  const result: LibraryCategory[] = [];
  const targetParent = parent !== null ? String(parent) : null;

  for (const categoryObj of catsMap.values()) {
    const catParent = categoryObj.parent !== undefined && categoryObj.parent !== null && categoryObj.parent !== '' ? String(categoryObj.parent) : null;
    if (catParent === targetParent) {
      result.push(categoryObj);
    }
  }

  return result.sort((a, b) => a.name.localeCompare(b.name, 'pl', { sensitivity: 'base' }));
}

/** Zwraca ścieżkę kategorii od korzenia do wskazanej kategorii. */
export function categoryPath(index: LibraryIndex, id: string): LibraryCategory[] {
  const catsMap = getCategoriesMap(index);
  const path: LibraryCategory[] = [];
  let currentId: string | null = String(id);
  const visited = new Set<string>();

  while (currentId !== null && catsMap.has(currentId) && !visited.has(currentId)) {
    visited.add(currentId);
    const categoryObj: LibraryCategory = catsMap.get(currentId)!;
    path.unshift(categoryObj);
    currentId = categoryObj.parent !== undefined && categoryObj.parent !== null && categoryObj.parent !== '' ? String(categoryObj.parent) : null;
  }

  return path;
}

/** Zwraca zbiornik identyfikatorów kategorii i wszystkich jej podkategorii. */
function getAllSubcategoryIds(catsMap: Map<string, LibraryCategory>, rootId: string): Set<string> {
  const subIds = new Set<string>();
  const childrenMap = new Map<string, string[]>();

  for (const categoryObj of catsMap.values()) {
    const p = categoryObj.parent !== undefined && categoryObj.parent !== null && categoryObj.parent !== '' ? String(categoryObj.parent) : null;
    if (p !== null) {
      if (!childrenMap.has(p)) childrenMap.set(p, []);
      childrenMap.get(p)!.push(String(categoryObj.id));
    }
  }

  const queue = [String(rootId)];
  subIds.add(String(rootId));

  while (queue.length > 0) {
    const current = queue.pop()!;
    const children = childrenMap.get(current);
    if (children) {
      for (const childId of children) {
        if (!subIds.has(childId)) {
          subIds.add(childId);
          queue.push(childId);
        }
      }
    }
  }

  return subIds;
}

/** Sprawdza, czy zmienna odpowiada wymaganemu poziomowi. */
function matchesLevel(v: LibraryVariable, requiredLevel: 5 | 6): boolean {
  if (v.levels && Array.isArray(v.levels)) {
    return v.levels.includes(requiredLevel);
  }

  if (v.level === null || v.level === undefined) {
    return true;
  }

  const levelNum = Number(v.level);
  if (requiredLevel === 5) {
    // Poziom 5 (powiaty) – zmienne tylko gminne (level === 6) są wykluczone
    return levelNum === 5;
  } else {
    // Poziom 6 (gminy) – zmienne gminne (level === 6)
    return levelNum === 6;
  }
}

/** Filtruje zmienne wg podanych kryteriów. */
export function filterVars(index: LibraryIndex, query: LibraryQuery): LibraryVariable[] {
  const vars = getVariablesList(index);
  const catsMap = getCategoriesMap(index);

  let allowedCatIds: Set<string> | null = null;
  if (query.cat !== null && query.cat !== '') {
    allowedCatIds = getAllSubcategoryIds(catsMap, query.cat);
  }

  const normQuery = normalize(query.text);
  const queryWords = normQuery.length > 0 ? normQuery.split(' ').filter(Boolean) : [];

  const matched: LibraryVariable[] = [];

  for (const v of vars) {
    // 1. Kategoria
    if (allowedCatIds !== null) {
      const varCat = getVarCategory(v);
      if (varCat === null || !allowedCatIds.has(varCat)) {
        continue;
      }
    }

    // 2. Wyszukiwanie tekstowe
    if (queryWords.length > 0) {
      const normName = normalize(v.name);
      let matchesText = true;
      for (const word of queryWords) {
        if (!normName.includes(word)) {
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

  // Sortowanie: początek nazwy wg tekstu, potem alfabetycznie po nazwie
  matched.sort((a, b) => {
    if (normQuery.length > 0) {
      const aPrefix = normalize(a.name).startsWith(normQuery);
      const bPrefix = normalize(b.name).startsWith(normQuery);
      if (aPrefix && !bPrefix) return -1;
      if (!aPrefix && bPrefix) return 1;
    }
    return a.name.localeCompare(b.name, 'pl', { sensitivity: 'base' });
  });

  return matched;
}

/** Zlicza liczbę wyników pasujących do zapytania (z pominięciem filtra kategorii) w każdej kategorii i jej podkategoriach. */
export function countByCategory(index: LibraryIndex, query: LibraryQuery): Record<string, number> {
  const catsMap = getCategoriesMap(index);
  const counts: Record<string, number> = {};

  for (const catId of catsMap.keys()) {
    counts[catId] = 0;
  }

  // Zapytanie bez filtra kategorii
  const queryWithoutCat: LibraryQuery = { ...query, cat: null };
  const matchingVars = filterVars(index, queryWithoutCat);

  for (const v of matchingVars) {
    const varCat = getVarCategory(v);
    if (varCat !== null && catsMap.has(varCat)) {
      // Zwiększ licznik dla kategorii oraz jej wszystkich przodków
      let currentCatId: string | null = varCat;
      const visited = new Set<string>();

      while (currentCatId !== null && catsMap.has(currentCatId) && !visited.has(currentCatId)) {
        visited.add(currentCatId);
        counts[currentCatId] = (counts[currentCatId] ?? 0) + 1;
        const categoryObj: LibraryCategory = catsMap.get(currentCatId)!;
        currentCatId = categoryObj.parent !== undefined && categoryObj.parent !== null && categoryObj.parent !== '' ? String(categoryObj.parent) : null;
      }
    }
  }

  return counts;
}
