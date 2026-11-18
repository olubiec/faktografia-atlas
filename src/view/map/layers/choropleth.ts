import { GeoJsonLayer } from '@deck.gl/layers';
import type { FeatureCollection } from 'geojson';
import type { LayerFactory, LayerContext } from './admin';
import { loadGeoData, parseCssColor } from './admin';
import { classColorToken, type ClassifyResult } from '@/core/map/classes';
import { getNoDataPatternProps } from './no-data-pattern';
import type { Feature } from 'geojson';
import { resolveFillTransition } from '@/core/map/fill-transition';
import { readUrlState } from '@/core/url/state';
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

type Choropleth = NonNullable<LayerContext['choropleth']>;

/** Wspólne dla obu warstw: pełny podział poziomu, aktywny zakres i test „czy w zakresie”. */
function resolveScope(ctx: LayerContext, choropleth: Choropleth) {
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
  return { features, activeWojTeryt, activePowTeryt, isInScope };
}

export const choroplethLayerFactory: LayerFactory = {
  id: 'choropleth-layer',
  create: (ctx: LayerContext) => {
    const choropleth = ctx.choropleth ?? ctx.drillState?.choropleth;
    if (!choropleth) {
      return null;
    }

    const { features, activeWojTeryt, activePowTeryt, isInScope } = resolveScope(ctx, choropleth);

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
    const lineColor = resolveTokenColor('--linia');

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
        // Zestaw cech zależy tylko od poziomu (zakres filtruje kolor, nie dane).
        getFillColor: resolveFillTransition(choropleth.level, transitionDuration, { revealRunning: choropleth.reveal?.running ?? false }).ms,
      },
      data: features,
      filled: true,
      stroked: true,
      getFillColor: (f: any) => {
        const teryt = f.properties?.teryt;
        const cls = teryt ? choropleth.classByTeryt[teryt] ?? 'no-data' : 'no-data';
        const fullColor = cls === 'no-data' ? lineColor : colorOf(cls);

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
          choropleth.classByTeryt,
          activeWojTeryt,
          activePowTeryt,
          ctx.colors,
        ],
        getLineColor: [ctx.colors.kalka],
      },
    });
  },
};

/**
 * Kreskowanie „brak danych” jako osobna warstwa tylko z takimi cechami w zakresie.
 * Wzór procedury (FillStyleExtension) nie dotyka reszty wielokątów, więc przy dużym zbliżeniu
 * nie powstają wachlarze na jednolitych kolorach. Warstwa kolorów rysuje te cechy pod spodem.
 */
export const choroplethNoDataLayerFactory: LayerFactory = {
  id: 'choropleth-nodata-layer',
  create: (ctx: LayerContext) => {
    const choropleth = ctx.choropleth ?? ctx.drillState?.choropleth;
    if (!choropleth) return null;
    const { features, isInScope } = resolveScope(ctx, choropleth);
    const noData = features.features.filter((f: Feature) => {
      const teryt = f.properties?.teryt;
      if (!isInScope(teryt)) return false;
      return (choropleth.classByTeryt[teryt] ?? 'no-data') === 'no-data';
    });
    if (noData.length === 0) return null;
    const lineColor = resolveTokenColor('--linia');
    return new GeoJsonLayer({
      ...getNoDataPatternProps(choropleth.classByTeryt),
      id: 'choropleth-nodata-layer',
      data: { type: 'FeatureCollection', features: noData } as FeatureCollection,
      filled: true,
      stroked: false,
      pickable: false,
      getFillColor: lineColor,
      updateTriggers: { data: [choropleth.classByTeryt, choropleth.level] },
    });
  },
};

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
