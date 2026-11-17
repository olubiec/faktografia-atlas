import { describe, expect, it } from 'vitest';
import { renderTrendContent, type TrendCardData } from '../../src/core/share/card-trend';
import { getThemeColors, type CardItem, type PathItem, type TextItem, type RectItem } from '../../src/core/share/card';
import { SHARE_FORMATS, type ShareFormatKey } from '../../src/core/share/formats';
import type { TrendDataPoint } from '../../src/core/profile/trend-geometry';

const measure = (text: string, size: number): number => Math.round(0.55 * size * text.length);
const FORMATS: ShareFormatKey[] = ['post', 'square', 'story', 'wide'];
const colors = getThemeColors('light');

const years = (from: number, to: number, f: (y: number) => number | null = (y) => y - 2000): TrendDataPoint[] =>
  Array.from({ length: to - from + 1 }, (_, i) => ({ year: from + i, value: f(from + i) }));

const base = (series: TrendDataPoint[], extra: Partial<TrendCardData> = {}): TrendCardData => ({
  indicator: { name: 'Stopa bezrobocia', unit: '%' }, unitName: 'powiat X', series, ...extra,
});

function render(data: TrendCardData, fmt: ShareFormatKey = 'post') {
  const { width, height, safe } = SHARE_FORMATS[fmt];
  const scaleFactor = width / 1080;
  const safeWidth = width - safe.left - safe.right;
  const contentTop = safe.top + Math.round(120 * scaleFactor);
  const availableContentHeight = height - safe.bottom - Math.round(60 * scaleFactor) - contentTop;
  const fontScale = { xs: Math.round(14 * scaleFactor), sm: Math.round(16 * scaleFactor), md: Math.round(18 * scaleFactor), lg: Math.round(22 * scaleFactor), xl: Math.round(28 * scaleFactor) };
  const items: CardItem[] = [];
  renderTrendContent({ data, contentTop, availableContentHeight, safe, safeWidth, fontScale, colors, items, measure, scaleFactor });
  return { items, safe, safeWidth, contentTop, availableContentHeight };
}
const paths = (items: CardItem[]) => items.filter((i): i is PathItem => i.type === 'path');
const texts = (items: CardItem[]) => items.filter((i): i is TextItem => i.type === 'text');
const allText = (items: CardItem[]) => texts(items).flatMap((t) => t.lines);

describe('card-trend', () => {
  it('seria 2018–2024 bez braków → jeden segment, oś lat z 2018 i 2024', () => {
    const { items } = render(base(years(2018, 2024)));
    expect(paths(items)).toHaveLength(1);
    expect(paths(items)[0].stroke).toBe(colors.tusz);
    const lines = allText(items);
    expect(lines).toContain('2018');
    expect(lines).toContain('2024');
  });

  it('brak w 2021 → dwa segmenty (przerwa w linii)', () => {
    const { items } = render(base(years(2018, 2024, (y) => (y === 2021 ? null : y - 2000))));
    expect(paths(items)).toHaveLength(2);
  });

  it('za mało danych → tekst zamiast wykresu, brak PathItem', () => {
    const { items } = render(base([{ year: 2024, value: 5 }, { year: 2023, value: null }]));
    expect(paths(items)).toHaveLength(0);
    expect(allText(items)).toContain('Za mało danych do wykresu');
  });

  it('oś lat w formacie post: najwyżej 6 etykiet, żadna poza safeWidth', () => {
    const { items, safe, safeWidth } = render(base(years(2000, 2024)), 'post');
    const yearLabels = texts(items).filter((t) => t.lines.length === 1 && /^(19|20)\d\d$/.test(t.lines[0]));
    expect(yearLabels.length).toBeGreaterThanOrEqual(2);
    expect(yearLabels.length).toBeLessThanOrEqual(6);
    for (const t of yearLabels) {
      expect(t.x).toBeGreaterThanOrEqual(safe.left);
      expect(t.x + t.maxWidth).toBeLessThanOrEqual(safe.left + safeWidth);
    }
  });

  it('min i max oznaczone etykietami, ostatnia wartość kolorem korektaTekst', () => {
    const series = years(2018, 2024, (y) => [5, 3, 9, 6, 4, 7, 8][y - 2018]);
    const { items } = render(base(series, { minText: 'min 3 %', maxText: 'maks 9 %', lastText: '8 %' }));
    expect(allText(items)).toContain('min 3 %');
    expect(allText(items)).toContain('maks 9 %');
    const last = texts(items).find((t) => t.lines.includes('8 %'));
    expect(last?.color).toBe(colors.korektaTekst);
  });

  it('bez minText/maxText nie dodaje etykiet min/max', () => {
    const { items } = render(base(years(2018, 2024)));
    expect(allText(items).some((l) => /min|maks/.test(l))).toBe(false);
  });

  it('stałe wartości → bez NaN, linia pozioma pośrodku', () => {
    const { items, contentTop, availableContentHeight } = render(base(years(2018, 2024, () => 5)));
    const p = paths(items)[0];
    expect(p.d).not.toMatch(/NaN|Infinity/);
    const ys = [...p.d.matchAll(/[ML] [\d.-]+ ([\d.-]+)/g)].map((m) => Number(m[1]));
    expect(new Set(ys).size).toBe(1);
    expect(ys[0]).toBeGreaterThan(contentTop);
    expect(ys[0]).toBeLessThan(contentTop + availableContentHeight);
  });

  it.each(FORMATS)('wszystkie elementy mieszczą się w obszarze treści (%s)', (fmt) => {
    const series = years(2010, 2024, (y) => (y === 2015 ? null : 10 + ((y * 7) % 11)));
    const { items, safe, safeWidth, contentTop, availableContentHeight } = render(
      base(series, { minText: 'min 10,0 %', maxText: 'maks 20,0 %', lastText: '17,0 %' }), fmt);
    const L = safe.left, R = safe.left + safeWidth, T = contentTop, B = contentTop + availableContentHeight;
    // Zbieramy wszystkie prostokąty/punkty elementów i sprawdzamy jedną asercją.
    const boxes: [number, number, number, number][] = [];
    for (const it of items) {
      if (it.type === 'text') boxes.push([it.x, it.y, it.x + it.maxWidth, it.y + it.lines.length * it.lineHeight]);
      else if (it.type === 'rect') boxes.push([it.x, it.y, it.x + it.width, it.y + it.height]);
      else if (it.type === 'path') {
        for (const m of it.d.matchAll(/[ML] ([\d.-]+) ([\d.-]+)/g)) boxes.push([Number(m[1]), Number(m[2]), Number(m[1]), Number(m[2])]);
      }
    }
    const outside = boxes.filter(([x0, y0, x1, y1]) => x0 < L - 0.5 || x1 > R + 0.5 || y0 < T - 0.5 || y1 > B + 0.5);
    expect(boxes.length).toBeGreaterThan(10);
    expect(outside).toEqual([]);
  });

  it('oś pionowa ma 3 podziałki z siatką w kolorze linia', () => {
    const { items } = render(base(years(2018, 2024)));
    const grid = items.filter((i): i is RectItem => i.type === 'rect' && i.fill === colors.linia);
    expect(grid).toHaveLength(3);
  });
});
