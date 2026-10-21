import type { Layer } from '@deck.gl/core';
import type { DrillState } from '@/core/map/drill';
import type { ViewState } from '@/core/map/view';
import type { Locality } from '@/core/search/types';
import type { MapColors, LayerFactory, LayerContext } from './admin';
import { adminLayerFactories } from './admin';
export { localitiesLayerFactory } from './localities';

const layerFactoriesRegistry: LayerFactory[] = [...adminLayerFactories];

/**
 * Zwraca zarejestrowane fabryki warstw w stałej kolejności.
 */
export function getLayerFactories(): LayerFactory[] {
  return [...layerFactoriesRegistry];
}

/**
 * Rejestruje nową fabrykę warstwy w rejestrze.
 */
export function registerLayerFactory(factory: LayerFactory): void {
  if (!layerFactoriesRegistry.some((f) => f.id === factory.id)) {
    layerFactoriesRegistry.push(factory);
  }
}

/**
 * Tworzy warstwy deck.gl dla podanych danych i stanu.
 */
export function createMapLayers(
  topoData: any,
  colors: MapColors | null,
  drillState?: DrillState,
  onSelectUnit?: (teryt: string) => void,
  viewState?: ViewState,
  localities?: Locality[],
  onHoverUnit?: LayerContext['onHoverUnit']
): Layer[] {
  if (!colors) return [];

  const ctx: LayerContext = {
    topoData,
    colors,
    drillState,
    onSelectUnit,
    viewState,
    localities,
    onHoverUnit,
  };

  const layers: Layer[] = [];

  for (const factory of getLayerFactories()) {
    const layer = factory.create(ctx);
    if (layer) {
      layers.push(layer as Layer);
    }
  }

  return layers;
}
