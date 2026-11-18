import { initialViewState, type ViewState } from './view';

type Bbox = [number, number, number, number];

// Margines (px) wokół dopasowanego obszaru, żeby mapa nie dotykała krawędzi okna (łącznie z obu stron).
export const FIT_PADDING = 48;
// Wysokość (px) paska „Polska” z okruszkami nad mapą (top-4 + wysokość pola); obszar pod nim jest zasłonięty.
export const TOP_OVERLAY_PX = 64;

const mercatorLat = (latDeg: number): number => Math.log(Math.tan(Math.PI / 4 + (latDeg * Math.PI) / 360));
const mercatorLatToDeg = (m: number): number => (360 / Math.PI) * Math.atan(Math.exp(m)) - 90;

/**
 * Widok, w którym `bounds` mieści się w widocznej części kontenera width x height:
 * po odjęciu marginesu, paska u góry (`top`) i zasłony u dołu (`bottom`, np. arkusz profilu).
 * Zoom wynika z rozmiaru kontenera; środek kamery jest przesunięty tak, by obszar wypadł
 * w środku widocznego pasa.
 */
export function fitViewState(
  bounds: Bbox,
  width: number,
  height: number,
  { top = 0, bottom = 0 }: { top?: number; bottom?: number } = {}
): ViewState {
  const availW = Math.max(1, width - FIT_PADDING);
  const availH = Math.max(1, height - FIT_PADDING - top - bottom);
  const base = initialViewState(bounds, availW, availH);
  // Środek obszaru ma wypaść (top - bottom) / 2 px poniżej środka ekranu, więc kamera jest o tyle na północ.
  const shiftPx = (top - bottom) / 2;
  const mShift = (shiftPx * 2 * Math.PI) / (512 * Math.pow(2, base.zoom));
  return { longitude: base.longitude, latitude: mercatorLatToDeg(mercatorLat(base.latitude) + mShift), zoom: base.zoom };
}
