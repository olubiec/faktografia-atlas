// Podział za długiej strony zestawu (tabela, profil, porównanie) na kilka stron tego samego rodzaju.
import type { Deck, DeckPage } from './deck';
import type { ShareFormatKey } from './formats';

// Research: limity wierszy tabeli. Post 8 i Story 10 wynikają z planu; Square 6 i Wide 5 to propozycja.
// Test sprawdza, że przy tylu wierszach o najdłuższej nazwie karta nie dopisuje „… jeszcze N wskaźników”.
export const TABLE_ROW_LIMIT: Record<ShareFormatKey, number> = { post: 8, story: 10, square: 6, wide: 5 };
export const PROFILE_ROW_LIMIT = 5;

function limitFor(page: DeckPage, format: ShareFormatKey): number | null {
  if (page.kind === 'table' || page.kind === 'compare') return TABLE_ROW_LIMIT[format];
  if (page.kind === 'profile') return PROFILE_ROW_LIMIT;
  return null;
}

export function canSplit(page: DeckPage, format: ShareFormatKey): boolean {
  const limit = limitFor(page, format);
  return limit != null && page.indicatorIds.length > limit;
}

// Numer id jak w addPage z deck.ts (największy istniejący + 1).
const idNumber = (id: string): number => {
  const m = /^p(\d+)$/.exec(id);
  return m ? Number(m[1]) : 0;
};

export function splitPage(deck: Deck, pageId: string, format: ShareFormatKey): Deck {
  const at = deck.pages.findIndex((p) => p.id === pageId);
  if (at < 0) return deck;
  const src = deck.pages[at];
  const limit = limitFor(src, format);
  if (limit == null || !canSplit(src, format)) return deck;
  const parts = Math.ceil(src.indicatorIds.length / limit);
  let next = Math.max(0, ...deck.pages.map((p) => idNumber(p.id))) + 1;
  const created: DeckPage[] = Array.from({ length: parts }, (_, i) => ({
    ...src,
    id: i === 0 ? src.id : `p${next++}`,
    indicatorIds: src.indicatorIds.slice(i * limit, (i + 1) * limit),
    options: { ...src.options, part: i + 1, parts },
  }));
  return { pages: [...deck.pages.slice(0, at), ...created, ...deck.pages.slice(at + 1)] };
}

const pagesWord = (n: number): string => (n >= 2 && n <= 4 ? 'strony' : 'stron');

export function splitHint(page: DeckPage, format: ShareFormatKey): string | null {
  const limit = limitFor(page, format);
  if (limit == null || !canSplit(page, format)) return null;
  const n = page.indicatorIds.length;
  const parts = Math.ceil(n / limit);
  return `Ta strona ma ${n} wskaźników – podziel ją na ${parts} ${pagesWord(parts)}`;
}
