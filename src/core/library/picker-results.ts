import {
  childCategoriesWithData,
  countFetchedByCategory,
  emptyQuery,
  filterFetched,
  type LibraryIndex,
  type LibraryVariable,
} from './query';

/** Najwięcej wyników biblioteki w oknie wyboru wskaźnika (reszta po zawężeniu kategorią lub tekstem). */
export const LIBRARY_PICK_LIMIT = 50;

export type LibraryPickCategory = { id: string; name: string; count: number };

/** Działy główne biblioteki, w których jest co najmniej jeden pobrany wskaźnik, z licznikiem. */
export function libraryPickCategories(index: LibraryIndex): LibraryPickCategory[] {
  const counts = countFetchedByCategory(index);
  return childCategoriesWithData(index, null).map((c) => ({
    id: String(c.id),
    name: c.name,
    count: counts.get(String(c.id)) ?? 0,
  }));
}

/** Wyniki do wyboru: tylko pobrane zmienne, w dziale i/lub po tekście, nie więcej niż `LIBRARY_PICK_LIMIT`. */
export function libraryPickResults(
  index: LibraryIndex,
  filter: { cat: string | null; text: string },
): { items: LibraryVariable[]; total: number } {
  const all = filterFetched(index, { ...emptyQuery(), cat: filter.cat, text: filter.text });
  return { items: all.slice(0, LIBRARY_PICK_LIMIT), total: all.length };
}
