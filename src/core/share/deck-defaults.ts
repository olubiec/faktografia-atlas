// Zestawy domyślne okna „Pobierz i udostępnij” zależnie od miejsca otwarcia.
import { DEFAULT_INDICATOR_ID } from '../map/main-view';
import { createDeck, type Deck, type NewPage, type PageKind } from './deck';
import { seedIndicators } from './deck-page-data';

export type ShareEntry = 'map' | 'profile' | 'compare' | 'rankings' | 'library';
export type DeckContext = {
  indicatorId: string | null;
  mine: readonly string[];
  hasUnit: boolean;
  hasPair: boolean;
};

type Spec = PageKind | 'ranking-top' | 'ranking-bottom';

function specsFor(entry: ShareEntry, ctx: DeckContext): Spec[] {
  switch (entry) {
    case 'profile':
      return ctx.hasUnit ? ['profile', 'bignumber', 'trend', 'table'] : specsFor('map', ctx);
    case 'compare':
      return ctx.hasPair ? ['compare', 'table', 'versus'] : specsFor('map', ctx);
    case 'rankings':
      return ['ranking-top', 'map', 'histogram'];
    case 'library':
      return ['ranking-top', 'histogram'];
    case 'map':
      return ['map', 'ranking-top', 'ranking-bottom', 'table', ...(ctx.hasUnit ? (['profile'] as Spec[]) : [])];
  }
}

// Nigdy nie rzuca; zestaw ma zawsze co najmniej jedną stronę.
export function defaultDeck(entry: ShareEntry, ctx: DeckContext): Deck {
  const activeId = ctx.indicatorId ?? ctx.mine[0] ?? DEFAULT_INDICATOR_ID;
  const pages = specsFor(entry, ctx).map((spec): NewPage => {
    const kind: PageKind = spec === 'ranking-top' || spec === 'ranking-bottom' ? 'ranking' : spec;
    const page: NewPage = { kind, indicatorIds: seedIndicators(kind, ctx.mine, activeId) };
    if (spec === 'ranking-top') page.options = { side: 'top' };
    if (spec === 'ranking-bottom') page.options = { side: 'bottom' };
    return page;
  });
  return createDeck(pages);
}
