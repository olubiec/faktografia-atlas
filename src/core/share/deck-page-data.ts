import type { DeckPage, PageKind } from './deck';

// Ile wskaźników może mieć strona danego rodzaju.
export const PAGE_DATA_RULES: Record<PageKind, { min: number; max: number }> = {
  map: { min: 1, max: 1 },
  ranking: { min: 1, max: 1 },
  bignumber: { min: 1, max: 1 },
  trend: { min: 1, max: 1 },
  histogram: { min: 1, max: 1 },
  versus: { min: 1, max: 1 },
  table: { min: 1, max: 20 },
  profile: { min: 1, max: 20 },
  compare: { min: 1, max: 20 },
};

export const isSingleIndicator = (kind: PageKind): boolean => PAGE_DATA_RULES[kind].max === 1;

export const canAddData = (page: DeckPage): boolean =>
  !isSingleIndicator(page.kind) && page.indicatorIds.length < PAGE_DATA_RULES[page.kind].max;

export const canRemoveData = (page: DeckPage): boolean => page.indicatorIds.length > PAGE_DATA_RULES[page.kind].min;

// Dopisuje na końcu; duplikat, strona jednowskaźnikowa i przekroczenie max = ta sama referencja.
export function addIndicatorToPage(page: DeckPage, id: string): DeckPage {
  if (!canAddData(page) || page.indicatorIds.includes(id)) return page;
  return { ...page, indicatorIds: [...page.indicatorIds, id] };
}

// Ostatniego (min) wskaźnika nie usuwa.
export function removeIndicatorFromPage(page: DeckPage, id: string): DeckPage {
  if (!canRemoveData(page) || !page.indicatorIds.includes(id)) return page;
  return { ...page, indicatorIds: page.indicatorIds.filter((x) => x !== id) };
}

// Tylko dla stron jednowskaźnikowych.
export function replaceIndicator(page: DeckPage, id: string): DeckPage {
  if (!isSingleIndicator(page.kind)) return page;
  if (page.indicatorIds.length === 1 && page.indicatorIds[0] === id) return page;
  return { ...page, indicatorIds: [id] };
}

// Domyślne wskaźniki nowej strony.
export function seedIndicators(kind: PageKind, mine: readonly string[], activeId: string | null): string[] {
  if (isSingleIndicator(kind)) {
    const one = activeId ?? mine[0];
    return one ? [one] : [];
  }
  if (mine.length === 0) return activeId ? [activeId] : [];
  return mine.slice(0, PAGE_DATA_RULES[kind].max);
}
