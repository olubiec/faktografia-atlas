// Przypisanie wskaźników profilu do bloków układu i dobór widocznych bloków (czysta logika).
import { visibleIds, type BlockId, type Layout } from './layout';

/** Wskaźniki wydzielone z grupy „Ludność” do bloku „Wiek mieszkańców”. */
const AGE_INDICATORS: readonly string[] = ['median-age', 'share-65plus'];

const GROUP_BLOCK: Record<string, BlockId> = {
  Ludność: 'population',
  Pieniądze: 'income',
  Praca: 'unemployment',
  Mieszkania: 'housing',
  Środowisko: 'environment',
  Życie: 'life',
  Transport: 'transport',
};

/** Blok wskaźnika; null dla grup spoza układu (te są zawsze widoczne). */
export function blockForIndicator(indicatorId: string, group: string | undefined): BlockId | null {
  if (AGE_INDICATORS.includes(indicatorId)) return 'age';
  return (group && GROUP_BLOCK[group]) || null;
}

/** Czy wskaźnik ma być pokazany przy danym układzie. */
export function isIndicatorVisible(indicatorId: string, group: string | undefined, layout: Layout): boolean {
  const block = blockForIndicator(indicatorId, group);
  return block === null || visibleIds(layout).includes(block);
}

/** Wskaźniki widocznych bloków, w kolejności układu (reszta zachowuje dotychczasową kolejność). */
export function orderByLayout<T>(
  items: readonly T[],
  layout: Layout,
  key: (item: T) => { id: string; group?: string },
): T[] {
  const order = visibleIds(layout);
  const rank = (item: T) => {
    const { id, group } = key(item);
    const block = blockForIndicator(id, group);
    return block === null ? order.length : order.indexOf(block);
  };
  return items
    .filter((item) => rank(item) !== -1)
    .map((item, i) => ({ item, i, r: rank(item) }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map((x) => x.item);
}

/** Zapis układu w parametrze adresu (`?uklad=`), np. do podglądu cudzego układu. */
export const LAYOUT_PARAM = 'uklad';
