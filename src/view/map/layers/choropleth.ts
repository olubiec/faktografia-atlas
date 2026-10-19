import { GeoJsonLayer } from '@deck.gl/layers';
import type { FeatureCollection } from 'geojson';
import type { LayerFactory, LayerContext } from './admin';
import { loadGeoData, parseCssColor } from './admin';
import { classColorToken } from '@/core/map/classes';
import tokensJson from '../../../../config/tokens.json';

/**
 * Odczytuje kolor z aktualnych zmiennych CSS tokenu (np. --seq-1, --div-3, --no-data)
 * lub z pliku zapasowego config/tokens.json dla podanego motywu.
 */
export function resolveTokenColor(
  token: string,
  theme: 'light' | 'dark' = 'light'
): [number, number, number, number] {
  if (typeof window !== 'undefined') {
    const style = getComputedStyle(document.documentElement);
    const val = style.getPropertyValue(token)?.trim();
    if (val) {
      const parsed = parseCssColor(val);
      if (parsed) return parsed;
    }
  }

  const isDark = theme === 'dark';
  let hex: string | undefined;

  if (token === '--no-data') {
    hex = tokensJson.data.noData[isDark ? 'dark' : 'light'];
  } else if (token.startsWith('--seq-')) {
    const idx = parseInt(token.slice(6), 10) - 1;
    const seq = tokensJson.data.sequential[isDark ? 'dark' : 'light'];
    hex = seq[idx] ?? seq[0];
  } else if (token.startsWith('--div-')) {
    const idx = parseInt(token.slice(6), 10) - 1;
    const div = tokensJson.data.diverging[isDark ? 'dark' : 'light'];
    hex = div[idx] ?? div[0];
  }

  if (hex) {
    const parsed = parseCssColor(hex);
    if (parsed) return parsed;
  }

  return parseCssColor(tokensJson.color.light.arkusz) ?? [248, 250, 249, 255];
}

export const choroplethLayerFactory: LayerFactory = {
  id: 'choropleth-layer',
  create: (ctx: LayerContext) => {
    const choropleth = ctx.choropleth ?? ctx.drillState?.choropleth;
    if (!choropleth) {
      return null;
    }

    const { wojFeatures, powFeatures, gmiFeatures } = loadGeoData(ctx.topoData);
    let features: FeatureCollection;

    if (choropleth.level === 'pow') {
      const activeWojTeryt = ctx.drillState?.activeWojTeryt;
      if (!activeWojTeryt) return null;
      features = {
        type: 'FeatureCollection',
        features: powFeatures.features.filter((f) =>
          f.properties?.teryt?.startsWith(activeWojTeryt)
        ),
      };
    } else if (choropleth.level === 'gmi') {
      const activePowTeryt = ctx.drillState?.activePowTeryt;
      if (!activePowTeryt) return null;
      features = {
        type: 'FeatureCollection',
        features: gmiFeatures.features.filter((f) =>
          f.properties?.teryt?.startsWith(activePowTeryt)
        ),
      };
    } else {
      features = wojFeatures;
    }

    return new GeoJsonLayer({
      id: 'choropleth-layer',
      data: features,
      filled: true,
      stroked: true,
      getFillColor: (f: any) => {
        const teryt = f.properties?.teryt;
        const cls = teryt ? choropleth.classByTeryt[teryt] ?? 'no-data' : 'no-data';
        const token = classColorToken(cls, choropleth.classes, choropleth.scheme);
        return resolveTokenColor(token);
      },
      getLineColor: ctx.colors.kalka,
      getLineWidth: 1.2,
      lineWidthUnits: 'pixels',
      lineWidthMinPixels: 1,
      pickable: true,
      onClick: (info) => {
        if (info.object?.properties?.teryt && ctx.onSelectUnit) {
          ctx.onSelectUnit(info.object.properties.teryt);
        }
      },
      getTooltip: ({ object }: any) => (object?.properties?.name ? String(object.properties.name) : null),
      updateTriggers: {
        getFillColor: [
          choropleth.indicatorId,
          choropleth.year,
          choropleth.level,
          choropleth.classByTeryt,
          ctx.colors,
        ],
        getLineColor: [ctx.colors.kalka],
      },
    });
  },
};
