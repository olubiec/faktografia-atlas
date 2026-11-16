import { GeoJsonLayer } from '@deck.gl/layers';
import type { FeatureCollection } from 'geojson';
import type { LayerFactory, LayerContext } from './admin';
import { loadGeoData } from './admin';
import { readUrlState } from '@/core/url/state';

/** Czerwony obrys wybranej jednostki lub porównywanych jednostek (STYL.md: korekta); nie zasłania koloru wypełnienia. */
export const selectedOutlineLayerFactory: LayerFactory = {
  id: 'selected-outline-layer',
  create: (ctx: LayerContext) => {
    const compareParam = (ctx.drillState as any)?.c ?? (typeof window !== 'undefined' ? readUrlState(window.location.search).c : null);
    const terytsToOutline: string[] = [];

    if (compareParam) {
      const parts = compareParam.split(',');
      if (parts.length === 2) {
        terytsToOutline.push(...parts);
      }
    }

    if (terytsToOutline.length === 0 && ctx.drillState?.selected) {
      terytsToOutline.push(ctx.drillState.selected);
    }

    if (terytsToOutline.length === 0) return null;

    const { wojFeatures, powFeatures, gmiFeatures } = loadGeoData(ctx.topoData);
    const foundFeatures = terytsToOutline
      .map((teryt) => {
        const pool = teryt.length <= 2 ? wojFeatures : teryt.length <= 4 ? powFeatures : gmiFeatures;
        return pool.features.find((f) => f.properties?.teryt === teryt);
      })
      .filter((f): f is NonNullable<typeof f> => f != null);

    if (foundFeatures.length === 0) return null;

    return new GeoJsonLayer({
      id: 'selected-outline-layer',
      data: { type: 'FeatureCollection', features: foundFeatures } as FeatureCollection,
      filled: false,
      stroked: true,
      getLineColor: ctx.colors.korekta ?? ctx.colors.tusz,
      getLineWidth: 3,
      lineWidthUnits: 'pixels',
      pickable: false,
      updateTriggers: {
        getLineColor: [ctx.colors.korekta, ctx.colors.tusz],
        data: [terytsToOutline.join(',')],
      },
    });
  },
};
