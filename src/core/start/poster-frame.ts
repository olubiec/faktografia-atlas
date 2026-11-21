// Plakat na `/` ma leżeć dokładnie tam, gdzie mapa narysuje Polskę w pierwszym kadrze.
// Liczymy to tym samym `fitViewState` co mapa (useMapViewState), więc nie ma przeskoku przy podmianie.
import { fitViewState, TOP_OVERLAY_PX } from '@/core/map/fit';

export type Bbox = [number, number, number, number];
export type Rect = { left: number; top: number; width: number; height: number };

const mercatorY = (latDeg: number): number => Math.log(Math.tan(Math.PI / 4 + (latDeg * Math.PI) / 360));

/** Prostokąt (px, względem okna) zajmowany przez `bbox` [zachód, południe, wschód, północ] w kadrze mapy. */
export function posterRect(bbox: Bbox, width: number, height: number): Rect {
  const [west, south, east, north] = bbox;
  const view = fitViewState(bbox, width, height, { top: TOP_OVERLAY_PX });
  const world = 512 * 2 ** view.zoom;
  const x = (lon: number) => width / 2 + ((lon - view.longitude) / 360) * world;
  const y = (lat: number) => height / 2 - ((mercatorY(lat) - mercatorY(view.latitude)) / (2 * Math.PI)) * world;
  const left = x(west);
  const top = y(north);
  return { left, top, width: x(east) - left, height: y(south) - top };
}
