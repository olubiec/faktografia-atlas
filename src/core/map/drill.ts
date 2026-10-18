import type { UnitIndex } from '../units/types';
import { getUnit } from '../units/units';

export type DrillState = {
  selected: string | null;
  parent: string | null;
  layerIds: string[];
  activeWojTeryt: string | null;
  activePowTeryt: string | null;
  bbox: [number, number, number, number] | null;
  unitName: string | null;
};

/**
 * Oblicza stan nawigacji w głąb podziału administracyjnego dla podanego TERYT.
 */
export function getDrillState(
  selectedTeryt: string | null,
  index: UnitIndex
): DrillState {
  if (!selectedTeryt) {
    return {
      selected: null,
      parent: null,
      layerIds: ['woj-layer', 'country-layer'],
      activeWojTeryt: null,
      activePowTeryt: null,
      bbox: null,
      unitName: null,
    };
  }

  const unit = getUnit(index, selectedTeryt);
  if (!unit) {
    return {
      selected: null,
      parent: null,
      layerIds: ['woj-layer', 'country-layer'],
      activeWojTeryt: null,
      activePowTeryt: null,
      bbox: null,
      unitName: null,
    };
  }

  if (unit.level === 'woj') {
    return {
      selected: unit.teryt,
      parent: null,
      layerIds: ['woj-layer', 'pow-layer', 'country-layer'],
      activeWojTeryt: unit.teryt,
      activePowTeryt: null,
      bbox: unit.bbox,
      unitName: unit.name,
    };
  }

  if (unit.level === 'pow') {
    return {
      selected: unit.teryt,
      parent: unit.parent,
      layerIds: ['woj-layer', 'pow-layer', 'gmi-layer', 'country-layer'],
      activeWojTeryt: unit.parent,
      activePowTeryt: unit.teryt,
      bbox: unit.bbox,
      unitName: unit.name,
    };
  }

  if (unit.level === 'gmi') {
    const parentPow = unit.parent ? getUnit(index, unit.parent) : undefined;
    const activeWojTeryt = parentPow?.parent ?? null;

    return {
      selected: unit.teryt,
      parent: unit.parent,
      layerIds: ['woj-layer', 'pow-layer', 'gmi-layer', 'country-layer'],
      activeWojTeryt,
      activePowTeryt: unit.parent,
      bbox: unit.bbox,
      unitName: unit.name,
    };
  }

  return {
    selected: null,
    parent: null,
    layerIds: ['woj-layer', 'country-layer'],
    activeWojTeryt: null,
    activePowTeryt: null,
    bbox: null,
    unitName: null,
  };
}

/**
 * Zwraca TERYT rodzica wybranej jednostki lub null, jeśli jesteśmy na poziomie kraju.
 */
export function getParentTeryt(
  selectedTeryt: string | null,
  index: UnitIndex
): string | null {
  if (!selectedTeryt) return null;
  const unit = getUnit(index, selectedTeryt);
  if (!unit) return null;
  return unit.parent;
}

/**
 * Odczytuje i weryfikuje parametr TERYT (?u=) z adresu URL.
 */
export function getInitialSelectedFromUrl(
  search: string,
  index: UnitIndex
): string | null {
  if (!search) return null;
  const params = new URLSearchParams(search);
  const u = params.get('u');
  if (!u) return null;
  const unit = getUnit(index, u);
  return unit ? unit.teryt : null;
}

/**
 * Aktualizuje parametr ?u= w adresie URL bez przeładowania strony (replaceState).
 */
export function updateUrlTeryt(teryt: string | null): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (teryt) {
    url.searchParams.set('u', teryt);
  } else {
    url.searchParams.delete('u');
  }
  window.history.replaceState(null, '', url.toString());
}
