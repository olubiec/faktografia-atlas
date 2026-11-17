import type { CardData, CardKind, CompareCardData, RankingCardData } from './card';
import { paginate } from './pagination';

/** Ile wierszy rankingu mieści się czytelnie na jednej stronie karty. */
export const RANKING_ROWS_PER_PAGE = 10;

/** Ile wierszy tabeli porównania mieści się na karcie obok dwóch map z legendą. */
export const COMPARE_ROWS_PER_PAGE = 8;

export interface CardPageData {
  data: CardData;
  page: { number: number; total: number };
}

/** Dzieli dane karty na strony; ranking i porównanie są wielostronicowe (ranking: numeracja pozycji ciągła). */
export function cardPages(kind: CardKind, data: CardData, perPage = RANKING_ROWS_PER_PAGE): CardPageData[] {
  if (kind === 'compare') {
    const cmp = data as CompareCardData;
    return paginate(cmp.rows, COMPARE_ROWS_PER_PAGE).map((p) => ({
      data: { ...cmp, rows: p.items },
      page: { number: p.number, total: p.total },
    }));
  }
  if (kind !== 'ranking') return [{ data, page: { number: 1, total: 1 } }];
  const ranking = data as RankingCardData;
  const numbered = ranking.items.map((it, i) => ({ ...it, rank: it.rank ?? i + 1 }));
  return paginate(numbered, perPage).map((p) => ({
    data: { ...ranking, items: p.items },
    page: { number: p.number, total: p.total },
  }));
}
