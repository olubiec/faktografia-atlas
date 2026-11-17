import tokens from '../../../config/tokens.json';
import type { MeasureFn } from './text-fit';
import { type CardItem, getThemeColors } from './card';
import {
  buildPathD, buildSegments, calculateX, calculateY, calculateYDomain, getSortedYears,
  getValidPoints, getXAxisYears, hasEnoughData, type ChartDimensions, type TrendDataPoint,
} from '../profile/trend-geometry';

export type TrendCardData = {
  indicator: { name: string; unit?: string };
  unitName: string;
  series: TrendDataPoint[];
  minText?: string;
  maxText?: string;
  lastText?: string;
};

const NO_DATA_TEXT = 'Za mało danych do wykresu';

// Podziałka osi Y: liczba miejsc po przecinku zależy od rozpiętości wartości.
function formatTick(value: number, range: number): string {
  const digits = range >= 10 ? 0 : range >= 1 ? 1 : 2;
  return value.toLocaleString('pl-PL', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function renderTrendContent({
  data, contentTop, availableContentHeight, safe, safeWidth, fontScale, colors, items, measure, scaleFactor,
}: {
  data: TrendCardData; contentTop: number; availableContentHeight: number; safe: { left: number; right: number }; safeWidth: number; fontScale: Record<string, number>; colors: ReturnType<typeof getThemeColors>; items: CardItem[]; measure: MeasureFn; scaleFactor: number;
}) {
  const textW = tokens.font.weights.text;
  const small = fontScale.xs;
  const lh = Math.round(small * 1.2);
  const left = safe.left;
  const right = safe.left + safeWidth;

  // Ten sam warunek co w profilu: poniżej 2 punktów zamiast wykresu jest komunikat.
  if (!hasEnoughData(data.series)) {
    const size = fontScale.md;
    items.push({ type: 'text', x: left, y: contentTop, maxWidth: safeWidth, fontSize: size, fontWeight: textW, color: colors.olowek, align: 'left', lines: [NO_DATA_TEXT], lineHeight: Math.round(size * 1.2) });
    return;
  }

  const valid = getValidPoints(data.series);
  const { minY, maxY, domainMinY, domainMaxY } = calculateYDomain(valid);
  const flat = valid.every((p) => p.value === valid[0].value);
  const range = maxY - minY;

  // Wymiary w układzie geometrii z trend-geometry (padding = miejsce na osie i etykiety).
  const dot = Math.max(4, Math.round(8 * scaleFactor));
  const tickTexts = flat ? [formatTick(valid[0].value, 0)] : [minY, (minY + maxY) / 2, maxY].map((v) => formatTick(v, range));
  const yAxisWidth = Math.max(...tickTexts.map((t) => measure(t, small, textW))) + Math.round(12 * scaleFactor);
  const gap = Math.round(6 * scaleFactor);
  const dims: ChartDimensions = {
    height: availableContentHeight,
    paddingLeft: yAxisWidth,
    paddingRight: dot,
    paddingTop: lh + dot + gap,
    paddingBottom: lh + gap * 2,
  };
  const plotWidth = safeWidth - dims.paddingLeft - dims.paddingRight;
  const plotHeight = dims.height - dims.paddingTop - dims.paddingBottom;
  const years = getSortedYears(data.series);
  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const px = (year: number) => left + calculateX(year, minYear, maxYear, dims.paddingLeft, plotWidth);
  const py = (val: number) => contentTop + calculateY(val, domainMinY, domainMaxY, dims.paddingTop, plotHeight);

  const label = (text: string, cx: number, y: number, color: string, weight: number | string = textW) => {
    const w = Math.ceil(measure(text, small, weight));
    const x = Math.min(Math.max(cx - w / 2, left), right - w);
    items.push({ type: 'text', x, y, maxWidth: w, fontSize: small, fontWeight: weight, color, align: 'left', lines: [text], lineHeight: lh });
  };

  // Siatka i podziałki osi Y (3 poziomy; przy stałych wartościach jeden).
  const ticks = flat ? [valid[0].value] : [minY, (minY + maxY) / 2, maxY];
  ticks.forEach((v, i) => {
    const y = py(v);
    items.push({ type: 'rect', x: left + dims.paddingLeft, y, width: plotWidth, height: 1, fill: colors.linia });
    items.push({ type: 'text', x: left, y: y - lh / 2, maxWidth: yAxisWidth - gap, fontSize: small, fontWeight: textW, color: colors.olowek, align: 'right', lines: [tickTexts[i]], lineHeight: lh });
  });

  // Oś lat: do 6 etykiet (getXAxisYears), przyciętych do pola safe.
  const axisY = contentTop + dims.height - lh;
  for (const yr of getXAxisYears(years)) label(String(yr), px(yr), axisY, colors.olowek);

  // Linia: jeden PathItem na segment; pojedynczy rok między przerwami to sama kropka.
  const stroke = Math.max(2, Math.round(3 * scaleFactor));
  for (const seg of buildSegments(data.series)) {
    if (seg.length < 2) continue;
    items.push({ type: 'path', d: buildPathD(seg, px, py), stroke: colors.tusz, strokeWidth: stroke });
  }

  const dotAt = (year: number, value: number, color: string) =>
    items.push({ type: 'rect', x: px(year) - dot / 2, y: py(value) - dot / 2, width: dot, height: dot, rx: dot / 2, fill: color });

  const last = valid[valid.length - 1];
  const lo = valid.reduce((a, b) => (b.value < a.value ? b : a));
  const hi = valid.reduce((a, b) => (b.value > a.value ? b : a));
  const aboveY = (v: number) => Math.max(contentTop, py(v) - dot - lh);
  const belowY = (v: number) => Math.min(py(v) + dot, contentTop + dims.paddingTop + plotHeight - lh);
  const bold = tokens.font.weights.heading;

  // Min/max i ostatni punkt; gdy ostatni jest też min/max, dostaje jedną etykietę w kolorze korektaTekst.
  const marks: { p: typeof last; text?: string; above: boolean }[] = flat ? [] : [
    { p: hi, text: data.maxText, above: true },
    { p: lo, text: data.minText, above: false },
  ];
  for (const m of marks) {
    const isLast = m.p.year === last.year;
    dotAt(m.p.year, m.p.value, isLast ? colors.korektaTekst : colors.tusz);
    const text = isLast && data.lastText ? data.lastText : m.text;
    if (text) label(text, px(m.p.year), m.above ? aboveY(m.p.value) : belowY(m.p.value), isLast ? colors.korektaTekst : colors.olowek, isLast ? bold : textW);
  }
  if (!marks.some((m) => m.p.year === last.year)) {
    dotAt(last.year, last.value, colors.korektaTekst);
    if (data.lastText) label(data.lastText, px(last.year), aboveY(last.value), colors.korektaTekst, bold);
  }
}
