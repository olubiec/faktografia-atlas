import tokens from "../../../config/tokens.json";
import type { ViewState } from "./view";

/** Ile ms dokładamy za każdy punkt „trudności” przejścia (Δzoom + log2 dystansu). */
const MS_PER_SCORE_POINT = 130;
/** Górna klamra czasu = ten mnożnik × czas wejścia z tokenów (600 ms → 900 ms). */
const MAX_DURATION_FACTOR = 1.5;
/** Szerokość świata w pikselach przy zoomie 0 (kafle 512 px w MapLibre). */
const WORLD_PX_AT_ZOOM_0 = 512;

export type CameraPlan = { from: ViewState; to: ViewState; durationMs: number };

/** Łagodny start i lądowanie: prędkość 0 na początku i końcu. */
export function easeInOutCubic(t: number): number {
  const x = safeUnit(t);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

/** NaN, wartości ujemne → 0; powyżej 1 → 1. */
function safeUnit(t: number): number {
  if (!Number.isFinite(t) || t <= 0) return t === Infinity ? 1 : 0;
  return t >= 1 ? 1 : t;
}

/** Szerokość geograficzna → współrzędna Mercatora (w stopniach). */
function mercatorY(lat: number): number {
  const rad = (lat * Math.PI) / 180;
  return (Math.log(Math.tan(Math.PI / 4 + rad / 2)) * 180) / Math.PI;
}

function inverseMercatorY(y: number): number {
  const rad = (y * Math.PI) / 180;
  return ((2 * Math.atan(Math.exp(rad)) - Math.PI / 2) * 180) / Math.PI;
}

/**
 * Czas przejścia: 400 ms (token cameraOut) + 130 ms za każdy punkt
 * `|Δzoom| + log2(1 + dystans w szerokościach ekranu)`, w klamrze 400…900 ms.
 * Przy `prefers-reduced-motion` 0.
 */
export function planDuration(
  from: ViewState,
  to: ViewState,
  viewportWidthPx: number,
  reducedMotion = false,
): number {
  if (reducedMotion) return 0;
  const min = tokens.motion.cameraOut;
  const max = MAX_DURATION_FACTOR * tokens.motion.cameraIn;
  const dx = (to.longitude - from.longitude) / 360;
  const dy = (mercatorY(to.latitude) - mercatorY(from.latitude)) / 360;
  // Dystans mierzony w pikselach przy mniejszym zoomie (szersze ujęcie).
  const worldPx = WORLD_PX_AT_ZOOM_0 * 2 ** Math.min(from.zoom, to.zoom);
  const width = viewportWidthPx > 0 ? viewportWidthPx : 1;
  const screens = (Math.hypot(dx, dy) * worldPx) / width;
  const score = Math.abs(to.zoom - from.zoom) + Math.log2(1 + screens);
  const ms = min + MS_PER_SCORE_POINT * score;
  return Math.min(max, Math.max(min, Number.isFinite(ms) ? ms : min));
}

/** Przesunięcie środka poniżej tylu pikseli ekranu = praktycznie ten sam widok. */
export const SAME_VIEW_PX = 0.5;
/** Różnica zoomu poniżej tej wartości nie liczy się jako zmiana skali. */
const SAME_VIEW_ZOOM = 0.05;

/** Czy ruch między widokami jest pomijalny (zoom i środek prawie bez zmian)? */
export function isSameView(from: ViewState, to: ViewState): boolean {
  if (Math.abs(to.zoom - from.zoom) >= SAME_VIEW_ZOOM) return false;
  const degPerPx = 360 / (WORLD_PX_AT_ZOOM_0 * 2 ** from.zoom);
  const dx = to.longitude - from.longitude;
  const dy = mercatorY(to.latitude) - mercatorY(from.latitude);
  return Math.hypot(dx, dy) / degPerPx < SAME_VIEW_PX;
}

export function planCamera(
  from: ViewState,
  to: ViewState,
  opts: { viewportWidthPx: number; reducedMotion: boolean },
): CameraPlan {
  return {
    from,
    to,
    durationMs: planDuration(
      from,
      to,
      opts.viewportWidthPx,
      opts.reducedMotion,
    ),
  };
}

/** Waga przesunięcia środka (van Wijk): stała prędkość na ekranie podczas zoomu. */
function centerWeight(z0: number, z1: number, z: number, s: number): number {
  if (z0 === z1) return s;
  const a = 2 ** -z0;
  return (2 ** -z - a) / (2 ** -z1 - a);
}

/** Widok kamery po `elapsedMs` od startu planu (czas ujemny/NaN = 0). */
export function sampleCamera(plan: CameraPlan, elapsedMs: number): ViewState {
  const { from, to, durationMs } = plan;
  const elapsed = Number.isFinite(elapsedMs) && elapsedMs > 0 ? elapsedMs : 0;
  if (durationMs <= 0 || elapsed >= durationMs) return to;
  if (elapsed === 0) return from;

  const s = easeInOutCubic(elapsed / durationMs);
  const zoom = from.zoom + (to.zoom - from.zoom) * s;
  const u = centerWeight(from.zoom, to.zoom, zoom, s);
  const y0 = mercatorY(from.latitude);
  return {
    longitude: from.longitude + (to.longitude - from.longitude) * u,
    latitude: inverseMercatorY(y0 + (mercatorY(to.latitude) - y0) * u),
    zoom,
  };
}
