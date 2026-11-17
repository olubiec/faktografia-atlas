import tokens from '../../../config/tokens.json';
import { fitText, type MeasureFn } from './text-fit';
import { type CardItem, getThemeColors } from './card';

export type TableCardRow = { name: string; valueText: string; rank?: string; selected?: boolean };
export type TableCardData = { unitName: string; year: number; rows: TableCardRow[] };

type Args = {
  data: TableCardData; contentTop: number; availableContentHeight: number; safe: { left: number; right: number }; safeWidth: number;
  fontScale: Record<string, number>; colors: ReturnType<typeof getThemeColors>; items: CardItem[]; measure: MeasureFn; scaleFactor: number;
};

// Udziały kolumn: nazwa 55 %, wartość 25 %, miejsce 20 %.
const NAME_SHARE = 0.55;
const VALUE_SHARE = 0.25;

/** Rysuje tabelę wskaźników (nazwa | wartość | miejsce) w obszarze treści karty. */
export function renderTableContent({ data, contentTop, availableContentHeight, safe, safeWidth, fontScale, colors, items, measure, scaleFactor }: Args) {
  if (data.rows.length === 0) return;

  const gap = Math.round(12 * scaleFactor);
  const pad = Math.round(8 * scaleFactor);
  const lineH = Math.max(1, Math.round(1 * scaleFactor));
  const nameW = Math.round(safeWidth * NAME_SHARE);
  const valueW = Math.round(safeWidth * VALUE_SHARE);
  const rankW = safeWidth - nameW - valueW;
  const nameX = safe.left;
  const valueX = nameX + nameW;
  const rankX = valueX + valueW;
  const canvasWidth = 1080 * scaleFactor;

  const fit = (text: string, maxWidth: number, maxLines: number, size: number, weight: number) =>
    fitText(text, { maxWidth, maxLines, fontSize: size, fontWeight: weight, measure, canvasWidth, minFontSize: fontScale.xs });

  const layoutRow = (row: TableCardRow, size: number) => {
    const w = row.selected ? tokens.font.weights.heading : tokens.font.weights.text;
    const name = fit(row.name, nameW - gap, 2, size, w);
    const value = fit(row.valueText, valueW - gap, 1, size, w);
    const rank = row.rank ? fit(row.rank, rankW, 1, size, w) : undefined;
    const height = Math.max(name.totalHeight, value.totalHeight, rank?.totalHeight ?? 0) + pad;
    return { row, w, name, value, rank, height };
  };

  const headSize = fontScale.xs;
  const headLH = Math.round(headSize * 1.2);
  const headerH = headLH + pad + lineH;
  const bodyH = availableContentHeight - headerH;
  if (bodyH <= 0) return;

  // Wybór rozmiaru: najpierw sm, potem xs; gdy nadal za dużo – tniemy listę.
  let size = fontScale.sm;
  let laid = data.rows.map((r) => layoutRow(r, size));
  if (laid.reduce((s, r) => s + r.height, 0) > bodyH) {
    size = fontScale.xs;
    laid = data.rows.map((r) => layoutRow(r, size));
  }
  const moreH = Math.round(fontScale.xs * 1.2) + pad;
  let shown = laid;
  if (laid.reduce((s, r) => s + r.height, 0) > bodyH) {
    shown = [];
    let used = 0;
    for (const r of laid) {
      if (used + r.height + moreH > bodyH) break;
      shown.push(r);
      used += r.height;
    }
  }

  const head = (text: string, x: number, w: number, align: 'left' | 'right') =>
    items.push({ type: 'text', x, y: contentTop, maxWidth: w, fontSize: headSize, fontWeight: tokens.font.weights.subtitle, color: colors.olowek, align, lines: [text], lineHeight: headLH });
  head('Wskaźnik', nameX, nameW - gap, 'left');
  head('Wartość', valueX, valueW - gap, 'right');
  head('Miejsce', rankX, rankW, 'right');
  items.push({ type: 'rect', x: safe.left, y: contentTop + headLH + pad, width: safeWidth, height: lineH, fill: colors.linia });

  let y = contentTop + headerH;
  for (const r of shown) {
    const color = r.row.selected ? colors.korektaTekst : colors.tusz;
    const top = y + Math.round(pad / 2);
    items.push({ type: 'text', x: nameX, y: top, maxWidth: nameW - gap, fontSize: r.name.fontSize, fontWeight: r.w, color, align: 'left', lines: r.name.lines, lineHeight: r.name.lineHeight });
    items.push({ type: 'text', x: valueX, y: top, maxWidth: valueW - gap, fontSize: r.value.fontSize, fontWeight: r.w, color, align: 'right', lines: r.value.lines, lineHeight: r.value.lineHeight });
    if (r.rank) items.push({ type: 'text', x: rankX, y: top, maxWidth: rankW, fontSize: r.rank.fontSize, fontWeight: r.w, color, align: 'right', lines: r.rank.lines, lineHeight: r.rank.lineHeight });
    y += r.height;
  }

  const hidden = data.rows.length - shown.length;
  if (hidden > 0) {
    const label = `… jeszcze ${hidden} ${hidden === 1 ? 'wskaźnik' : 'wskaźników'}`;
    items.push({ type: 'text', x: nameX, y: y + Math.round(pad / 2), maxWidth: nameW - gap, fontSize: fontScale.xs, fontWeight: tokens.font.weights.text, color: colors.olowek, align: 'left', lines: [label], lineHeight: Math.round(fontScale.xs * 1.2) });
  }
}
