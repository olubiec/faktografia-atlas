// Tempo przybliżania kółkiem: stałe przekazywane do natywnego scrollZoom MapLibre.

/** Tempo dla zdarzeń typu „kółko myszy” (MapLibre: setWheelZoomRate). */
export const WHEEL_ZOOM_RATE = 1 / 250;
/** Tempo dla zdarzeń typu „touchpad” (MapLibre: setZoomRate). */
export const TRACKPAD_ZOOM_RATE = 1 / 100;
/** Maksymalna zmiana zoomu na jedno zdarzenie. */
export const MAX_ZOOM_STEP = 0.6;
/** Ile pikseli odpowiada jednej linii (deltaMode = 1). */
export const LINE_HEIGHT_PX = 16;

/** Zmiana zoomu (w górę dla deltaY < 0) dla jednego zdarzenia kółka. */
export function wheelZoomDelta(deltaY: number, deltaMode: number): number {
  const px = deltaMode === 1 ? deltaY * LINE_HEIGHT_PX : deltaY;
  const raw = -px * WHEEL_ZOOM_RATE;
  return Math.max(-MAX_ZOOM_STEP, Math.min(MAX_ZOOM_STEP, raw)) || 0;
}
