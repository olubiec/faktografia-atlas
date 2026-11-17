import { GeoJsonLayer } from '@deck.gl/layers';
import type { FeatureCollection } from 'geojson';
import type { LayerFactory, LayerContext } from './admin';
import { loadGeoData, parseCssColor } from './admin';
import { classColorToken, type ClassifyResult } from '@/core/map/classes';
import { getNoDataPatternProps } from './no-data-pattern';
import {
  initialCrossfade,
  stepCrossfade,
  easeInOut,
  crossfadeEnabled,
  crossfadeLayers,
  type CrossfadeState,
} from '@/core/map/crossfade';
import type { ChoroplethData } from '../hooks/useChoropleth';
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

type LayerOpts = { id: string; opacity: number; pickable: boolean; animate: boolean };

function buildChoroplethLayer(ctx: LayerContext, choropleth: ChoroplethData, opts: LayerOpts) {
  {

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
    const lineColor = resolveTokenColor('--linia');

    // Zmiana wskaźnika/roku na tej samej warstwie: płynne przejście kolorów (wbudowane w deck.gl).
    // Na telefonach wyłączone (przejścia atrybutów to dodatkowe shadery GPU).
    const transitionDuration = opts.animate ? tokensJson.motion.base : 0;

    return new GeoJsonLayer({
      ...getNoDataPatternProps(choropleth.classByTeryt),
      id: opts.id,
      opacity: opts.opacity,
      ...(transitionDuration > 0
        ? { transitions: { getFillColor: { duration: transitionDuration, easing: easeInOut } } }
        : {}),
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

        return fullColor;
      },
      getLineColor: ctx.colors.granica ?? ctx.colors.kalka,
      getLineWidth: 1.2,
      lineWidthUnits: 'pixels',
      lineWidthMinPixels: 1,
      pickable: opts.pickable,
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
          activeWojTeryt,
          activePowTeryt,
          ctx.colors,
        ],
        getLineColor: [ctx.colors.granica, ctx.colors.kalka],
      },
    });
  }
}

const scopeKeyOf = (c: ChoroplethData) =>
  `${c.level}:${c.activeScope?.activeWojTeryt ?? ''}:${c.activeScope?.activePowTeryt ?? ''}`;

// Pamięć ostatnio narysowanego zakresu: stara warstwa zostaje pod spodem, aż nowa wjedzie.
let fade: CrossfadeState = initialCrossfade;
let shown: ChoroplethData | null = null;
let outgoing: ChoroplethData | null = null;

const matches = (q: string) => typeof window !== 'undefined' && window.matchMedia(q).matches;

// Przenikanie jest 3x szybsze od odsłaniania (ok. 300 ms zamiast 900 ms).
const FADE_SPEEDUP = tokensJson.motion.revealTotal / tokensJson.motion.base;

export const choroplethLayerFactory: LayerFactory = {
  id: 'choropleth-layer',
  create: (ctx: LayerContext) => {
    const choropleth = ctx.choropleth ?? ctx.drillState?.choropleth;
    if (!choropleth) return null;

    const key = scopeKeyOf(choropleth);
    // Tryb testowy (?e2e) pomija przenikanie, żeby stan warstw był deterministyczny;
    // ekran dotykowy rysuje jedną warstwę (bezpieczny render na telefonach).
    const reducedMotion = matches('(prefers-reduced-motion: reduce)');
    const coarsePointer = matches('(pointer: coarse)');
    const enabled = crossfadeEnabled({
      reducedMotion,
      coarsePointer,
      testMode: typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('e2e'),
    });
    if (fade.key !== null && fade.key !== key && shown) outgoing = shown;
    const frame = stepCrossfade(fade, key, choropleth.reveal?.progress ?? 1, !enabled, FADE_SPEEDUP);
    fade = frame.next;
    shown = choropleth;
    if (!frame.showOutgoing) outgoing = null;

    const specs = crossfadeLayers('choropleth-layer', frame, outgoing !== null);
    const layers = specs.map((spec) =>
      buildChoroplethLayer(ctx, spec.role === 'outgoing' && outgoing ? outgoing : choropleth, {
        id: spec.id,
        opacity: spec.opacity,
        pickable: spec.pickable,
        animate: !reducedMotion && !coarsePointer,
      })
    );
    return layers.length === 1 ? layers[0] : layers;
  },
};

// Obrys wybranej jednostki mieszka we własnym pliku; re-eksport zachowuje dotychczasowe importy.
export { selectedOutlineLayerFactory } from './selected-outline';
