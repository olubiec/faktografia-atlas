import { GeoJsonLayer } from '@deck.gl/layers';
import { feature, merge } from 'topojson-client';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import type { DrillState } from '@/core/map/drill';
import tokensJson from '../../../../config/tokens.json';

export type MapColors = {
  kalka: [number, number, number, number];
  arkusz: [number, number, number, number];
  tusz: [number, number, number, number];
};

export type LayerContext = {
  topoData: any;
  colors: MapColors;
  drillState?: DrillState;
  onSelectUnit?: (teryt: string) => void;
};

export type LayerFactory = {
  id: string;
  create: (ctx: LayerContext) => GeoJsonLayer | null;
};

/**
 * Parsuje kolor CSS (hex #RRGGBB lub rgb/rgba) do tablicy [r, g, b, a].
 * Zwraca null, jeśli format jest nieznany/pusty.
 */
export function parseCssColor(cssValue: string, defaultAlpha = 255): [number, number, number, number] | null {
  const trimmed = cssValue.trim();
  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return [r, g, b, defaultAlpha];
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return [r, g, b, defaultAlpha];
    }
  }

  const rgbaMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10);
    const g = parseInt(rgbaMatch[2], 10);
    const b = parseInt(rgbaMatch[3], 10);
    const a = rgbaMatch[4] !== undefined ? Math.round(parseFloat(rgbaMatch[4]) * 255) : defaultAlpha;
    return [r, g, b, a];
  }

  return null;
}

/**
 * Odczytuje kolory z aktualnych zmiennych CSS lub tokenów.
 */
export function getMapColorsFromCss(): MapColors | null {
  const style = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null;
  const kalkaStr = style?.getPropertyValue('--kalka')?.trim() || tokensJson.color.light.kalka;
  const arkuszStr = style?.getPropertyValue('--arkusz')?.trim() || tokensJson.color.light.arkusz;
  const tuszStr = style?.getPropertyValue('--tusz')?.trim() || tokensJson.color.light.tusz;

  const kalka = parseCssColor(kalkaStr, 255);
  const arkusz = parseCssColor(arkuszStr, 255);
  const tusz = parseCssColor(tuszStr, 255);

  if (!kalka || !arkusz || !tusz) {
    return null;
  }

  return { kalka, arkusz, tusz };
}

let cachedFeatures: {
  wojFeatures: FeatureCollection;
  powFeatures: FeatureCollection;
  gmiFeatures: FeatureCollection;
  countryFeature: FeatureCollection;
} | null = null;

/**
 * Konwertuje dane TopoJSON do cech GeoJSON dla województw, powiatów, gmin i konturu kraju.
 */
export function loadGeoData(topoData: any): {
  wojFeatures: FeatureCollection;
  powFeatures: FeatureCollection;
  gmiFeatures: FeatureCollection;
  countryFeature: FeatureCollection;
} {
  if (cachedFeatures) {
    return cachedFeatures;
  }

  const wojObj = topoData.objects.woj;
  const powObj = topoData.objects.pow;
  const gmiObj = topoData.objects.gmi;

  const wojFeatures = feature(topoData, wojObj) as unknown as FeatureCollection;
  const powFeatures = feature(topoData, powObj) as unknown as FeatureCollection;
  const gmiFeatures = feature(topoData, gmiObj) as unknown as FeatureCollection;

  const mergedGeometry = merge(
    topoData,
    topoData.objects.woj.geometries
  );

  const countryFeature: FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'Polska' },
        geometry: mergedGeometry as Geometry,
      } as Feature,
    ],
  };

  cachedFeatures = { wojFeatures, powFeatures, gmiFeatures, countryFeature };
  return cachedFeatures;
}

export const wojLayerFactory: LayerFactory = {
  id: 'woj-layer',
  create: ({ topoData, colors, onSelectUnit }) => {
    const { wojFeatures } = loadGeoData(topoData);
    return new GeoJsonLayer({
      id: 'woj-layer',
      data: wojFeatures,
      filled: true,
      stroked: true,
      getFillColor: colors.arkusz,
      getLineColor: colors.kalka,
      getLineWidth: 1.2,
      lineWidthUnits: 'pixels',
      lineWidthMinPixels: 1,
      pickable: true,
      onClick: (info) => {
        if (info.object?.properties?.teryt && onSelectUnit) {
          onSelectUnit(info.object.properties.teryt);
        }
      },
      getTooltip: ({ object }: any) => (object?.properties?.name ? String(object.properties.name) : null),
      updateTriggers: {
        getFillColor: [colors.arkusz],
        getLineColor: [colors.kalka],
      },
    });
  },
};

export const powLayerFactory: LayerFactory = {
  id: 'pow-layer',
  create: ({ topoData, colors, drillState, onSelectUnit }) => {
    const layerIds = drillState?.layerIds ?? ['woj-layer', 'country-layer'];
    const activeWojTeryt = drillState?.activeWojTeryt ?? null;

    if (!layerIds.includes('pow-layer') || !activeWojTeryt) {
      return null;
    }

    const { powFeatures } = loadGeoData(topoData);
    const filteredPowFeatures: FeatureCollection = {
      type: 'FeatureCollection',
      features: powFeatures.features.filter((f) =>
        f.properties?.teryt?.startsWith(activeWojTeryt)
      ),
    };

    return new GeoJsonLayer({
      id: 'pow-layer',
      data: filteredPowFeatures,
      filled: true,
      stroked: true,
      getFillColor: colors.arkusz,
      getLineColor: colors.kalka,
      getLineWidth: 1.2,
      lineWidthUnits: 'pixels',
      lineWidthMinPixels: 1,
      pickable: true,
      onClick: (info) => {
        if (info.object?.properties?.teryt && onSelectUnit) {
          onSelectUnit(info.object.properties.teryt);
        }
      },
      getTooltip: ({ object }: any) => (object?.properties?.name ? String(object.properties.name) : null),
      updateTriggers: {
        getFillColor: [colors.arkusz],
        getLineColor: [colors.kalka],
      },
    });
  },
};

export const gmiLayerFactory: LayerFactory = {
  id: 'gmi-layer',
  create: ({ topoData, colors, drillState, onSelectUnit }) => {
    const layerIds = drillState?.layerIds ?? ['woj-layer', 'country-layer'];
    const activePowTeryt = drillState?.activePowTeryt ?? null;

    if (!layerIds.includes('gmi-layer') || !activePowTeryt) {
      return null;
    }

    const { gmiFeatures } = loadGeoData(topoData);
    const filteredGmiFeatures: FeatureCollection = {
      type: 'FeatureCollection',
      features: gmiFeatures.features.filter((f) =>
        f.properties?.teryt?.startsWith(activePowTeryt)
      ),
    };

    return new GeoJsonLayer({
      id: 'gmi-layer',
      data: filteredGmiFeatures,
      filled: true,
      stroked: true,
      getFillColor: colors.arkusz,
      getLineColor: colors.kalka,
      getLineWidth: 1.2,
      lineWidthUnits: 'pixels',
      lineWidthMinPixels: 1,
      pickable: true,
      onClick: (info) => {
        if (info.object?.properties?.teryt && onSelectUnit) {
          onSelectUnit(info.object.properties.teryt);
        }
      },
      getTooltip: ({ object }: any) => (object?.properties?.name ? String(object.properties.name) : null),
      updateTriggers: {
        getFillColor: [colors.arkusz],
        getLineColor: [colors.kalka],
      },
    });
  },
};

export const countryLayerFactory: LayerFactory = {
  id: 'country-layer',
  create: ({ topoData, colors }) => {
    const { countryFeature } = loadGeoData(topoData);
    return new GeoJsonLayer({
      id: 'country-layer',
      data: countryFeature,
      filled: false,
      stroked: true,
      getLineColor: colors.tusz,
      getLineWidth: 1.5,
      lineWidthUnits: 'pixels',
      lineWidthMinPixels: 1.5,
      pickable: false,
      updateTriggers: {
        getLineColor: [colors.tusz],
      },
    });
  },
};

export const adminLayerFactories: LayerFactory[] = [
  wojLayerFactory,
  powLayerFactory,
  gmiLayerFactory,
  countryLayerFactory,
];
