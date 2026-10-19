import { ScatterplotLayer } from '@deck.gl/layers';
import type { LayerFactory, LayerContext } from './admin';
import { shouldShowLocalitiesLayer, filterLocalitiesByZoom } from '@/core/map/localities-layer';
import type { Locality } from '@/core/search/types';

export const localitiesLayerFactory: LayerFactory = {
  id: 'loc-layer',
  create: (ctx: LayerContext) => {
    const zoom = ctx.viewState?.zoom ?? 0;
    if (!shouldShowLocalitiesLayer(zoom)) {
      return null;
    }

    const localities: Locality[] = ctx.localities ?? [];
    const selectedTeryt = ctx.drillState?.selected;
    const gminaTeryt = selectedTeryt && selectedTeryt.length === 7 ? selectedTeryt : undefined;

    const filtered = filterLocalitiesByZoom(localities, zoom, { gminaTeryt });
    if (filtered.length === 0) {
      return null;
    }

    const colors = ctx.colors;
    const tuszColor = colors.tusz;
    const ochraColor = colors.ochra ?? [199, 119, 0, 255];
    const arkuszColor = colors.arkusz;

    return new ScatterplotLayer<Locality>({
      id: 'loc-layer',
      data: filtered,
      getPosition: (d: Locality) => [d.lon, d.lat],
      getFillColor: (d: Locality) => (d.approx ? ochraColor : tuszColor),
      getLineColor: arkuszColor,
      getRadius: (d: Locality) => (d.approx ? 35 : 45),
      radiusMinPixels: 4,
      radiusMaxPixels: 12,
      stroked: true,
      getLineWidth: 1.5,
      lineWidthUnits: 'pixels',
      pickable: true,
      getTooltip: ({ object }: { object?: Locality }) => (object?.name ? String(object.name) : null),
      updateTriggers: {
        getFillColor: [tuszColor, ochraColor],
        getLineColor: [arkuszColor],
      },
    } as any);
  },
};
