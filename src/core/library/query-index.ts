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
  normName?: string;
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

// Przygotowany indeks (jedna pamięć WeakMap dla wszystkich funkcji zapytań).
export type PreparedIndex = {
  catsMap: Map<string, LibraryCategory>;
  vars: LibraryVariable[];
  ancestorsMap: Map<string, string[]>;
  subcategoriesMap: Map<string, Set<string>>;
};

const indexCache = new WeakMap<LibraryIndex, PreparedIndex>();

export function getPreparedIndex(index: LibraryIndex): PreparedIndex {
  let cached = indexCache.get(index);
  if (cached) return cached;

  const catsMap = new Map<string, LibraryCategory>();
  const rawCats = index.categories ?? index.subjects;
  if (rawCats) {
    if (Array.isArray(rawCats)) {
      for (let i = 0; i < rawCats.length; i++) {
        const item = rawCats[i];
        if (item && item.id !== undefined) catsMap.set(String(item.id), item);
      }
    } else {
      for (const [id, item] of Object.entries(rawCats)) {
        if (item) catsMap.set(String(item.id ?? id), item);
      }
    }
  }

  const rawVars = index.variables;
  let vars: LibraryVariable[] = [];
  if (rawVars) {
    if (Array.isArray(rawVars)) {
      vars = rawVars;
    } else {
      vars = Object.values(rawVars);
    }
  }

  for (let i = 0; i < vars.length; i++) {
    const v = vars[i];
    if (v.normName === undefined) {
      v.normName = normalize(v.name);
    }
  }

  const ancestorsMap = new Map<string, string[]>();
  const subcategoriesMap = new Map<string, Set<string>>();

  for (const catId of catsMap.keys()) {
    const ancestors: string[] = [];
    let currentId: string | null = catId;
    const visited = new Set<string>();

    while (currentId !== null && catsMap.has(currentId) && !visited.has(currentId)) {
      visited.add(currentId);
      ancestors.push(currentId);
      const catObj: LibraryCategory = catsMap.get(currentId)!;
      currentId = catObj.parent !== undefined && catObj.parent !== null && catObj.parent !== '' ? String(catObj.parent) : null;
    }

    ancestorsMap.set(catId, ancestors);
  }

  for (const [catId, ancestors] of ancestorsMap.entries()) {
    for (let i = 0; i < ancestors.length; i++) {
      const ancId = ancestors[i];
      let subSet = subcategoriesMap.get(ancId);
      if (!subSet) {
        subSet = new Set<string>();
        subcategoriesMap.set(ancId, subSet);
      }
      subSet.add(catId);
    }
  }

  cached = {
    catsMap,
    vars,
    ancestorsMap,
    subcategoriesMap,
  };

  indexCache.set(index, cached);
  return cached;
}

/** Pobiera identyfikator kategorii zmiennej. */
export function getVarCategory(v: LibraryVariable): string | null {
  const c = v.cat ?? v.categoryId ?? v.subjectId;
  return c !== undefined && c !== null ? String(c) : null;
}

/** Sprawdza, czy zmienna odpowiada wymaganemu poziomowi. */
export function matchesLevel(v: LibraryVariable, requiredLevel: 5 | 6): boolean {
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
