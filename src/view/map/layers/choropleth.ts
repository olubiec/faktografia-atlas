import { GeoJsonLayer } from '@deck.gl/layers';
import type { FeatureCollection } from 'geojson';
import type { LayerFactory, LayerContext } from './admin';
import { loadGeoData, parseCssColor } from './admin';
import { classColorToken, type ClassifyResult } from '@/core/map/classes';
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

  const fallback = parseCssColor(tokensJson.color.light.arkusz);
  if (!fallback) {
    throw new Error('Nieprawidłowy token koloru arkusz w config/tokens.json');
  }
  return fallback;
}

export const choroplethLayerFactory: LayerFactory = {
  id: 'choropleth-layer',
  create: (ctx: LayerContext) => {
    const choropleth = ctx.choropleth ?? ctx.drillState?.choropleth;
    if (!choropleth) {
      return null;
    }

    const { wojFeatures, powFeatures, gmiFeatures } = loadGeoData(ctx.topoData);
    // Wybrany poziom (województwa / powiaty / gminy). Bez wybranej jednostki: cały kraj. Po wybraniu jednostki
    // rysujemy tylko jej województwo, żeby nie budować geometrii tysięcy niewidocznych gmin.
    const all = choropleth.level === 'pow' ? powFeatures : choropleth.level === 'gmi' ? gmiFeatures : wojFeatures;
    const scopeWoj = choropleth.level === 'woj' ? null : ctx.drillState?.activeWojTeryt ?? null;
    const features: FeatureCollection = scopeWoj
      ? {
          type: 'FeatureCollection',
          features: all.features.filter((f) => f.properties?.teryt?.startsWith(scopeWoj)),
        }
      : all;

    // Kolory klas liczymy raz na warstwę (11 tokenów), a nie osobno dla każdej z tysięcy jednostek.
    const palette = new Map<string, [number, number, number, number]>();
    const colorOf = (cls: ClassifyResult) => {
      const token = classColorToken(cls, choropleth.classes, choropleth.scheme);
      let color = palette.get(token);
      if (!color) {
        color = resolveTokenColor(token);
        palette.set(token, color);
      }
      return color;
    };

    return new GeoJsonLayer({
      id: 'choropleth-layer',
      data: features,
      filled: true,
      stroked: true,
      getFillColor: (f: any) => {
        const teryt = f.properties?.teryt;
        const cls = teryt ? choropleth.classByTeryt[teryt] ?? 'no-data' : 'no-data';
        return colorOf(cls);
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
      onHover: (info) => {
        ctx.onHoverUnit?.(
          info.object?.properties?.teryt
            ? { teryt: String(info.object.properties.teryt), x: info.x, y: info.y, width: info.viewport?.width ?? 0 }
            : null
        );
      },
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

/** Czerwony obrys wybranej jednostki (STYL.md: korekta); nie zasłania koloru wypełnienia. */
export const selectedOutlineLayerFactory: LayerFactory = {
  id: 'selected-outline-layer',
  create: (ctx: LayerContext) => {
    const teryt = ctx.drillState?.selected;
    if (!teryt) return null;
    const { wojFeatures, powFeatures, gmiFeatures } = loadGeoData(ctx.topoData);
    const pool = teryt.length <= 2 ? wojFeatures : teryt.length <= 4 ? powFeatures : gmiFeatures;
    const found = pool.features.find((f) => f.properties?.teryt === teryt);
    if (!found) return null;
    return new GeoJsonLayer({
      id: 'selected-outline-layer',
      data: { type: 'FeatureCollection', features: [found] } as FeatureCollection,
      filled: false,
      stroked: true,
      getLineColor: ctx.colors.korekta ?? ctx.colors.tusz,
      getLineWidth: 3,
      lineWidthUnits: 'pixels',
      pickable: false,
      updateTriggers: { getLineColor: [ctx.colors.korekta, ctx.colors.tusz], data: [teryt] },
    });
  },
};
