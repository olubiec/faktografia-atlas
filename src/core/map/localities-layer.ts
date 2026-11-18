import type { Locality } from '../search/types';

export interface FilterLocalitiesOptions {
  gminaTeryt?: string;
}

/**
 * Zwraca czy warstwa miejscowości powina być widoczna przy danym poziomie zoomu.
 * Zgodnie z wymaganiami warstwa jest widoczna od zoomu 9.
 */
export function shouldShowLocalitiesLayer(zoom: number): boolean {
  return zoom >= 9;
}

/**
 * Zoom przekazywany do fabryk warstw: tylko dwie wartości (poniżej progu miejscowości i od progu).
 * Dzięki temu warstwy nie przebudowują się na każdej klatce płynnego zoomu.
 */
export function layersZoomBucket(zoom: number): 5 | 11 {
  return shouldShowLocalitiesLayer(zoom) ? 11 : 5;
}

/** Histereza budowy warstwy: włącz od 8,5, wyłącz poniżej 8,0 (bez migotania na progu). */
export function localitiesVisibleWithHysteresis(prev: boolean, zoom: number): boolean {
  return prev ? zoom >= 8 : zoom >= 8.5;
}

/** Docelowa przezroczystość kropek (0–1): smoothstep od zoomu 8,8 do 9,2. */
export function localitiesAlphaTarget(zoom: number): number {
  const t = Math.min(1, Math.max(0, (zoom - 8.8) / 0.4));
  return t * t * (3 - 2 * t);
}

/**
 * Zoom przekazywany warstwom z histerezą: 5 = brak warstwy, 8,5 = zbudowana ale przezroczysta,
 * 11 = widoczna (alfa 255, wchodzi płynnie przez transitions).
 */
export function localitiesLayerZoom(built: boolean, zoom: number): 5 | 8.5 | 11 {
  if (!built) return 5;
  return localitiesAlphaTarget(zoom) >= 0.5 ? 11 : 8.5;
}

/**
 * Filtruje listę miejscowości dla danego zoomu i opcjonalnego filtru gminy.
 */
export function filterLocalitiesByZoom(
  localities: Locality[],
  zoom: number,
  options?: FilterLocalitiesOptions
): Locality[] {
  if (!shouldShowLocalitiesLayer(zoom)) {
    return [];
  }

  if (options?.gminaTeryt) {
    return localities.filter((loc) => loc.gminaTeryt === options.gminaTeryt);
  }

  return localities;
}
