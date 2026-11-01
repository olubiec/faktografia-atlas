import tokens from '../../../config/tokens.json';
import { fitText, type MeasureFn } from './text-fit';
import { type CardItem, getThemeColors } from './card';

export type ProfileCardIndicator = { name: string; value: string; unit?: string; rankText?: string; };
export type ProfileCardData = { unitName: string; teryt?: string; indicatorName: string; unit?: string; year: number; bigNumber: string; rankText?: string; indicators: ProfileCardIndicator[]; };

export function renderProfileContent({
  data, contentTop, availableContentHeight, safe, safeWidth, fontScale, colors, items, measure, scaleFactor
}: {
  data: ProfileCardData; contentTop: number; availableContentHeight: number; safe: { left: number; right: number }; safeWidth: number; fontScale: Record<string, number>; colors: ReturnType<typeof getThemeColors>; items: CardItem[]; measure: MeasureFn; scaleFactor: number;
}) {
  let currentY = contentTop;

  const indNameFit = fitText(data.indicatorName, { maxWidth: safeWidth, maxLines: 1, fontSize: fontScale.lg, fontWeight: tokens.font.weights.subtitle, measure, canvasWidth: 1080 * scaleFactor });
  items.push({ type: 'text', x: safe.left, y: currentY, maxWidth: safeWidth, fontSize: indNameFit.fontSize, fontWeight: tokens.font.weights.subtitle, color: colors.olowek, lines: indNameFit.lines, lineHeight: indNameFit.lineHeight });
  currentY += indNameFit.totalHeight + Math.round(12 * scaleFactor);

  const numText = data.unit ? `${data.bigNumber} ${data.unit}` : data.bigNumber;
  const numFit = fitText(numText, { maxWidth: safeWidth, maxLines: 1, fontSize: fontScale['4xl'], fontWeight: tokens.font.weights.title, measure, canvasWidth: 1080 * scaleFactor });
  const numY = currentY;
  items.push({ type: 'text', x: safe.left, y: numY, maxWidth: safeWidth, fontSize: numFit.fontSize, fontWeight: tokens.font.weights.title, color: colors.tusz, lines: numFit.lines, lineHeight: numFit.lineHeight });

  const numWidth = measure(numText, numFit.fontSize, tokens.font.weights.title);
  items.push({ type: 'annotation', kind: 'circle', x: safe.left - Math.round(8 * scaleFactor), y: numY - Math.round(4 * scaleFactor), width: Math.min(safeWidth, numWidth + Math.round(16 * scaleFactor)), height: numFit.totalHeight + Math.round(8 * scaleFactor), color: colors.korekta });
  currentY += numFit.totalHeight + Math.round(16 * scaleFactor);

  if (data.rankText) {
    items.push({ type: 'text', x: safe.left, y: currentY, maxWidth: safeWidth, fontSize: fontScale.md, fontWeight: tokens.font.weights.subtitle, color: colors.korektaTekst, lines: [data.rankText], lineHeight: Math.round(fontScale.md * 1.2) });
    currentY += Math.round(28 * scaleFactor);
  }

  currentY += Math.round(20 * scaleFactor);

  const remainingHeight = availableContentHeight - (currentY - contentTop);
  const indList = data.indicators.slice(0, 5);
  if (indList.length === 0) return;

  const itemHeight = Math.floor(remainingHeight / indList.length);
  for (const ind of indList) {
    const valText = ind.unit ? `${ind.value} ${ind.unit}` : ind.value;
    const nameWidth = Math.round(safeWidth * 0.6);
    const valWidth = safeWidth - nameWidth - Math.round(16 * scaleFactor);

    const nameFit = fitText(ind.name, { maxWidth: nameWidth, maxLines: 2, fontSize: fontScale.sm, fontWeight: tokens.font.weights.text, measure, canvasWidth: 1080 * scaleFactor });
    items.push({ type: 'text', x: safe.left, y: currentY, maxWidth: nameWidth, fontSize: nameFit.fontSize, fontWeight: tokens.font.weights.text, color: colors.tusz, lines: nameFit.lines, lineHeight: nameFit.lineHeight });
    items.push({ type: 'text', x: safe.left + nameWidth + Math.round(16 * scaleFactor), y: currentY, maxWidth: valWidth, fontSize: fontScale.sm, fontWeight: tokens.font.weights.heading, color: colors.tusz, align: 'right', lines: [valText], lineHeight: Math.round(fontScale.sm * 1.2) });
    currentY += itemHeight;
  }
}
