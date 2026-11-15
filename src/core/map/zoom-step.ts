/** Krok przybliżenia mapy z klawiatury. */
export const ZOOM_STEP = 0.5;

export type ZoomLimits = { minZoom: number; maxZoom: number };

/** Następny poziom zoomu po kroku w górę (1) lub w dół (-1), przycięty do limitów. */
export function nextZoom(zoom: number, delta: 1 | -1, limits: ZoomLimits, step: number = ZOOM_STEP): number {
  return Math.min(limits.maxZoom, Math.max(limits.minZoom, zoom + delta * step));
}
