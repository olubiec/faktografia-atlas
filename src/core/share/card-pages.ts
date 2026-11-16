import type { CardData, CardKind, RankingCardData } from './card';
import { paginate } from './pagination';

/** Ile wierszy rankingu mieści się czytelnie na jednej stronie karty. */
export const RANKING_ROWS_PER_PAGE = 10;

export interface CardPageData {
  data: CardData;
  page: { number: number; total: number };
}

/** Dzieli dane karty na strony; tylko ranking jest wielostronicowy, numeracja pozycji zostaje ciągła. */
export function cardPages(kind: CardKind, data: CardData, perPage = RANKING_ROWS_PER_PAGE): CardPageData[] {
  if (kind !== 'ranking') return [{ data, page: { number: 1, total: 1 } }];
  const ranking = data as RankingCardData;
  const numbered = ranking.items.map((it, i) => ({ ...it, rank: it.rank ?? i + 1 }));
  return paginate(numbered, perPage).map((p) => ({
    data: { ...ranking, items: p.items },
    page: { number: p.number, total: p.total },
  }));
}
