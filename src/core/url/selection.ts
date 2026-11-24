import type { UnitIndex } from '../units/types';
import { readUrlState } from './state';

/**
 * Jednostka wybrana na mapie według adresu: `?u=`, a gdy go brak – miejsce A z `?c=a,b`.
 * Link „Porównaj z sąsiadem” prowadzi na `/mapa?c=a,b` bez `u`; bez tego mapa nie
 * otwierała profilu, więc widok porównania nigdy się nie pojawiał.
 */
export function selectedFromUrl(search: string, index: UnitIndex): string | null {
  const state = readUrlState(search, index);
  if (state.u) return state.u;
  return state.c ? state.c.split(',')[0] : null;
}

/**
 * Czy arkusz profilu na telefonie ma otworzyć się na całą wysokość: `?sheet=full`
 * albo porównanie `?c=a,b` (tabela porównania jest poniżej pierwszego ekranu, przy 40% wysokości niewidoczna).
 */
export function wantsFullSheet(search: string, index?: UnitIndex): boolean {
  if (new URLSearchParams(search).get('sheet') === 'full') return true;
  return readUrlState(search, index).c !== undefined;
}
