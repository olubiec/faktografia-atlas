/** Zoom widoku całej Polski i zoom, od którego obrys ma pełną szerokość. */
const ZOOM_POLAND = 5;
const ZOOM_UNIT = 10;
const WIDTH_MIN_PX = 1;
const WIDTH_MAX_PX = 3;

/**
 * Szerokość obrysu (px): cienka przy zoomie Polski (min. 1 px), pełna przy zoomie jednostki.
 * Kolor obrysu pochodzi z tokena `--korekta` (przekazuje go warstwa), bez wypełnienia.
 */
export function outlineWidth(zoom: number): number {
  if (!Number.isFinite(zoom)) return WIDTH_MIN_PX;
  const t = (zoom - ZOOM_POLAND) / (ZOOM_UNIT - ZOOM_POLAND);
  const clamped = Math.min(1, Math.max(0, t));
  return WIDTH_MIN_PX + clamped * (WIDTH_MAX_PX - WIDTH_MIN_PX);
}

/**
 * Kody TERYT do obrysowania: dwie jednostki porównania albo jedna wybrana.
 * Parametr `compare` ma postać „a,b”; gdy jest niepełny, liczy się wybrana jednostka.
 */
export function resolveOutlinedIds(compare: string | null | undefined, selected: string | null | undefined): string[] {
  if (compare) {
    const parts = compare.split(',').filter(Boolean);
    if (parts.length === 2) return parts;
  }
  return selected ? [selected] : [];
}
