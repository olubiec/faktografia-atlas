import tokens from '../../../config/tokens.json';
import { fitText, type MeasureFn } from './text-fit';
import { mapShapes } from './map-shapes';
import { type CardItem, getThemeColors } from './card';

export type CompareCardRow = { indicatorName: string; valA: string; valB: string; diffText: string; };
export type CompareCardUnit = { name: string; teryt: string; features?: unknown; classOf?: Record<string, 0 | 1 | 2 | 3 | 4 | 'noData'> | ((teryt: string) => 0 | 1 | 2 | 3 | 4 | 'noData'); };
export type CompareCardData = { indicatorName: string; year: number; unitA: CompareCardUnit; unitB: CompareCardUnit; rows: CompareCardRow[]; };

export function renderCompareContent({
  data, contentTop, availableContentHeight, safe, safeWidth, fontScale, colors, items, measure, scaleFactor
}: {
  data: CompareCardData; contentTop: number; availableContentHeight: number; safe: { left: number; right: number }; safeWidth: number; fontScale: Record<string, number>; colors: ReturnType<typeof getThemeColors>; items: CardItem[]; measure: MeasureFn; scaleFactor: number;
}) {
  let currentY = contentTop;
  const gap = Math.round(24 * scaleFactor);
  const colW = Math.round((safeWidth - gap) / 2);

  // Mapy z podpisem i legendą zajmują ok. 40% wysokości treści.
  const zoneH = Math.floor(availableContentHeight * 0.4);
  const hasMaps = !!(data.unitA.features || data.unitB.features);
  if (hasMaps) {
    const sides = [data.unitA, data.unitB];
    sides.forEach((unit, i) => {
      if (unit.features) renderMiniMap({ unit, x: safe.left + i * (colW + gap), y: currentY, width: colW, height: zoneH, fontScale, colors, items, measure, scaleFactor });
    });
    currentY += zoneH + Math.round(16 * scaleFactor);
  }

  const rowsList = data.rows;
  if (rowsList.length === 0) return;

  const tableHeaderY = currentY;
  const col1Width = Math.round(safeWidth * 0.4);
  const col23Width = Math.round(safeWidth * 0.18);
  const col4Width = safeWidth - col1Width - col23Width * 2;

  items.push({ type: 'text', x: safe.left, y: tableHeaderY, maxWidth: col1Width, fontSize: fontScale.xs, fontWeight: tokens.font.weights.subtitle, color: colors.olowek, lines: ['Wskaźnik'], lineHeight: Math.round(fontScale.xs * 1.2) });
  items.push({ type: 'text', x: safe.left + col1Width, y: tableHeaderY, maxWidth: col23Width, fontSize: fontScale.xs, fontWeight: tokens.font.weights.subtitle, color: colors.olowek, lines: [data.unitA.name], lineHeight: Math.round(fontScale.xs * 1.2) });
  items.push({ type: 'text', x: safe.left + col1Width + col23Width, y: tableHeaderY, maxWidth: col23Width, fontSize: fontScale.xs, fontWeight: tokens.font.weights.subtitle, color: colors.olowek, lines: [data.unitB.name], lineHeight: Math.round(fontScale.xs * 1.2) });
  items.push({ type: 'text', x: safe.left + col1Width + col23Width * 2, y: tableHeaderY, maxWidth: col4Width, fontSize: fontScale.xs, fontWeight: tokens.font.weights.subtitle, color: colors.olowek, lines: ['Różnica'], lineHeight: Math.round(fontScale.xs * 1.2) });

  currentY += Math.round(20 * scaleFactor);

  // Wysokość wiersza wynika z treści (nazwa w maks. 2 liniach) plus stały odstęp, nie z rozkładu na całą wysokość.
  const rowPad = Math.round(fontScale.sm * 0.5);
  const valueLine = Math.round(fontScale.sm * 1.2);
  for (const row of rowsList) {
    const nameFit = fitText(row.indicatorName, { maxWidth: col1Width - 8, maxLines: 2, fontSize: fontScale.sm, fontWeight: tokens.font.weights.text, measure, canvasWidth: 1080 * scaleFactor });
    items.push({ type: 'text', x: safe.left, y: currentY, maxWidth: col1Width, fontSize: nameFit.fontSize, fontWeight: tokens.font.weights.text, color: colors.tusz, lines: nameFit.lines, lineHeight: nameFit.lineHeight });
    items.push({ type: 'text', x: safe.left + col1Width, y: currentY, maxWidth: col23Width, fontSize: fontScale.sm, fontWeight: tokens.font.weights.subtitle, color: colors.tusz, lines: [row.valA], lineHeight: valueLine });
    items.push({ type: 'text', x: safe.left + col1Width + col23Width, y: currentY, maxWidth: col23Width, fontSize: fontScale.sm, fontWeight: tokens.font.weights.subtitle, color: colors.tusz, lines: [row.valB], lineHeight: valueLine });
    items.push({ type: 'text', x: safe.left + col1Width + col23Width * 2, y: currentY, maxWidth: col4Width, fontSize: fontScale.sm, fontWeight: tokens.font.weights.text, color: colors.olowek, lines: [row.diffText], lineHeight: valueLine });
    currentY += Math.max(nameFit.totalHeight, valueLine) + rowPad;
  }
}

type MiniMapArgs = { unit: CompareCardUnit; x: number; y: number; width: number; height: number; fontScale: Record<string, number>; colors: ReturnType<typeof getThemeColors>; items: CardItem[]; measure: MeasureFn; scaleFactor: number };

/** Jedna mapa porównania: podpis jednostki u góry, mapa, pod nią legenda 5 klas (tokeny sekwencyjne). */
function renderMiniMap({ unit, x, y, width, height, fontScale, colors, items, measure, scaleFactor }: MiniMapArgs) {
  const capFit = fitText(unit.name, { maxWidth: width, maxLines: 1, fontSize: fontScale.sm, fontWeight: tokens.font.weights.subtitle, measure, canvasWidth: 1080 * scaleFactor });
  items.push({ type: 'text', x, y, maxWidth: width, fontSize: capFit.fontSize, fontWeight: tokens.font.weights.subtitle, color: colors.tusz, align: 'left', lines: capFit.lines, lineHeight: capFit.lineHeight });

  const swatchH = Math.round(12 * scaleFactor);
  const labelH = Math.round(fontScale.xs * 1.2);
  const legendH = swatchH + Math.round(4 * scaleFactor) + labelH;
  const mapY = y + capFit.totalHeight + Math.round(8 * scaleFactor);
  const legendY = y + height - legendH;
  const mapH = legendY - Math.round(8 * scaleFactor) - mapY;

  if (unit.features && mapH > 50) {
    const res = mapShapes(unit.features, { box: { x, y: mapY, width, height: mapH }, padding: 5 * scaleFactor, classOf: unit.classOf, selected: unit.teryt });
    for (const s of res.shapes) items.push({ type: 'path', d: s.d, fill: s.fill === 'noData' ? colors.noDataColor : colors.seq[s.fill] ?? colors.noDataColor, stroke: s.selected ? colors.korekta : colors.arkusz, strokeWidth: s.selected ? 2 : 0.5 });
  }

  const classCount = 5;
  const swatchW = Math.floor(width / classCount);
  for (let i = 0; i < classCount; i++) items.push({ type: 'rect', x: x + i * swatchW, y: legendY, width: swatchW - 2, height: swatchH, fill: colors.seq[i] });
  items.push({ type: 'text', x, y: legendY + swatchH + Math.round(4 * scaleFactor), maxWidth: width, fontSize: fontScale.xs, fontWeight: tokens.font.weights.text, color: colors.olowek, align: 'left', lines: ['mniej → więcej'], lineHeight: labelH });
}
