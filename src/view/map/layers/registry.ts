import type { GeoJsonLayer } from '@deck.gl/layers';
import type { DrillState } from '@/core/map/drill';
import type { MapColors, LayerFactory, LayerContext } from './admin';
import { adminLayerFactories } from './admin';

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
  onSelectUnit?: (teryt: string) => void
): GeoJsonLayer[] {
  if (!colors) return [];

  const ctx: LayerContext = {
    topoData,
    colors,
    drillState,
    onSelectUnit,
  };

  const layers: GeoJsonLayer[] = [];

  for (const factory of getLayerFactories()) {
    const layer = factory.create(ctx);
    if (layer) {
      layers.push(layer);
    }
  }

  return layers;
}
