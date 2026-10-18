import { GeoJsonLayer } from '@deck.gl/layers';
import { feature, merge } from 'topojson-client';
import type { FeatureCollection, Feature, Geometry } from 'geojson';

export type MapColors = {
  kalka: [number, number, number, number];
  arkusz: [number, number, number, number];
  tusz: [number, number, number, number];
};

/**
 * Parsuje kolor CSS (hex #RRGGBB lub rgb/rgba) do tablicy [r, g, b, a].
 */
export function parseCssColor(cssValue: string, defaultAlpha = 255): [number, number, number, number] {
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

  // W przypadku nieznanego formatu zwracamy domyślny granat tusz
  return [21, 35, 63, defaultAlpha];
}

/**
 * Odczytuje kolory z aktualnych zmiennych CSS.
 */
export function getMapColorsFromCss(): MapColors {
  const style = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null;
  const kalkaStr = style?.getPropertyValue('--kalka') || '#EEF1EF';
  const arkuszStr = style?.getPropertyValue('--arkusz') || '#F8FAF9';
  const tuszStr = style?.getPropertyValue('--tusz') || '#15233F';

  return {
    kalka: parseCssColor(kalkaStr, 255),
    arkusz: parseCssColor(arkuszStr, 255),
    tusz: parseCssColor(tuszStr, 255),
  };
}

let cachedFeatures: {
  wojFeatures: FeatureCollection;
  countryFeature: FeatureCollection;
} | null = null;

/**
 * Konwertuje dane TopoJSON do cech GeoJSON dla województw i połączonego konturu kraju.
 */
export function loadGeoData(topoData: any): {
  wojFeatures: FeatureCollection;
  countryFeature: FeatureCollection;
} {
  if (cachedFeatures) {
    return cachedFeatures;
  }

  const wojObj = topoData.objects.woj;
  const wojFeatures = feature(topoData, wojObj) as unknown as FeatureCollection;

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

  cachedFeatures = { wojFeatures, countryFeature };
  return cachedFeatures;
}

/**
 * Tworzy warstwy deck.gl dla województw i konturu kraju.
 */
export function createMapLayers(
  topoData: any,
  colors: MapColors
): [GeoJsonLayer, GeoJsonLayer] {
  const { wojFeatures, countryFeature } = loadGeoData(topoData);

  const wojLayer = new GeoJsonLayer({
    id: 'woj-layer',
    data: wojFeatures,
    filled: true,
    stroked: true,
    getFillColor: colors.arkusz,
    getLineColor: colors.kalka,
    getLineWidth: 1.2,
    lineWidthUnits: 'pixels',
    lineWidthMinPixels: 1,
    pickable: false,
    updateTriggers: {
      getFillColor: [colors.arkusz],
      getLineColor: [colors.kalka],
    },
  });

  const countryLayer = new GeoJsonLayer({
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

  return [wojLayer, countryLayer];
}
