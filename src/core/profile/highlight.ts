import type { ProfileIndicatorItem } from './profile';

/**
 * Wybiera identyfikator wskaźnika w profilu jednostki, w którym jednostka wypada najlepiej
 * w województwie (najmniejszy rankVoivodeship).
 *
 * Zasady:
 * - Wskaźniki neutralne (neutral === true) są ignorowane.
 * - Wybierany jest wskaźnik z najmniejszym rankVoivodeship (równym co najmniej 1).
 * - Remisy rankVoivodeship są rozstrzygane na korzyść mniejszego rankNational.
 * - Dalsze remisy rozstrzygane są na korzyść kolejności wystąpienia na liście (pierwszy z kolei).
 * - Jeśli brak wskaźników spełniających warunki (np. brak rankingów woj.), zwraca null.
 */
export function pickHighlight(items: ProfileIndicatorItem[]): string | null {
  let bestItem: ProfileIndicatorItem | null = null;

  for (const item of items) {
    if (item.neutral || item.rankVoivodeship === null) {
      continue;
    }

    if (!bestItem) {
      bestItem = item;
      continue;
    }

    // Porównanie rankVoivodeship (im mniejsze, tym lepsze miejsce)
    if (item.rankVoivodeship < bestItem.rankVoivodeship!) {
      bestItem = item;
    } else if (item.rankVoivodeship === bestItem.rankVoivodeship!) {
      // Remis w województwie -> porównujemy rankNational
      const currentNat = item.rankNational ?? Number.POSITIVE_INFINITY;
      const bestNat = bestItem.rankNational ?? Number.POSITIVE_INFINITY;

      if (currentNat < bestNat) {
        bestItem = item;
      }
    }
  }

  return bestItem ? bestItem.indicatorId : null;
}
