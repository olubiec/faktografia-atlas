import { GeoJsonLayer } from '@deck.gl/layers';
import type { FeatureCollection } from 'geojson';
import type { LayerFactory, LayerContext } from './admin';
import { loadGeoData } from './admin';
import { readUrlState } from '@/core/url/state';
import { outlineWidth, resolveOutlinedIds } from '@/core/map/outline-style';

/** Szew testowy: dokłada `outlinedIds` do window.__atlas (tylko z ?e2e). Wartość liczona na żywo. */
let seamWatcherStarted = false;
function ensureOutlinedIdsSeam(): void {
  if (seamWatcherStarted || typeof window === 'undefined') return;
  if (!new URLSearchParams(window.location.search).has('e2e')) return;
  seamWatcherStarted = true;
  const wrap = () => {
    const desc = Object.getOwnPropertyDescriptor(window, '__atlas');
    const orig = desc?.get as (undefined | (() => Record<string, unknown>) & { __outlined?: true });
    if (!desc || !orig || orig.__outlined) return;
    const wrapped = Object.assign(
      () => {
        const base = orig.call(window) as { selected: string | null };
        const c = readUrlState(window.location.search).c ?? null;
        return Object.freeze({ ...base, outlinedIds: resolveOutlinedIds(c, base.selected?.includes(',') ? null : base.selected) });
      },
      { __outlined: true as const }
    );
    Object.defineProperty(window, '__atlas', { ...desc, get: wrapped });
  };
  // installAtlasSeam nadpisuje właściwość przy każdej zmianie stanu, więc owijamy ją ponownie.
  window.setInterval(wrap, 50);
  wrap();
}

/** Czerwony obrys wybranej jednostki lub porównywanych jednostek (STYL.md: korekta); nie zasłania koloru wypełnienia. */
export const selectedOutlineLayerFactory: LayerFactory = {
  id: 'selected-outline-layer',
  create: (ctx: LayerContext) => {
    ensureOutlinedIdsSeam();
    const compareParam = (ctx.drillState as any)?.c ?? (typeof window !== 'undefined' ? readUrlState(window.location.search).c : null);
    const terytsToOutline = resolveOutlinedIds(compareParam, ctx.drillState?.selected);

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
      getLineWidth: outlineWidth(ctx.viewState?.zoom ?? 0),
      lineWidthUnits: 'pixels',
      pickable: false,
      updateTriggers: {
        getLineColor: [ctx.colors.korekta, ctx.colors.tusz],
        getLineWidth: [Math.round((ctx.viewState?.zoom ?? 0) * 2)],
        data: [terytsToOutline.join(',')],
      },
    });
  },
};
