// Kolejność wierszy listy wskaźników w profilu (czysta logika).
import type { ProfileIndicatorItem } from './profile';

/** Wiersze w kolejności listy użytkownika (przecięcie „lista × wskaźniki profilu”). */
export function orderByList(
  items: ProfileIndicatorItem[],
  list: readonly string[],
): ProfileIndicatorItem[] {
  const byId = new Map(items.map((i) => [i.indicatorId, i]));
  return list.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });
}

/**
 * O ile miejsc na całej liście trzeba przesunąć wskaźnik, by zamienić się z sąsiadem
 * widocznym w profilu (pomija wskaźniki bez danych); 0 = brak sąsiada.
 */
export function stepsToNeighbor(list: readonly string[], id: string, neighborId?: string): number {
  if (!neighborId) return 0;
  return Math.abs(list.indexOf(neighborId) - list.indexOf(id));
}


/**
 * Na którym miejscu grupy wylądowałby przeciągany wiersz.
 * `mids` = środki wierszy (oś Y) w kolejności grupy, `from` = miejsce przeciąganego, `y` = położenie palca/myszy.
 */
export function dropIndex(mids: readonly number[], from: number, y: number): number {
  return mids.filter((m, i) => i !== from && m < y).length;
}
