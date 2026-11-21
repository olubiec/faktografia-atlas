// Kadr wejścia: kamera mapy ustawiona tak, żeby Polska leżała dokładnie tam, gdzie plakat ze strony `/`.
// Potem kamera płynnie dojeżdża do zwykłego widoku mapy (useMapViewState), więc nie ma przeskoku.
import type { Bbox, Rect } from '@/core/start/poster-frame';
import type { ViewState } from './view';

const merc = (latDeg: number): number => Math.log(Math.tan(Math.PI / 4 + (latDeg * Math.PI) / 360));
const unmerc = (m: number): number => (360 / Math.PI) * Math.atan(Math.exp(m)) - 90;

/**
 * Kamera, przy której `bbox` zajmuje `poster` (px względem okna), gdy kontener mapy to `container` (px względem okna).
 */
export function entryViewState(bbox: Bbox, poster: Rect, container: Rect): ViewState {
  const [west, , east, north] = bbox;
  const world = (poster.width * 360) / (east - west); // szerokość świata w px
  const left = poster.left - container.left;
  const top = poster.top - container.top;
  const longitude = west + ((container.width / 2 - left) / world) * 360;
  const mercCenter = merc(north) - ((container.height / 2 - top) * 2 * Math.PI) / world;
  return { longitude, latitude: unmerc(mercCenter), zoom: Math.log2(world / 512) };
}

/** Prostokąt `bbox` w pikselach kontenera dla danej kamery (odwrotność `entryViewState`, do testów). */
export function projectBbox(bbox: Bbox, view: ViewState, container: Rect): Rect {
  const [west, south, east, north] = bbox;
  const world = 512 * 2 ** view.zoom;
  const x = (lon: number) => container.width / 2 + ((lon - view.longitude) / 360) * world;
  const y = (lat: number) => container.height / 2 - ((merc(lat) - merc(view.latitude)) / (2 * Math.PI)) * world;
  const left = x(west);
  const top = y(north);
  return { left, top, width: x(east) - left, height: y(south) - top };
}
