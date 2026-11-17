import { normalize } from '../search/normalize';
import type { Unit } from '../units/types';
import type { RankedUnit } from './ranking';

/**
 * Zawęża gotowy ranking do wpisanej nazwy (bez polskich znaków i wielkości liter)
 * oraz do jednego województwa (dwie pierwsze cyfry TERYT).
 * Miejsca (`rank`) zostają z pełnego rankingu; zwracamy podzbiór tych samych obiektów.
 */
export function filterRanking(
  items: RankedUnit[],
  opts: { q: string; w: string | null },
  unitsByTeryt: Map<string, Unit>
): RankedUnit[] {
  const query = normalize(opts.q);
  const voivodeship = opts.w;
  if (!query && !voivodeship) return items.slice();

  return items.filter((item) => {
    if (voivodeship && !item.teryt.startsWith(voivodeship)) return false;
    if (!query) return true;
    const name = unitsByTeryt.get(item.teryt)?.name ?? item.name;
    return normalize(name).includes(query);
  });
}
