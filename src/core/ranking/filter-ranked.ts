import { normalize } from '../search/normalize';
import type { RankedUnit } from './ranking';

/**
 * Filtruje listę rankingu po nazwie jednostki (bez względu na polskie znaki i wielkość liter).
 * Pusta fraza zwraca całą listę; kolejność rankingu zostaje zachowana.
 */
export function filterRankedUnits(items: RankedUnit[], query: string): RankedUnit[] {
  const q = normalize(query);
  if (!q) return items;
  return items.filter((r) => normalize(r.name ?? '').includes(q));
}
