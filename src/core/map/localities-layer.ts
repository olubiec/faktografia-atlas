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
