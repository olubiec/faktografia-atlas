import tokens from '../../../config/tokens.json';
import { fitText, type MeasureFn } from './text-fit';
import { type CardItem, getThemeColors } from './card';

export type RankingCardItem = { teryt?: string; name: string; value: number | null; valueText?: string; rank?: number; selected?: boolean; };
export type RankingCardData = { indicator: { name: string; unit?: string }; year: number; items: RankingCardItem[]; selectedTeryt?: string; };

export function renderRankingContent({
  data, contentTop, availableContentHeight, safe, safeWidth, fontScale, colors, items, measure, scaleFactor
}: {
  data: RankingCardData; contentTop: number; availableContentHeight: number; safe: { left: number; right: number }; safeWidth: number; fontScale: Record<string, number>; colors: ReturnType<typeof getThemeColors>; items: CardItem[]; measure: MeasureFn; scaleFactor: number;
}) {
  const itemsList = data.items.length <= 20 ? data.items : data.items.slice(0, 20);
  if (itemsList.length === 0) return;

  const rowGap = Math.max(2, Math.floor((availableContentHeight - itemsList.length * 16 * scaleFactor) / itemsList.length));
  const rowHeight = Math.min(Math.round(36 * scaleFactor), Math.floor(availableContentHeight / itemsList.length) - rowGap);

  let maxValue = 0;
  for (const it of itemsList) {
    if (it.value !== null && Math.abs(it.value) > maxValue) {
      maxValue = Math.abs(it.value);
    }
  }
  if (maxValue === 0) maxValue = 1;

  const rankWidth = Math.round(36 * scaleFactor);
  const valWidth = Math.round(100 * scaleFactor);
  const nameWidth = Math.round(420 * scaleFactor);
  const barStartX = safe.left + rankWidth + nameWidth + Math.round(12 * scaleFactor);
  const maxBarWidth = safeWidth - rankWidth - nameWidth - valWidth - Math.round(24 * scaleFactor);

  let currentY = contentTop;
  for (let i = 0; i < itemsList.length; i++) {
    const item = itemsList[i];
    const isSelected = item.selected || (data.selectedTeryt && item.teryt === data.selectedTeryt);
    const rankStr = `${item.rank ?? i + 1}.`;

    items.push({ type: 'text', x: safe.left, y: currentY + Math.round(2 * scaleFactor), maxWidth: rankWidth, fontSize: fontScale.sm, fontWeight: isSelected ? tokens.font.weights.heading : tokens.font.weights.text, color: isSelected ? colors.korektaTekst : colors.olowek, lines: [rankStr], lineHeight: Math.round(fontScale.sm * 1.2) });

    const nameFit = fitText(item.name, { maxWidth: nameWidth, maxLines: 1, fontSize: fontScale.sm, fontWeight: isSelected ? tokens.font.weights.heading : tokens.font.weights.text, measure, canvasWidth: 1080 * scaleFactor, minFontSize: fontScale.xs });
    items.push({ type: 'text', x: safe.left + rankWidth, y: currentY + Math.round(2 * scaleFactor), maxWidth: nameWidth, fontSize: nameFit.fontSize, fontWeight: isSelected ? tokens.font.weights.heading : tokens.font.weights.text, color: isSelected ? colors.korektaTekst : colors.tusz, lines: nameFit.lines, lineHeight: nameFit.lineHeight });

    const barRatio = item.value !== null ? Math.max(0.02, Math.abs(item.value) / maxValue) : 0;
    const barWidth = Math.max(0, Math.round(maxBarWidth * barRatio));
    if (barWidth > 0) {
      items.push({ type: 'rect', x: barStartX, y: currentY + Math.round(4 * scaleFactor), width: barWidth, height: Math.max(4, rowHeight - Math.round(8 * scaleFactor)), fill: isSelected ? colors.korekta : colors.seq[3] });
    }

    const valStr = item.valueText ?? (item.value !== null ? String(item.value) : 'brak danych');
    items.push({ type: 'text', x: barStartX + barWidth + Math.round(8 * scaleFactor), y: currentY + Math.round(2 * scaleFactor), maxWidth: valWidth, fontSize: fontScale.sm, fontWeight: isSelected ? tokens.font.weights.heading : tokens.font.weights.text, color: isSelected ? colors.korektaTekst : colors.tusz, lines: [valStr], lineHeight: Math.round(fontScale.sm * 1.2) });

    currentY += rowHeight + rowGap;
  }
}
