import tokens from '../../../config/tokens.json';
import { fitText, type MeasureFn } from './text-fit';
import { type CardItem, getThemeColors } from './card';

export type BigNumberCardData = { indicator: { name: string; unit?: string }; valueText: string; rankText?: string; unitName: string; year: number; };

type Block = { items: CardItem[]; height: number };

export function renderBigNumberContent({
  data, contentTop, availableContentHeight, safe, safeWidth, fontScale, colors, items, measure, scaleFactor
}: {
  data: BigNumberCardData; contentTop: number; availableContentHeight: number; safe: { left: number; right: number }; safeWidth: number; fontScale: Record<string, number>; colors: ReturnType<typeof getThemeColors>; items: CardItem[]; measure: MeasureFn; scaleFactor: number;
}) {
  if (data.valueText === '') return;
  const px = (n: number) => Math.round(n * scaleFactor);
  const canvasWidth = 1080 * scaleFactor;
  const pad = px(16);
  // Liczba ma miejsce na kółko po bokach, więc pole liczby jest węższe o jego margines.
  const numMaxWidth = safeWidth - 2 * pad;

  const center = (fit: ReturnType<typeof fitText>, weight: number | string, color: string, y: number): CardItem => ({
    type: 'text', x: safe.left, y, maxWidth: safeWidth, fontSize: fit.fontSize, fontWeight: weight, color, align: 'center', lines: fit.lines, lineHeight: fit.lineHeight,
  });
  const small = (text: string, size: number, weight: number | string, color: string, y: number): Block => {
    const fit = fitText(text, { maxWidth: safeWidth, maxLines: 1, fontSize: size, fontWeight: weight, measure, canvasWidth });
    return { items: [center(fit, weight, color, y)], height: fit.totalHeight };
  };

  const numFit = fitText(data.valueText, { maxWidth: numMaxWidth, maxLines: 1, fontSize: Math.round(fontScale['5xl'] * 1.6), fontWeight: tokens.font.weights.title, measure, canvasWidth });
  const numWidth = Math.min(numMaxWidth, measure(numFit.lines[0], numFit.fontSize, tokens.font.weights.title));

  // Układ pionowy liczony od zera (y = 0), potem przesuwany tak, by całość była w środku obszaru.
  const gap = px(12);
  const above: Block[] = [
    small(data.indicator.name, fontScale.lg, tokens.font.weights.subtitle, colors.olowek, 0),
    small(data.unitName, fontScale.md, tokens.font.weights.text, colors.olowek, 0),
  ];
  const below: Block[] = [];
  if (data.indicator.unit) below.push(small(data.indicator.unit, fontScale.lg, tokens.font.weights.subtitle, colors.tusz, 0));
  if (data.rankText) below.push(small(data.rankText, fontScale.md, tokens.font.weights.subtitle, colors.korektaTekst, 0));

  const stack = (blocks: Block[]) => blocks.reduce((h, b) => h + b.height + gap, 0);
  const circlePad = px(8);
  const total = stack(above) + numFit.totalHeight + circlePad * 2 + gap + stack(below) - (below.length ? gap : 0);
  let y = contentTop + Math.max(0, Math.round((availableContentHeight - total) / 2));

  for (const b of above) {
    for (const it of b.items) items.push({ ...(it as CardItem), y } as CardItem);
    y += b.height + gap;
  }
  const numY = y + circlePad;
  items.push(center(numFit, tokens.font.weights.title, colors.tusz, numY));
  // Jedno kółko korekty wokół liczby (ta sama metoda co w card-profile).
  const cx = safe.left + safeWidth / 2;
  items.push({ type: 'annotation', kind: 'circle', x: Math.round(cx - numWidth / 2 - pad / 2), y: numY - circlePad, width: numWidth + pad, height: numFit.totalHeight + circlePad * 2, color: colors.korekta });
  y = numY + numFit.totalHeight + circlePad + gap;
  for (const b of below) {
    for (const it of b.items) items.push({ ...(it as CardItem), y } as CardItem);
    y += b.height + gap;
  }
}
