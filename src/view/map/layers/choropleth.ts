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
    // Rysujemy pełny podział administracyjny danego poziomu. Reszta kraju jest rysowana jako wyblakłe tło.
    const features: FeatureCollection =
      choropleth.level === 'pow' ? powFeatures : choropleth.level === 'gmi' ? gmiFeatures : wojFeatures;

    const activeWojTeryt = choropleth.activeScope?.activeWojTeryt ?? ctx.drillState?.activeWojTeryt ?? null;
    const activePowTeryt = choropleth.activeScope?.activePowTeryt ?? ctx.drillState?.activePowTeryt ?? null;

    const isInScope = (teryt: string | null | undefined): boolean => {
      if (!teryt) return false;
      if (choropleth.level === 'woj') return true;
      if (choropleth.level === 'pow') {
        return activeWojTeryt ? teryt.startsWith(activeWojTeryt) : true;
      }
      if (choropleth.level === 'gmi') {
        if (activePowTeryt) return teryt.startsWith(activePowTeryt);
        if (activeWojTeryt) return teryt.startsWith(activeWojTeryt);
        return true;
      }
      return true;
    };

    // Kolory klas liczymy raz na warstwę, a nie osobno dla każdej z tysięcy jednostek.
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

    const progress = choropleth.reveal?.progress ?? 1;
    const running = choropleth.reveal?.running ?? false;
    const totalDuration = tokensJson.motion.revealTotal ?? 900;
    const elapsed = progress * totalDuration;

    const isReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const transitionDuration = isReduced ? 0 : tokensJson.motion.base ?? 300;

    return new GeoJsonLayer({
      id: 'choropleth-layer',
      transitions: {
        getFillColor: transitionDuration,
      },
      data: features,
      filled: true,
      stroked: true,
      getFillColor: (f: any) => {
        const teryt = f.properties?.teryt;
        const cls = teryt ? choropleth.classByTeryt[teryt] ?? 'no-data' : 'no-data';
        const fullColor = colorOf(cls);

        // Reszta kraju (poza aktywnym zakresem): wyblakły kolor tła
        if (!isInScope(teryt)) {
          return [fullColor[0], fullColor[1], fullColor[2], 64];
        }

        // Jednostki w aktywnym zakresie: animowane pojawianie się po kolei
        if (running && progress < 1) {
          const res = teryt ? choropleth.revealResults?.get(teryt) : undefined;
          if (res && elapsed < res.delay) {
            return [fullColor[0], fullColor[1], fullColor[2], 64];
          }
        }

        return fullColor;
      },
      getLineColor: ctx.colors.kalka,
      getLineWidth: 1.2,
      lineWidthUnits: 'pixels',
      lineWidthMinPixels: 1,
      pickable: true,
      onClick: (info) => {
        const teryt = info.object?.properties?.teryt;
        if (teryt && isInScope(teryt) && ctx.onSelectUnit) {
          ctx.onSelectUnit(teryt);
        }
      },
      onHover: (info) => {
        const teryt = info.object?.properties?.teryt;
        if (teryt && isInScope(teryt)) {
          ctx.onHoverUnit?.({
            teryt: String(teryt),
            x: info.x,
            y: info.y,
            width: info.viewport?.width ?? 0,
          });
        } else {
          ctx.onHoverUnit?.(null);
        }
      },
      updateTriggers: {
        getFillColor: [
          choropleth.indicatorId,
          choropleth.year,
          choropleth.level,
          choropleth.classByTeryt,
          choropleth.reveal?.progress,
          choropleth.reveal?.running,
          activeWojTeryt,
          activePowTeryt,
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
