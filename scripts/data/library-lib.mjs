// Biblioteka GUS: czyste funkcje robota, który stopniowo pobiera całe BDL (testowane w Vitest bez sieci).
// Pliki powstają na gałęzi `data/library` (nigdy na main):
//   library/catalog.json  – działy (kategorie) i lista zmiennych
//   library/state.json    – kolejka i kursory, żeby kolejne uruchomienia wznawiały pracę
//   library/values/<id>.json – wartości zmiennej w zwartej postaci
const BASE = 'https://bdl.stat.gov.pl/api/v1';

export function subjectsUrl(parentId, page = 0) {
  const u = new URL(`${BASE}/subjects`);
  if (parentId) u.searchParams.set('parent-id', parentId);
  u.searchParams.set('format', 'json');
  u.searchParams.set('lang', 'pl');
  u.searchParams.set('page-size', '100');
  u.searchParams.set('page', String(page));
  return u.toString();
}

export function variablesUrl(subjectId, page = 0) {
  const u = new URL(`${BASE}/variables`);
  u.searchParams.set('subject-id', subjectId);
  u.searchParams.set('format', 'json');
  u.searchParams.set('lang', 'pl');
  u.searchParams.set('page-size', '100');
  u.searchParams.set('page', String(page));
  return u.toString();
}

export function dataUrl(varId, level, page = 0) {
  const u = new URL(`${BASE}/data/by-variable/${varId}`);
  u.searchParams.set('unit-level', String(level));
  u.searchParams.set('format', 'json');
  u.searchParams.set('lang', 'pl');
  u.searchParams.set('page-size', '100');
  u.searchParams.set('page', String(page));
  return u.toString();
}

/** Licznik zapytań z twardym budżetem: robot się zatrzymuje, zanim wyczerpie limit. */
export function createBudget(total, estimatePerVariable = 45) {
  let used = 0;
  return {
    get used() {
      return used;
    },
    get left() {
      return Math.max(0, total - used);
    },
    spend() {
      used++;
    },
    canStartVariable() {
      return total - used >= estimatePerVariable;
    },
    canRequest() {
      return used < total;
    },
  };
}

/** Poziomy do pobrania: 6 (gminy) tylko gdy zmienna je ma; 5 (powiaty) gdy ma poziom ≥ 5. Niżej – pomijamy. */
export function levelsForVariable(variable) {
  const lvl = Number(variable.level);
  if (!Number.isFinite(lvl) || lvl < 5) return [];
  return lvl >= 6 ? [5, 6] : [5];
}

/** Kolejność: najpierw zmienne z danymi gminnymi, potem powiatowe; w grupie rosnąco po id. */
export function sortQueue(variables) {
  return [...variables]
    .filter((v) => levelsForVariable(v).length > 0)
    .sort((a, b) => Number(b.level >= 6) - Number(a.level >= 6) || a.id - b.id);
}

/** Zamienia strony odpowiedzi /data/by-variable na zwartą postać: lata + wartości po jednostce. */
export function compactPages(pages) {
  const years = new Set();
  for (const p of pages) for (const r of p.results ?? []) for (const v of r.values ?? []) years.add(String(v.year));
  const y = [...years].sort();
  const d = {};
  for (const p of pages) {
    for (const r of p.results ?? []) {
      const row = y.map(() => null);
      for (const v of r.values ?? []) {
        const i = y.indexOf(String(v.year));
        if (i >= 0 && v.val !== null && v.val !== undefined) row[i] = v.val;
      }
      if (row.some((x) => x !== null)) d[String(r.id)] = row;
    }
  }
  return { y, d };
}

/** Drzewo działów jako płaska lista z rodzicem i ścieżką – na potrzeby filtrów i kategorii na stronie. */
export function addSubject(catalog, subject, parentId) {
  const parent = parentId ? catalog.subjects[parentId] : null;
  catalog.subjects[subject.id] = {
    id: subject.id,
    name: subject.name,
    parent: parentId ?? null,
    path: parent ? [...parent.path, subject.name] : [subject.name],
  };
}

export function emptyState() {
  return { version: 1, queue: [], leafDone: [], pending: [], done: {}, failed: {}, runs: 0, lastRun: null };
}

export function emptyCatalog() {
  return { version: 1, subjects: {}, variables: {} };
}
