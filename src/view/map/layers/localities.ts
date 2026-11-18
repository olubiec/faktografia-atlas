import { ScatterplotLayer } from '@deck.gl/layers';
import type { LayerFactory, LayerContext } from './admin';
import type { Locality } from '@/core/search/types';

// Kolor z nadpisaną alfa (0–255); kolory warstw to tablice RGB(A).
function withAlpha(c: ArrayLike<number>, a: number): [number, number, number, number] {
  return [c[0], c[1], c[2], Math.round(((c[3] ?? 255) * a) / 255)];
}

export const localitiesLayerFactory: LayerFactory = {
  id: 'loc-layer',
  create: (ctx: LayerContext) => {
    const zoom = ctx.viewState?.zoom ?? 0;
    // Zoom 5 = warstwy nie ma; 8,5 = zbudowana z alfa 0; 11 = widoczna (FIX6F).
    if (zoom < 8) {
      return null;
    }
    const visibleTarget = zoom >= 9;
    const alpha = visibleTarget ? 255 : 0;
    const localities: Locality[] = ctx.localities ?? [];
    const selectedTeryt = ctx.drillState?.selected;
    const gminaTeryt = selectedTeryt && selectedTeryt.length === 7 ? selectedTeryt : undefined;

    const filtered = gminaTeryt ? localities.filter((loc) => loc.gminaTeryt === gminaTeryt) : localities;
    if (filtered.length === 0) {
      return null;
    }

    const colors = ctx.colors;
    const tuszColor = colors.tusz;
    const ochraColor = colors.ochra ?? colors.tusz;
    const arkuszColor = colors.arkusz;

    return new ScatterplotLayer<Locality>({
      id: 'loc-layer',
      data: filtered,
      getPosition: (d: Locality) => [d.lon, d.lat],
      getFillColor: (d: Locality) => withAlpha(d.approx ? ochraColor : tuszColor, alpha),
      getLineColor: withAlpha(arkuszColor, alpha),
      getRadius: (d: Locality) => (d.approx ? 35 : 45),
      radiusMinPixels: 4,
      radiusMaxPixels: 12,
      stroked: true,
      getLineWidth: 1.5,
      lineWidthUnits: 'pixels',
      pickable: true,
      getTooltip: ({ object }: { object?: Locality }) => (object?.name ? String(object.name) : null),
      updateTriggers: {
        getFillColor: [tuszColor, ochraColor, visibleTarget],
        getLineColor: [arkuszColor, visibleTarget],
      },
    } as any);
  },
};
