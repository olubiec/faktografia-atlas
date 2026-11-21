// Granice mapy poszerzone o okno widoku przy minimalnym zoomie (wydzielone z useMapViewState).
import type { MapLimits } from './view';

type Bbox = [number, number, number, number];

const mercatorLat = (latDeg: number): number => Math.log(Math.tan(Math.PI / 4 + (latDeg * Math.PI) / 360));
const mercatorLatToDeg = (m: number): number => (360 / Math.PI) * Math.atan(Math.exp(m)) - 90;

/**
 * MapLibre nie pozwala oddalić się dalej, niż mieści maxBounds. Na wysokim ekranie (telefon)
 * to uniemożliwiałoby dojście do minZoom, więc maxBounds obejmuje też okno widoku przy minZoom.
 */
export function widenToViewport(l: MapLimits, b: Bbox, { width, height }: { width: number; height: number }): MapLimits {
  if (width <= 0 || height <= 0) return l;
  const worldPx = 512 * Math.pow(2, l.minZoom);
  const halfLon = (width / 2 / worldPx) * 360;
  const halfMerc = (height / 2 / worldPx) * 2 * Math.PI;
  const cLon = (b[0] + b[2]) / 2;
  const cMerc = (mercatorLat(b[1]) + mercatorLat(b[3])) / 2;
  const [w, s, e, n] = l.maxBounds;
  return {
    ...l,
    maxBounds: [
      Math.min(w, cLon - halfLon),
      Math.min(s, mercatorLatToDeg(cMerc - halfMerc)),
      Math.max(e, cLon + halfLon),
      Math.max(n, mercatorLatToDeg(cMerc + halfMerc)),
    ],
  };
}
