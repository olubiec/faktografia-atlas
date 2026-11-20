// Czysty reducer stanu edytora zestawu (bez Reacta i sieci).
import {
  addPage, removePage, movePage, updatePage, numbering, getPage, pageIndex,
  type Deck, type DeckPage, type PageKind,
} from '@/core/share/deck';
import { defaultDeck, type DeckContext, type ShareEntry } from '@/core/share/deck-defaults';
import { seedIndicators, addIndicatorToPage, removeIndicatorFromPage, replaceIndicator } from '@/core/share/deck-page-data';
import { splitPage } from '@/core/share/deck-split';
import { DEFAULT_INDICATOR_ID } from '@/core/map/main-view';
import type { ShareFormatKey } from '@/core/share/formats';

export type DeckTheme = 'light' | 'dark';
export type DeckState = {
  deck: Deck;
  currentId: string;
  format: ShareFormatKey;
  theme: DeckTheme;
  numbering: ReturnType<typeof numbering>;
  mine: readonly string[];
  activeId: string;
};

export type DeckAction =
  | { type: 'setCurrent'; id: string }
  | { type: 'setFormat'; format: ShareFormatKey }
  | { type: 'setTheme'; theme: DeckTheme }
  | { type: 'addPage'; kind: PageKind; afterId?: string | null }
  | { type: 'removePage'; id: string }
  | { type: 'movePage'; id: string; dir: -1 | 1 }
  | { type: 'splitPage'; id: string }
  | { type: 'addIndicator'; pageId: string; id: string }
  | { type: 'removeIndicator'; pageId: string; id: string }
  | { type: 'replaceIndicator'; pageId: string; id: string };

export function initDeckState(entry: ShareEntry, ctx: DeckContext): DeckState {
  const deck = defaultDeck(entry, ctx);
  return {
    deck,
    currentId: deck.pages[0].id,
    format: 'post',
    theme: 'light',
    numbering: numbering(deck),
    mine: ctx.mine,
    activeId: ctx.indicatorId ?? ctx.mine[0] ?? DEFAULT_INDICATOR_ID,
  };
}

// Nowy zestaw + spójna numeracja; current wraca na istniejącą stronę.
function withDeck(s: DeckState, deck: Deck, currentId = s.currentId): DeckState {
  if (deck === s.deck) return s;
  const id = getPage(deck, currentId) ? currentId : deck.pages[0].id;
  return { ...s, deck, currentId: id, numbering: numbering(deck) };
}

function patchPage(s: DeckState, pageId: string, fn: (p: DeckPage) => DeckPage): DeckState {
  const page = getPage(s.deck, pageId);
  if (!page) return s;
  const next = fn(page);
  return next === page ? s : withDeck(s, updatePage(s.deck, pageId, next));
}

export function deckReducer(s: DeckState, a: DeckAction): DeckState {
  switch (a.type) {
    case 'setCurrent':
      return getPage(s.deck, a.id) ? { ...s, currentId: a.id } : s;
    case 'setFormat':
      return s.format === a.format ? s : { ...s, format: a.format };
    case 'setTheme':
      return s.theme === a.theme ? s : { ...s, theme: a.theme };
    case 'addPage': {
      const indicatorIds = seedIndicators(a.kind, s.mine, s.activeId);
      const deck = addPage(s.deck, { kind: a.kind, indicatorIds }, a.afterId);
      const created = deck.pages.find((p) => !getPage(s.deck, p.id));
      return withDeck(s, deck, created?.id);
    }
    case 'removePage': {
      const i = pageIndex(s.deck, a.id);
      const deck = removePage(s.deck, a.id);
      if (deck === s.deck) return s;
      const fallback = (deck.pages[i] ?? deck.pages[i - 1] ?? deck.pages[0]).id;
      return withDeck(s, deck, s.currentId === a.id ? fallback : s.currentId);
    }
    case 'movePage':
      return withDeck(s, movePage(s.deck, a.id, a.dir));
    case 'splitPage':
      return withDeck(s, splitPage(s.deck, a.id, s.format));
    case 'addIndicator':
      return patchPage(s, a.pageId, (p) => addIndicatorToPage(p, a.id));
    case 'removeIndicator':
      return patchPage(s, a.pageId, (p) => removeIndicatorFromPage(p, a.id));
    case 'replaceIndicator':
      return patchPage(s, a.pageId, (p) => replaceIndicator(p, a.id));
  }
}
