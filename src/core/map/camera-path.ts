import { FlyToInterpolator } from '@deck.gl/core';
import tokens from '../../../config/tokens.json';
import type { CameraKind, CameraView } from './camera';

/**
 * Tor lotu kamery: gotowy algorytm „smooth zoom and pan” (van Wijk i Nuij), ten sam co
 * w MapLibre `flyTo` i deck.gl `FlyToInterpolator`. Zamiast liniowo zmieniać środek i zoom
 * (cel „ucieka” z ekranu w połowie ruchu), kamera najpierw lekko się oddala, potem dojeżdża.
 */
const interpolator = new FlyToInterpolator({ speed: 1.2, curve: 1.414 });

export type CameraSize = { width: number; height: number };

/** Stan kamery w chwili `t` (0–1, już po krzywej przyspieszenia). */
export function flyView(from: CameraView, to: CameraView, t: number, size: CameraSize): CameraView {
  if (t <= 0) return { ...from };
  if (t >= 1) return { ...to };
  const a = { ...from, ...size };
  const b = { ...to, ...size };
  const v = interpolator.interpolateProps(a, b, t) as CameraView;
  if (![v.longitude, v.latitude, v.zoom].every(Number.isFinite)) {
    // Zabezpieczenie przed NaN (np. zerowy rozmiar kontenera): zwykłe liniowe przejście.
    return {
      longitude: from.longitude + (to.longitude - from.longitude) * t,
      latitude: from.latitude + (to.latitude - from.latitude) * t,
      zoom: from.zoom + (to.zoom - from.zoom) * t,
    };
  }
  return { longitude: v.longitude, latitude: v.latitude, zoom: v.zoom };
}

/**
 * Czas lotu: dobrany do odległości (algorytm), ale w widełkach z tokenów, żeby ruch był
 * powolny i czytelny, a nie błyskawiczny. Powrót jest nieco szybszy niż wejście.
 */
export function flyDuration(from: CameraView, to: CameraView, kind: CameraKind, size: CameraSize): number {
  if (kind === 'instant') return 0;
  const auto = interpolator.getDuration(
    { ...from, ...size },
    { ...to, ...size, transitionDuration: 'auto' } as never
  );
  const { cameraFlyMin, cameraFlyMax } = tokens.motion;
  const scale = kind === 'out' ? 0.8 : 1;
  const raw = Number.isFinite(auto) ? (auto as number) * scale : cameraFlyMin;
  return Math.round(Math.min(cameraFlyMax, Math.max(cameraFlyMin * scale, raw)));
}
