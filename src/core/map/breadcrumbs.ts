import type { UnitIndex } from '../units/types';
import { getUnit, getAncestors } from '../units/units';

export type BreadcrumbItem = {
  label: string;
  teryt: string | null;
};

/**
 * Zwraca ścieżkę okruszków (Polska → województwo → powiat → gmina) dla podanego TERYT.
 * Dla nieznanego lub pustego TERYT zwraca samą „Polska”.
 */
export function getBreadcrumbs(
  teryt: string | null,
  index: UnitIndex
): BreadcrumbItem[] {
  const rootItem: BreadcrumbItem = { label: 'Polska', teryt: null };

  if (!teryt) {
    return [rootItem];
  }

  const unit = getUnit(index, teryt);
  if (!unit) {
    return [rootItem];
  }

  const ancestors = getAncestors(index, teryt);
  const ancestorItems: BreadcrumbItem[] = ancestors.map((anc) => ({
    label: anc.name,
    teryt: anc.teryt,
  }));

  const currentItem: BreadcrumbItem = {
    label: unit.name,
    teryt: unit.teryt,
  };

  return [rootItem, ...ancestorItems, currentItem];
}
