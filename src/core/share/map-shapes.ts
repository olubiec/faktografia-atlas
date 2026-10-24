import type { Feature, FeatureCollection, Geometry } from 'geojson';
import {
  fitProjection,
  type BoundingBox,
  type Padding,
  type ProjectionFn,
  type TargetBox,
} from './projection';

export type MapShapesOptions = {
  box: TargetBox;
  padding?: Padding;
  classOf?:
    | ((teryt: string) => 0 | 1 | 2 | 3 | 4 | 'noData')
    | Record<string, 0 | 1 | 2 | 3 | 4 | 'noData' | undefined>;
  selected?: string | string[] | ((teryt: string) => boolean);
};

export type MapShape = {
  teryt: string;
  d: string;
  fill: 0 | 1 | 2 | 3 | 4 | 'noData';
  selected: boolean;
};

export type MapShapesResult = {
  shapes: MapShape[];
  outline: string;
};

function round1(v: number): string {
  if (Number.isNaN(v)) return '0';
  const rounded = Math.round(v * 10) / 10;
  return rounded.toString();
}

function scanCoords(coords: unknown, bbox: [number, number, number, number]): void {
  if (!Array.isArray(coords) || coords.length === 0) return;
  if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    const lon = coords[0];
    const lat = coords[1];
    if (!Number.isNaN(lon) && !Number.isNaN(lat)) {
      if (lon < bbox[0]) bbox[0] = lon;
      if (lat < bbox[1]) bbox[1] = lat;
      if (lon > bbox[2]) bbox[2] = lon;
      if (lat > bbox[3]) bbox[3] = lat;
    }
  } else {
    for (const c of coords) {
      scanCoords(c, bbox);
    }
  }
}

function collectGeometryCoords(geometry: Geometry | null | undefined, bbox: [number, number, number, number]): void {
  if (!geometry) return;
  if (geometry.type === 'GeometryCollection') {
    for (const g of geometry.geometries) {
      collectGeometryCoords(g, bbox);
    }
  } else {
    scanCoords(geometry.coordinates, bbox);
  }
}

function computeBbox(features: Feature[]): BoundingBox {
  const bbox: [number, number, number, number] = [
    Infinity,
    Infinity,
    -Infinity,
    -Infinity,
  ];

  for (const feature of features) {
    collectGeometryCoords(feature.geometry, bbox);
  }

  if (
    bbox[0] === Infinity ||
    bbox[1] === Infinity ||
    bbox[2] === -Infinity ||
    bbox[3] === -Infinity
  ) {
    return [0, 0, 0, 0];
  }

  return bbox;
}

function formatRing(ring: number[][], project: ProjectionFn): string {
  if (!ring || ring.length === 0) return '';
  const pts = ring.map((pt) => project([pt[0], pt[1]]));
  const formatted = pts.map(([x, y]) => `${round1(x)},${round1(y)}`);
  return `M${formatted.join('L')}Z`;
}

function geometryToPath(geometry: Geometry | null | undefined, project: ProjectionFn): string {
  if (!geometry) return '';
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map((ring) => formatRing(ring, project)).join(' ');
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates
      .map((poly) => poly.map((ring) => formatRing(ring, project)).join(' '))
      .join(' ');
  }
  if (geometry.type === 'GeometryCollection') {
    return geometry.geometries.map((g) => geometryToPath(g, project)).join(' ');
  }
  return '';
}

function extractFeatures(
  input: Feature[] | FeatureCollection | { features: Feature[] } | unknown
): Feature[] {
  if (Array.isArray(input)) return input as Feature[];
  if (input && typeof input === 'object' && 'features' in input && Array.isArray(input.features)) {
    return input.features as Feature[];
  }
  return [];
}

/**
 * Transforms geographic features into SVG path shapes and an outline path, fitted to box.
 */
export function mapShapes(
  featuresInput: Feature[] | FeatureCollection | unknown,
  options: MapShapesOptions
): MapShapesResult {
  const features = extractFeatures(featuresInput);
  const bbox = computeBbox(features);
  const project = fitProjection(bbox, options.box, options.padding);

  const shapes: MapShape[] = features.map((feature) => {
    const teryt = String(feature.properties?.teryt ?? '');
    const d = geometryToPath(feature.geometry, project);

    let fill: 0 | 1 | 2 | 3 | 4 | 'noData' = 'noData';
    if (options.classOf) {
      const clsVal =
        typeof options.classOf === 'function'
          ? options.classOf(teryt)
          : options.classOf[teryt];
      if (clsVal === 0 || clsVal === 1 || clsVal === 2 || clsVal === 3 || clsVal === 4) {
        fill = clsVal;
      }
    }

    let selected = false;
    if (options.selected !== undefined) {
      if (typeof options.selected === 'function') {
        selected = Boolean(options.selected(teryt));
      } else if (Array.isArray(options.selected)) {
        selected = options.selected.includes(teryt);
      } else if (typeof options.selected === 'string') {
        selected = teryt === options.selected;
      }
    }

    return {
      teryt,
      d,
      fill,
      selected,
    };
  });

  const outline = shapes
    .map((s) => s.d)
    .filter(Boolean)
    .join(' ');

  return {
    shapes,
    outline,
  };
}
