import tokens from '../../../config/tokens.json';
import { fitText, type MeasureFn } from './text-fit';
import { type CardItem, getThemeColors } from './card';

export type VersusCardData = { indicator: { name: string; unit?: string }; year: number; a: { name: string; valueText: string }; b: { name: string; valueText: string }; diffText: string; };

type Fit = ReturnType<typeof fitText>;
type Side = { name: Fit; num: Fit };

export function renderVersusContent({
  data, contentTop, availableContentHeight, safe, safeWidth, fontScale, colors, items, measure, scaleFactor
}: {
  data: VersusCardData; contentTop: number; availableContentHeight: number; safe: { left: number; right: number }; safeWidth: number; fontScale: Record<string, number>; colors: ReturnType<typeof getThemeColors>; items: CardItem[]; measure: MeasureFn; scaleFactor: number;
}) {
  const px = (n: number) => Math.round(n * scaleFactor);
  const canvasWidth = 1080 * scaleFactor;
  const W = tokens.font.weights;
  const gap = px(16);
  const pad = px(12);
  const horizontal = safeWidth >= availableContentHeight * 1.6;
  const vsW = horizontal ? px(120) : 0;
  const colW = horizontal ? Math.floor((safeWidth - vsW) / 2) : safeWidth;
  const hasDiff = data.diffText.trim() !== '';

  const fit = (text: string, maxWidth: number, lines: number, size: number, weight: number | string) =>
    fitText(text, { maxWidth, maxLines: lines, fontSize: size, fontWeight: weight, measure, canvasWidth });
  const text = (f: Fit, x: number, y: number, maxWidth: number, weight: number | string, color: string): CardItem =>
    ({ type: 'text', x, y, maxWidth, fontSize: f.fontSize, fontWeight: weight, color, align: 'center', lines: f.lines, lineHeight: f.lineHeight });

  // Układ liczymy z mnożnikiem k; gdy całość nie mieści się w obszarze, zmniejszamy go i liczymy ponownie.
  for (let k = 1; k >= 0.3; k -= 0.1) {
    const sz = (n: number) => Math.max(1, Math.round(n * k));
    const side = (s: { name: string; valueText: string }): Side => ({
      name: fit(s.name, colW - 2 * pad, 2, sz(fontScale.xl), W.subtitle),
      num: fit(s.valueText, colW - 2 * pad, 1, sz(fontScale['5xl']), W.title),
    });
    const sa = side(data.a);
    const sb = side(data.b);
    const head = fit(data.indicator.unit ? `${data.indicator.name}, ${data.indicator.unit}` : data.indicator.name, safeWidth, 2, sz(fontScale.md), W.subtitle);
    const vs = fit('vs', safeWidth, 1, sz(fontScale.lg), W.text);
    const diff = hasDiff ? fit(data.diffText, safeWidth - 2 * pad, 2, sz(fontScale.lg), W.subtitle) : undefined;
    const blockH = (s: Side) => s.name.totalHeight + gap + s.num.totalHeight;
    const nameH = Math.max(sa.name.totalHeight, sb.name.totalHeight);
    const rowH = nameH + gap + Math.max(sa.num.totalHeight, sb.num.totalHeight);
    const diffH = diff ? diff.totalHeight + 2 * pad + gap : 0;
    const mid = horizontal ? rowH : blockH(sa) + gap + vs.totalHeight + gap + blockH(sb);
    const total = head.totalHeight + gap + mid + (diff ? gap + diffH : 0);
    if (total > availableContentHeight && k > 0.31) continue;

    let y = contentTop + Math.max(0, Math.round((availableContentHeight - total) / 2));
    items.push(text(head, safe.left, y, safeWidth, W.subtitle, colors.olowek));
    y += head.totalHeight + gap;

    const place = (s: Side, x: number, top: number) => {
      items.push(text(s.name, x, top, colW, W.subtitle, colors.tusz));
      items.push(text(s.num, x, top + nameH + gap, colW, W.title, colors.tusz));
    };
    if (horizontal) {
      place(sa, safe.left, y);
      place(sb, safe.left + colW + vsW, y);
      const vsY = y + Math.round((rowH - vs.totalHeight) / 2);
      items.push(text(vs, safe.left + colW, vsY, vsW, W.text, colors.olowek));
      y += rowH + gap;
    } else {
      // W układzie pionowym wysokość bloku nazwy jest własna dla każdej strony.
      items.push(text(sa.name, safe.left, y, colW, W.subtitle, colors.tusz));
      items.push(text(sa.num, safe.left, y + sa.name.totalHeight + gap, colW, W.title, colors.tusz));
      y += blockH(sa) + gap;
      items.push(text(vs, safe.left, y, colW, W.text, colors.olowek));
      y += vs.totalHeight + gap;
      items.push(text(sb.name, safe.left, y, colW, W.subtitle, colors.tusz));
      items.push(text(sb.num, safe.left, y + sb.name.totalHeight + gap, colW, W.title, colors.tusz));
      y += blockH(sb) + gap;
    }

    if (diff) {
      const textY = y + pad;
      items.push(text(diff, safe.left, textY, safeWidth, W.subtitle, colors.olowek));
      const w = Math.min(safeWidth - 2 * pad, Math.max(...diff.lines.map((l) => measure(l, diff.fontSize, W.subtitle))));
      const cx = safe.left + safeWidth / 2;
      // Jedno kółko korekty wokół słownej różnicy.
      items.push({ type: 'annotation', kind: 'circle', x: Math.round(cx - w / 2 - pad), y: textY - pad, width: w + 2 * pad, height: diff.totalHeight + 2 * pad, color: colors.korekta });
    }
    return;
  }
}
