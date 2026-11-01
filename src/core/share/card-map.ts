import tokens from '../../../config/tokens.json';
import { mapShapes } from './map-shapes';
import { type CardItem, getThemeColors } from './card';

export type MapCardData = {
  indicator: { name: string; unit?: string; year?: number };
  year: number;
  unitName?: string;
  features?: unknown;
  classOf?: Record<string, 0 | 1 | 2 | 3 | 4 | 'noData'> | ((teryt: string) => 0 | 1 | 2 | 3 | 4 | 'noData');
  selectedTeryt?: string;
};

export function renderMapContent({
  data,
  contentTop,
  contentBottom,
  safe,
  safeWidth,
  colors,
  items,
  scaleFactor,
}: {
  data: MapCardData;
  contentTop: number;
  contentBottom: number;
  safe: { left: number; right: number };
  safeWidth: number;
  colors: ReturnType<typeof getThemeColors>;
  items: CardItem[];
  scaleFactor: number;
}) {
  const legendHeight = Math.round(24 * scaleFactor);
  const mapY = contentTop;
  const mapHeight = contentBottom - contentTop - legendHeight - Math.round(12 * scaleFactor);

  if (data.features && mapHeight > 50) {
    const mapBox = { x: safe.left, y: mapY, width: safeWidth, height: mapHeight };
    const res = mapShapes(data.features, { box: mapBox, padding: 10 * scaleFactor, classOf: data.classOf, selected: data.selectedTeryt });
    for (const shape of res.shapes) {
      const fillColor = shape.fill === 'noData' ? colors.noDataColor : colors.seq[shape.fill] ?? colors.noDataColor;
      items.push({ type: 'path', d: shape.d, fill: fillColor, stroke: shape.selected ? colors.korekta : colors.arkusz, strokeWidth: shape.selected ? 2.5 : 0.5 });
    }
    if (res.outline) {
      items.push({ type: 'path', d: res.outline, stroke: colors.tusz, strokeWidth: 1.5 });
    }
  }

  const legendY = contentBottom - legendHeight;
  const classCount = 5;
  const classWidth = Math.round((safeWidth - 100 * scaleFactor) / classCount);

  items.push({ type: 'text', x: safe.left, y: legendY, maxWidth: safeWidth, fontSize: Math.round(tokens.font.scale.xs * scaleFactor), fontWeight: tokens.font.weights.text, color: colors.olowek, align: 'left', lines: ['mniej → więcej'], lineHeight: Math.round(tokens.font.scale.xs * scaleFactor * 1.2) });

  const legendBarX = safe.left + Math.round(100 * scaleFactor);
  for (let i = 0; i < classCount; i++) {
    items.push({ type: 'rect', x: legendBarX + i * classWidth, y: legendY, width: classWidth - 2, height: Math.round(12 * scaleFactor), fill: colors.seq[i] });
  }
}
