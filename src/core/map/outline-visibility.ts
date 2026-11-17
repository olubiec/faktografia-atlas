// Reguła widoczności czerwonego obrysu: gaśnie, gdy jednostka jest mała na ekranie.
// Czysta logika – bez window i bez deck.gl.

/** Od tego ułamku szerokości mapy obrys jest w pełni widoczny (2%). */
export const OUTLINE_FADE_START = 0.02;
/** Poniżej tego ułamku obrys jest całkowicie niewidoczny (1%). */
export const OUTLINE_FADE_END = 0.01;

/** Kafel Web Mercator w MapLibre ma 512 px (tak samo w `view.ts`). */
const TILE_SIZE_PX = 512;

/** Ułamek szerokości mapy zajmowany przez jednostkę (może być > 1). */
export function unitScreenFraction(
  bboxWidthDeg: number,
  zoom: number,
  mapWidthPx: number,
): number {
  if (!(mapWidthPx > 0)) return 0;
  const widthPx = (bboxWidthDeg / 360) * TILE_SIZE_PX * 2 ** zoom;
  return widthPx / mapWidthPx;
}

/** Przezroczystość obrysu 0–1 dla danego ułamka; NaN i wartości ujemne → 0. */
export function outlineOpacity(fraction: number): number {
  if (!(fraction > 0)) return 0;
  if (fraction >= OUTLINE_FADE_START) return 1;
  if (fraction <= OUTLINE_FADE_END) return 0;
  return (fraction - OUTLINE_FADE_END) / (OUTLINE_FADE_START - OUTLINE_FADE_END);
}

export function outlineOpacityFor(
  bboxWidthDeg: number,
  zoom: number,
  mapWidthPx: number,
): number {
  return outlineOpacity(unitScreenFraction(bboxWidthDeg, zoom, mapWidthPx));
}
