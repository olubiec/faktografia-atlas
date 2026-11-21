import { GeoJsonLayer } from '@deck.gl/layers';
import type { FeatureCollection } from 'geojson';
import type { LayerFactory, LayerContext } from './admin';
import { loadGeoData } from './admin';
import { makeFillColorGetter, resolveTokenColor } from './choropleth-color';
import { getNoDataPatternProps } from './no-data-pattern';
import type { Feature } from 'geojson';
import { memoLast } from '@/core/map/memo-last';
import { noteFillLayer } from '@/core/map/fill-transition';
import { createColorMemory } from '@/core/map/fill-blend';
import { readDiag } from '@/core/map/diag';
import { readUrlState } from '@/core/url/state';
import tokensJson from '../../../../config/tokens.json';
import { outlineOpacityFor } from '@/core/map/outline-visibility';

export { resolveTokenColor };

const colorMemory = createColorMemory();

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

    const isReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const getFillColor = makeFillColorGetter({
      choropleth,
      isInScope,
      memory: colorMemory,
      reduced: isReduced || readDiag().notrans,
    });

    // Bez `transitions`: przejścia GPU parują wierzchołki po indeksie i dają wachlarze.
    const layer = new GeoJsonLayer({
      id: 'choropleth-layer',
      data: features,
      filled: true,
      stroked: true,
      getFillColor,
      getLineColor: ctx.colors.granica ?? ctx.colors.kalka,
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
          choropleth.blend?.progress,
          choropleth.blend?.running,
          activeWojTeryt,
          activePowTeryt,
          ctx.colors,
        ],
        getLineColor: [ctx.colors.granica ?? ctx.colors.kalka],
      },
    });
    noteFillLayer('choropleth-layer', choropleth.level, layer.props.transitions as Record<string, unknown> | undefined);
    return layer;
  },
};

/**
 * Dane warstwy „brak danych” liczone raz na zestaw wejść: stała referencja `data` między
 * wywołaniami fabryki oszczędza deckowi ponowne tesselowanie i wysyłkę buforów na GPU.
 */
const noDataData = memoLast(
  (features: FeatureCollection, classByTeryt: Record<string, string | number>, _level: string, _woj: string | null, _pow: string | null, isInScope: (teryt: string | null | undefined) => boolean): FeatureCollection | null => {
    const noData = features.features.filter((f: Feature) => {
      const teryt = f.properties?.teryt;
      if (!isInScope(teryt)) return false;
      return (classByTeryt[teryt] ?? 'no-data') === 'no-data';
    });
    return noData.length === 0 ? null : ({ type: 'FeatureCollection', features: noData } as FeatureCollection);
  },
  // Klucz bez `isInScope` (nowa funkcja co wywołanie): zakres wynika z poziomu i aktywnych TERYT.
  (a, b) => a.slice(0, 5).every((x, i) => x === b[i]),
);

/** Dane obrysu wybranej jednostki: ta sama referencja, dopóki zestaw TERYT i dane geo są te same. */
const outlineData = memoLast(
  (_key: string, terytsToOutline: string[], wojFeatures: FeatureCollection, powFeatures: FeatureCollection, gmiFeatures: FeatureCollection): FeatureCollection | null => {
    const found = terytsToOutline
      .map((teryt) => {
        const pool = teryt.length <= 2 ? wojFeatures : teryt.length <= 4 ? powFeatures : gmiFeatures;
        return pool.features.find((f) => f.properties?.teryt === teryt);
      })
      .filter((f): f is NonNullable<typeof f> => f != null);
    return found.length === 0 ? null : ({ type: 'FeatureCollection', features: found } as FeatureCollection);
  },
  (a, b) => a[0] === b[0] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4],
);

/**
 * Kreskowanie „brak danych” jako osobna warstwa tylko z takimi cechami w zakresie.
 * Wzór procedury (FillStyleExtension) nie dotyka reszty wielokątów, więc przy dużym zbliżeniu
 * nie powstają wachlarze na jednolitych kolorach. Warstwa kolorów rysuje te cechy pod spodem.
 */
export const choroplethNoDataLayerFactory: LayerFactory = {
  id: 'choropleth-nodata-layer',
  create: (ctx: LayerContext) => {
    const choropleth = ctx.choropleth ?? ctx.drillState?.choropleth;
    if (!choropleth || readDiag().nohatch) return null;
    const { features, activeWojTeryt, activePowTeryt, isInScope } = resolveScope(ctx, choropleth);
    const data = noDataData(features, choropleth.classByTeryt, choropleth.level, activeWojTeryt, activePowTeryt, isInScope);
    if (!data) return null;
    const lineColor = resolveTokenColor('--linia');
    return new GeoJsonLayer({
      ...getNoDataPatternProps(choropleth.classByTeryt),
      id: 'choropleth-nodata-layer',
      data,
      filled: true,
      stroked: false,
      pickable: false,
      getFillColor: lineColor,
      updateTriggers: { data: [choropleth.classByTeryt, choropleth.level] },
    });
  },
};

/** Kontekst obrysu: zoom bierze z `viewState`, szerokość mapy i ruch ograniczony podaje wywołujący. */
export type OutlineLayerContext = LayerContext & {
  /** Szerokość mapy w px; brak = obrys bez wygaszania (jak dotąd). */
  mapWidthPx?: number;
  /** Brak podanej wartości = odczyt `prefers-reduced-motion` (jak w warstwie miejscowości). */
  reducedMotion?: boolean;
};

/** Szerokość bbox (stopnie) sumy geometrii. */
function featuresBboxWidthDeg(features: Feature[]): number {
  let west = Infinity;
  let east = -Infinity;
  const walk = (c: unknown): void => {
    if (Array.isArray(c) && typeof c[0] === 'number') {
      west = Math.min(west, c[0]);
      east = Math.max(east, c[0]);
    } else if (Array.isArray(c)) c.forEach(walk);
  };
  for (const f of features) walk((f.geometry as { coordinates?: unknown } | null)?.coordinates);
  return east >= west ? east - west : 0;
}

/**
 * Czerwony obrys wybranej jednostki lub porównywanych jednostek (STYL.md: korekta); nie zasłania koloru wypełnienia.
 * Przejście `getLineColor` w deck.gl uruchamia się samo przy zmianie wartości akcesora (porównanie propsów), więc
 * wystarczy nowa tablica koloru; `updateTriggers` służy tylko do odświeżenia przy zmianie danych wejściowych.
 * Alfa wynika z `outlineOpacityFor` (QC301); czas 300 ms to `motion.base` z tokenów, przy ograniczonym ruchu 0.
 */
export const selectedOutlineLayerFactory: LayerFactory = {
  id: 'selected-outline-layer',
  create: (rawCtx: LayerContext) => {
    const ctx = rawCtx as OutlineLayerContext;
    if (readDiag().nooutline) return null;
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
    const data = outlineData(terytsToOutline.join(','), terytsToOutline, wojFeatures, powFeatures, gmiFeatures);
    if (!data) return null;

    const opacity = ctx.mapWidthPx ? outlineOpacityFor(featuresBboxWidthDeg(data.features), ctx.viewState?.zoom ?? 0, ctx.mapWidthPx) : 1;
    const [r, g, b, a = 255] = ctx.colors.korekta ?? ctx.colors.tusz;
    const lineColor: [number, number, number, number] = [r, g, b, Math.round(opacity * a)];
    const reducedMotion = ctx.reducedMotion ?? (typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

    return new GeoJsonLayer({
      id: 'selected-outline-layer',
      data,
      filled: false,
      stroked: true,
      getLineColor: lineColor,
      transitions: { getLineColor: reducedMotion ? 0 : tokensJson.motion.base },
      getLineWidth: 3,
      lineWidthUnits: 'pixels',
      pickable: false,
      updateTriggers: {
        getLineColor: [ctx.colors.korekta, ctx.colors.tusz, lineColor[3]],
        data: [terytsToOutline.join(',')],
      },
    });
  },
};
