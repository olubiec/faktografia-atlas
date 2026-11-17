// Logo na karcie: proporcje i przygotowanie pliku SVG do rysowania na canvas.
// Plik z public/brand/ ma tylko viewBox (bez width/height), a Safari i Firefox
// nie umieją go narysować na canvas bez wymiarów własnych – stąd dopisujemy je tutaj.

/** Proporcje viewBox logo (szerokość / wysokość), zgodne z plikami w public/brand/. */
export const LOGO_ASPECT = 312.2 / 110;

/** Wymiary logo na karcie przy danej wysokości – zawsze w oryginalnych proporcjach. */
export function logoSize(height: number): { width: number; height: number } {
  return { width: Math.round(height * LOGO_ASPECT), height };
}

/** Dopisuje width/height z viewBox do korzenia <svg>, jeśli ich brak. */
export function withIntrinsicSize(svg: string): string {
  const open = svg.match(/<svg\b[^>]*>/);
  if (!open) return svg;
  const tag = open[0];
  const vb = tag.match(/viewBox="\s*[-\d.]+[ ,]+[-\d.]+[ ,]+([\d.]+)[ ,]+([\d.]+)\s*"/);
  if (!vb) return svg;
  let next = tag;
  if (!/\swidth="/.test(tag)) next = next.replace('<svg', `<svg width="${vb[1]}"`);
  if (!/\sheight="/.test(tag)) next = next.replace('<svg', `<svg height="${vb[2]}"`);
  return svg.replace(tag, next);
}
