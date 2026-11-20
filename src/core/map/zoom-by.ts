import type { ViewState } from './view';

/** Krok klawiszy `+` / `-` (poziomy zoomu); przyciski na ekranie robią krok 1. */
export const KEY_ZOOM_STEP = 0.5;

/**
 * Cel zmiany zoomu o `delta`: ten sam środek, zoom obcięty do granic mapy.
 * Zwraca null, gdy zoom już jest na granicy (nic do zrobienia).
 */
export function zoomByTarget(
  view: ViewState,
  delta: number,
  limits: { minZoom: number; maxZoom: number }
): ViewState | null {
  const zoom = Math.min(limits.maxZoom, Math.max(limits.minZoom, view.zoom + delta));
  if (Math.abs(zoom - view.zoom) < 1e-9) return null;
  return { ...view, zoom };
}

/** Zmiana zoomu dla klawisza (+ / = / -); inne klawisze → null. */
export function keyZoomDelta(key: string): number | null {
  if (key === '+' || key === '=') return KEY_ZOOM_STEP;
  if (key === '-') return -KEY_ZOOM_STEP;
  return null;
}
