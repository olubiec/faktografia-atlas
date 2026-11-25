import tokens from '../../../config/tokens.json';
import { classColorToken, classify, computeBreaks, type ClassificationMethod, type ClassificationScheme } from '../map/classes';
import { formatValue } from '../format/number';
import { isZeroClass, ZERO_EDGE } from '../map/calibrate';
import { fitText, type MeasureFn } from './text-fit';
import { type CardItem, getThemeColors } from './card';

export type HistogramCardData = {
  indicator: { name: string; unit?: string };
  year: number;
  levelName: string;
  values: (number | null)[];
  selectedValue?: number | null;
  /** Opcjonalnie gotowe progi (4 progi = 5 klas), inaczej liczone z `method`. */
  breaks?: number[];
  method?: ClassificationMethod;
  scheme?: ClassificationScheme;
  formatValue?: (n: number) => string;
};

const CLASS_COUNT = 5;

export type HistogramCounts = { counts: number[]; noData: number; breaks: number[] };

/**
 * Zlicza jednostki w 5 klasach legendy mapy + „brak danych”.
 * Używa tych samych `computeBreaks` i `classify` co mapa.
 */
export function histogramCounts(
  values: (number | null | undefined)[],
  source: ClassificationMethod | { breaks: number[] },
  _scheme: ClassificationScheme = 'sequential'
): HistogramCounts {
  const breaks = typeof source === 'string' ? computeBreaks(values, source, CLASS_COUNT) : source.breaks;
  const counts = new Array<number>(CLASS_COUNT).fill(0);
  let noData = 0;
  for (const v of values) {
    const c = classify(v, breaks);
    if (c === 'no-data') noData++;
    else counts[Math.min(c, CLASS_COUNT - 1)]++;
  }
  return { counts, noData, breaks };
}

/** Etykieta przedziału klasy: „do b”, „a – b”, „od a”. */
function rangeLabel(i: number, breaks: number[], fmt: (n: number) => string): string {
  if (breaks.length === 0) return i === 0 ? 'wszystkie' : '–';
  if (isZeroClass(i, breaks)) return fmt(0);
  const at = (k: number) => (breaks[k] === ZERO_EDGE ? 0 : breaks[k]);
  if (i === 0) return `do ${fmt(breaks[0])}`;
  if (i === breaks.length) return `od ${fmt(at(breaks.length - 1))}`;
  if (i > breaks.length) return '–';
  return `${fmt(at(i - 1))} – ${fmt(breaks[i])}`;
}

export function renderHistogramContent({
  data, contentTop, availableContentHeight, safe, safeWidth, fontScale, colors, items, measure, scaleFactor,
}: {
  data: HistogramCardData; contentTop: number; availableContentHeight: number; safe: { left: number; right: number }; safeWidth: number; fontScale: Record<string, number>; colors: ReturnType<typeof getThemeColors>; items: CardItem[]; measure: MeasureFn; scaleFactor: number;
}) {
  const scheme = data.scheme ?? 'sequential';
  const palette = scheme === 'diverging' ? tokens.data.diverging : tokens.data.sequential;
  const theme = colors.kalka === tokens.color.dark.kalka ? 'dark' : 'light';

  const source = data.breaks ? { breaks: data.breaks } : (data.method ?? 'quantile');
  const { counts, noData, breaks } = histogramCounts(data.values, source, scheme);
  // Kolor słupka jak kolor klasy na mapie (przy progach z zerem: strona zera, nie numer klasy).
  const classes = breaks.length + 1;
  const classColor = (i: number) => {
    const token = classColorToken(i, classes, scheme, breaks);
    return palette[theme][Number(token.split('-').pop()) - 1] ?? colors.noDataColor;
  };
  const barColors = [...[0, 1, 2, 3, 4].map(classColor), colors.noDataColor];
  const all = [...counts, noData];
  const maxCount = Math.max(1, ...all);

  const fmt = data.formatValue ?? ((n: number) => formatValue(n, data.indicator.unit));
  const labels = [0, 1, 2, 3, 4].map((i) => rangeLabel(i, breaks, fmt));
  labels.push('brak danych');

  let selectedIdx = -1;
  if (data.selectedValue !== undefined) {
    const c = classify(data.selectedValue, breaks);
    selectedIdx = c === 'no-data' ? CLASS_COUNT : c;
  }

  const gap = Math.round(8 * scaleFactor);
  const colGap = Math.round(12 * scaleFactor);
  const colWidth = Math.floor((safeWidth - colGap * (all.length - 1)) / all.length);

  const countFont = fontScale.md;
  const countLineH = Math.round(countFont * 1.2);
  const labelFont = fontScale.xs;
  const labelLineH = Math.round(labelFont * 1.2);
  const labelAreaH = labelLineH * 2;

  const maxBarH = Math.max(0, availableContentHeight - countLineH - labelAreaH - gap * 2);
  const baselineY = contentTop + countLineH + gap + maxBarH;
  const labelY = baselineY + gap;

  all.forEach((count, i) => {
    const x = safe.left + i * (colWidth + colGap);
    const selected = i === selectedIdx;
    let h = Math.round((count / maxCount) * maxBarH);
    if (selected) h = Math.max(h, Math.min(maxBarH, Math.round(4 * scaleFactor)));
    const bar: CardItem = { type: 'rect', x, y: baselineY - h, width: colWidth, height: h, fill: barColors[i] };
    if (selected) {
      bar.stroke = colors.korekta;
      bar.strokeWidth = Math.max(2, Math.round(4 * scaleFactor));
    }
    items.push(bar);

    items.push({ type: 'text', x, y: baselineY - h - countLineH - Math.round(2 * scaleFactor), maxWidth: colWidth, fontSize: countFont, fontWeight: selected ? tokens.font.weights.heading : tokens.font.weights.text, color: selected ? colors.korektaTekst : colors.tusz, align: 'center', lines: [String(count)], lineHeight: countLineH });

    const fit = fitText(labels[i], { maxWidth: colWidth, maxLines: 2, fontSize: labelFont, fontWeight: tokens.font.weights.text, measure, canvasWidth: 1080 * scaleFactor, minFontSize: Math.max(8, Math.round(labelFont * 0.8)) });
    items.push({ type: 'text', x, y: labelY, maxWidth: colWidth, fontSize: fit.fontSize, fontWeight: tokens.font.weights.text, color: colors.olowek, align: 'center', lines: fit.lines.slice(0, 2), lineHeight: fit.lineHeight });
  });
}
