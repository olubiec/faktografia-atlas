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

  const miniMapHeight = Math.min(Math.round(180 * scaleFactor), Math.floor(availableContentHeight * 0.3));
  const miniMapWidth = Math.round((safeWidth - 24 * scaleFactor) / 2);

  if (data.unitA.features || data.unitB.features) {
    if (data.unitA.features) {
      const shapesA = mapShapes(data.unitA.features, { box: { x: safe.left, y: currentY, width: miniMapWidth, height: miniMapHeight }, padding: 5 * scaleFactor, classOf: data.unitA.classOf, selected: data.unitA.teryt });
      for (const s of shapesA.shapes) { items.push({ type: 'path', d: s.d, fill: s.fill === 'noData' ? colors.noDataColor : colors.seq[s.fill] ?? colors.noDataColor, stroke: s.selected ? colors.korekta : colors.arkusz, strokeWidth: s.selected ? 2 : 0.5 }); }
    }
    if (data.unitB.features) {
      const shapesB = mapShapes(data.unitB.features, { box: { x: safe.left + miniMapWidth + Math.round(24 * scaleFactor), y: currentY, width: miniMapWidth, height: miniMapHeight }, padding: 5 * scaleFactor, classOf: data.unitB.classOf, selected: data.unitB.teryt });
      for (const s of shapesB.shapes) { items.push({ type: 'path', d: s.d, fill: s.fill === 'noData' ? colors.noDataColor : colors.seq[s.fill] ?? colors.noDataColor, stroke: s.selected ? colors.korekta : colors.arkusz, strokeWidth: s.selected ? 2 : 0.5 }); }
    }
    currentY += miniMapHeight + Math.round(16 * scaleFactor);
  }

  const rowsList = data.rows.slice(0, 8);
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
  const remainingHeight = availableContentHeight - (currentY - contentTop);
  const rowHeight = Math.floor(remainingHeight / rowsList.length);

  for (const row of rowsList) {
    const nameFit = fitText(row.indicatorName, { maxWidth: col1Width - 8, maxLines: 2, fontSize: fontScale.sm, fontWeight: tokens.font.weights.text, measure, canvasWidth: 1080 * scaleFactor });
    items.push({ type: 'text', x: safe.left, y: currentY, maxWidth: col1Width, fontSize: nameFit.fontSize, fontWeight: tokens.font.weights.text, color: colors.tusz, lines: nameFit.lines, lineHeight: nameFit.lineHeight });
    items.push({ type: 'text', x: safe.left + col1Width, y: currentY, maxWidth: col23Width, fontSize: fontScale.sm, fontWeight: tokens.font.weights.subtitle, color: colors.tusz, lines: [row.valA], lineHeight: Math.round(fontScale.sm * 1.2) });
    items.push({ type: 'text', x: safe.left + col1Width + col23Width, y: currentY, maxWidth: col23Width, fontSize: fontScale.sm, fontWeight: tokens.font.weights.subtitle, color: colors.tusz, lines: [row.valB], lineHeight: Math.round(fontScale.sm * 1.2) });
    items.push({ type: 'text', x: safe.left + col1Width + col23Width * 2, y: currentY, maxWidth: col4Width, fontSize: fontScale.sm, fontWeight: tokens.font.weights.text, color: colors.olowek, lines: [row.diffText], lineHeight: Math.round(fontScale.sm * 1.2) });
    currentY += rowHeight;
  }
}
