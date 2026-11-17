// Model zestawu stron eksportu: czysta logika, bez Reacta i rysowania.
export type PageKind = 'map' | 'ranking' | 'table' | 'bignumber' | 'trend' | 'histogram' | 'profile' | 'compare' | 'versus';
export type DeckPage = {
  id: string;
  kind: PageKind;
  indicatorIds: string[];
  options?: { side?: 'top' | 'bottom'; part?: number; parts?: number };
};
export type Deck = { pages: DeckPage[] };
export type NewPage = Omit<DeckPage, 'id'>;

// Kolejny numer = największy istniejący + 1 (usunięcie środkowej strony nie przywraca jej id).
const idNumber = (id: string): number => {
  const m = /^p(\d+)$/.exec(id);
  return m ? Number(m[1]) : 0;
};
const nextId = (deck: Deck): string => `p${Math.max(0, ...deck.pages.map((p) => idNumber(p.id))) + 1}`;

export function createDeck(pages: NewPage[]): Deck {
  return { pages: pages.map((p, i) => ({ ...p, id: `p${i + 1}` })) };
}

export const pageIndex = (deck: Deck, id: string): number => deck.pages.findIndex((p) => p.id === id);
export const getPage = (deck: Deck, id: string): DeckPage | undefined => deck.pages.find((p) => p.id === id);

export function addPage(deck: Deck, page: NewPage, afterId?: string | null): Deck {
  const created: DeckPage = { ...page, id: nextId(deck) };
  const at = afterId ? pageIndex(deck, afterId) : -1;
  const pos = at < 0 ? deck.pages.length : at + 1;
  return { pages: [...deck.pages.slice(0, pos), created, ...deck.pages.slice(pos)] };
}

export function removePage(deck: Deck, id: string): Deck {
  if (deck.pages.length <= 1 || pageIndex(deck, id) < 0) return deck;
  return { pages: deck.pages.filter((p) => p.id !== id) };
}

export function movePage(deck: Deck, id: string, dir: -1 | 1): Deck {
  const i = pageIndex(deck, id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= deck.pages.length) return deck;
  const pages = [...deck.pages];
  [pages[i], pages[j]] = [pages[j], pages[i]];
  return { pages };
}

export function updatePage(deck: Deck, id: string, patch: Partial<Omit<DeckPage, 'id'>>): Deck {
  const i = pageIndex(deck, id);
  if (i < 0) return deck;
  const pages = [...deck.pages];
  pages[i] = { ...deck.pages[i], ...patch, id };
  return { pages };
}

export function numbering(deck: Deck): { id: string; n: number; total: number; label: string }[] {
  const total = deck.pages.length;
  return deck.pages.map((p, i) => ({ id: p.id, n: i + 1, total, label: total === 1 ? '' : `${i + 1}/${total}` }));
}
