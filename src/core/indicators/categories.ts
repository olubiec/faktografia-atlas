/** Kategorie wskaźników w wyszukiwarce: czysta konfiguracja, bez nowych danych. */

export const OTHER_CATEGORY = 'Inne';

export interface IndicatorCategory {
  name: string;
  /** Identyfikatory wskaźników z config/indicators.json. */
  ids: readonly string[];
}

export const INDICATOR_CATEGORIES: readonly IndicatorCategory[] = [
  { name: 'Ludność', ids: ['population', 'density'] },
  { name: 'Rynek pracy', ids: ['unemployment-rate', 'unemployed-share-working-age'] },
  { name: 'Demografia', ids: ['natural-increase'] },
  { name: 'Wiek', ids: ['share-65plus', 'median-age'] },
  { name: 'Migracje', ids: ['migration-balance'] },
];

/** Nazwy kategorii w kolejności wyświetlania („Inne” zawsze na końcu). */
export const CATEGORY_NAMES: readonly string[] = [
  ...INDICATOR_CATEGORIES.map((c) => c.name),
  OTHER_CATEGORY,
];

/** Kategoria wskaźnika; brak wpisu w konfiguracji = „Inne”. */
export function categoryOf(id: string): string {
  return INDICATOR_CATEGORIES.find((c) => c.ids.includes(id))?.name ?? OTHER_CATEGORY;
}

/** Wskaźniki wskazanej kategorii, w kolejności wejściowej. */
export function indicatorsInCategory<T extends { id: string }>(items: readonly T[], name: string): T[] {
  return items.filter((i) => categoryOf(i.id) === name);
}

/** Dodaje lub usuwa id z zaznaczenia (wielokrotny wybór); zwraca nową tablicę. */
export function toggleSelection(selected: readonly string[], id: string): string[] {
  return selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
}
