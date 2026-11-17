import type { UnitLevel } from '../units/types';

/** Zoom, od którego mapa pokazuje dany poziom (poniżej `pow` – województwa). */
export const ZOOM_THRESHOLDS = { pow: 6.3, gmi: 8.0 } as const;

/** Margines wokół progu: przełączenie dopiero po wyraźnym przekroczeniu, żeby warstwy nie migały. */
export const ZOOM_HYSTERESIS = 0.3;

/** Zdarzenie na window po zakończeniu ruchu mapy wywołanego gestem użytkownika (detail: { zoom }). */
export const ZOOM_END_EVENT = 'atlas:zoomend';

/** Opóźnienie (ms) po ostatniej zmianie widoku z gestu, po którym ruch uznajemy za zakończony. */
export const ZOOM_END_DELAY_MS = 200;

const ORDER: UnitLevel[] = ['woj', 'pow', 'gmi'];
const BOUNDARIES = [ZOOM_THRESHOLDS.pow, ZOOM_THRESHOLDS.gmi];

/**
 * Poziom mapy dla zoomu po geście użytkownika (przybliżanie schodzi głębiej, oddalanie wraca wyżej).
 * Histereza: próg przekraczany w głąb wymaga zoomu ≥ próg + margines, a w górę – zoomu < próg − margines.
 * Wynik to poziom z `allowed` najbliższy wyliczonemu (np. wskaźnik tylko gminny zostaje na `gmi`).
 */
export function levelForZoom(zoom: number, current: UnitLevel, allowed: readonly UnitLevel[]): UnitLevel {
  const currentDepth = ORDER.indexOf(current);
  let depth = 0;
  BOUNDARIES.forEach((threshold, i) => {
    const crossed = currentDepth > i ? zoom >= threshold - ZOOM_HYSTERESIS : zoom >= threshold + ZOOM_HYSTERESIS;
    if (crossed) depth = i + 1;
  });
  if (allowed.length === 0) return ORDER[depth];

  let best = allowed[0];
  for (const level of allowed) {
    if (Math.abs(ORDER.indexOf(level) - depth) < Math.abs(ORDER.indexOf(best) - depth)) best = level;
  }
  return best;
}
