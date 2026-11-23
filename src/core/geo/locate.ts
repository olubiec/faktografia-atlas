// „Użyj mojej lokalizacji” (W26-F05, KONCEPT-ODKRYCIA §5): gmina dla punktu z przeglądarki.
// Liczone wyłącznie na urządzeniu – współrzędne nie wychodzą z telefonu. Granice z public/geo/admin.topo.json.
// Sprawdzamy, w którym wielokącie leży punkt (point-in-polygon), a nie, czyj środek jest najbliżej:
// przy granicy gmin najbliższy środek często należy do sąsiada.
import { feature } from 'topojson-client';
import type { Feature, MultiPolygon, Polygon, Position } from 'geojson';

/** Topologia TopoJSON (typ z topojson-client). */
export type Topology = Parameters<typeof feature>[0];

/** Punkt [długość, szerokość] w stopniach (WGS84) – jak w GeoJSON. */
export type LonLat = readonly [number, number];

export interface LocatedUnit {
  /** TERYT jako tekst. */
  teryt: string;
  name: string;
}

type Level = 'woj' | 'pow' | 'gmi';
type Props = { teryt?: string; name?: string };
type Shape = { unit: LocatedUnit; bbox: [number, number, number, number]; polygons: Position[][][] };

/** Czy punkt leży wewnątrz pierścienia (promień w prawo, liczba przecięć nieparzysta). */
function inRing(x: number, y: number, ring: readonly Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i] as [number, number];
    const [xj, yj] = ring[j] as [number, number];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Wielokąt z dziurami: punkt w obrysie zewnętrznym i poza każdą dziurą (np. gmina wiejska wokół miasta). */
export function inPolygon(point: LonLat, rings: readonly (readonly Position[])[]): boolean {
  const [x, y] = point;
  if (!rings[0] || !inRing(x, y, rings[0])) return false;
  return rings.slice(1).every((hole) => !inRing(x, y, hole));
}

function bboxOf(polygons: Position[][][]): [number, number, number, number] {
  const box: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const poly of polygons) {
    for (const [x, y] of poly[0] ?? []) {
      box[0] = Math.min(box[0], x!);
      box[1] = Math.min(box[1], y!);
      box[2] = Math.max(box[2], x!);
      box[3] = Math.max(box[3], y!);
    }
  }
  return box;
}

/** Kształty jednostek poziomu (raz na topologię – przy kolejnym kliknięciu bez ponownego dekodowania). */
const cache = new WeakMap<object, Map<Level, Shape[]>>();

export function shapesOf(topology: Topology, level: Level = 'gmi'): Shape[] {
  const byLevel = cache.get(topology) ?? new Map<Level, Shape[]>();
  cache.set(topology, byLevel);
  const hit = byLevel.get(level);
  if (hit) return hit;
  const object = topology.objects[level];
  if (!object) return [];
  const fc = feature(topology, object as Parameters<typeof feature>[1]) as unknown as { features: Feature<Polygon | MultiPolygon, Props>[] };
  const shapes: Shape[] = [];
  for (const f of fc.features) {
    const teryt = f.properties?.teryt;
    if (!f.geometry || typeof teryt !== 'string') continue;
    const polygons = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    shapes.push({ unit: { teryt, name: f.properties?.name ?? teryt }, bbox: bboxOf(polygons), polygons });
  }
  byLevel.set(level, shapes);
  return shapes;
}

/** Jednostka (domyślnie gmina), w której granicach leży punkt; poza Polską – null. */
export function locateUnit(topology: Topology, point: LonLat, level: Level = 'gmi'): LocatedUnit | null {
  const [x, y] = point;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  for (const s of shapesOf(topology, level)) {
    if (x < s.bbox[0] || x > s.bbox[2] || y < s.bbox[1] || y > s.bbox[3]) continue;
    if (s.polygons.some((rings) => inPolygon(point, rings))) return s.unit;
  }
  return null;
}
