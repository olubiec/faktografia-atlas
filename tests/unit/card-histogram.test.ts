import { describe, expect, it } from 'vitest';
import tokens from '../../config/tokens.json';
import { classify, computeBreaks } from '../../src/core/map/classes';
import { SHARE_FORMATS, type ShareFormatKey } from '../../src/core/share/formats';
import { getThemeColors, type CardItem, type CardTheme, type RectItem, type TextItem } from '../../src/core/share/card';
import { histogramCounts, renderHistogramContent, type HistogramCardData } from '../../src/core/share/card-histogram';

const measure = (text: string, size: number): number => Math.round(0.55 * size * text.length);
const FORMATS: ShareFormatKey[] = ['post', 'square', 'story', 'wide'];

// Stałe, deterministyczne wartości (bez losowości).
const VALUES20 = Array.from({ length: 20 }, (_, i) => Math.round(((i * 37) % 23) * 1.7 * 10) / 10);

function render(data: Partial<HistogramCardData>, fmtKey: ShareFormatKey = 'post', theme: CardTheme = 'light') {
  const fmt = SHARE_FORMATS[fmtKey];
  const scaleFactor = fmt.width / 1080;
  const safe = fmt.safe;
  const safeWidth = fmt.width - safe.left - safe.right;
  const contentTop = safe.top + 200 * scaleFactor;
  const contentBottom = fmt.height - safe.bottom - 40 * scaleFactor;
  const fontScale: Record<string, number> = {};
  for (const [k, v] of Object.entries(tokens.font.scale)) fontScale[k] = Math.round(v * scaleFactor);
  const items: CardItem[] = [];
  renderHistogramContent({
    data: { indicator: { name: 'X' }, year: 2024, levelName: 'powiaty', values: VALUES20, ...data },
    contentTop, availableContentHeight: contentBottom - contentTop, safe, safeWidth, fontScale,
    colors: getThemeColors(theme), items, measure, scaleFactor,
  });
  return { items, contentTop, contentBottom, safe, fmt };
}
const rects = (items: CardItem[]) => items.filter((i): i is RectItem => i.type === 'rect');
const texts = (items: CardItem[]) => items.filter((i): i is TextItem => i.type === 'text');

describe('histogramCounts', () => {
  it.each(['quantile', 'equal'] as const)('suma słupków = liczba jednostek (%s)', (method) => {
    const values = [...VALUES20, null, NaN];
    const r = histogramCounts(values, method, 'sequential');
    expect(r.counts).toHaveLength(5);
    expect(r.counts.reduce((a, b) => a + b, 0) + r.noData).toBe(values.length);
  });

  it('null i NaN trafiają do „brak danych”', () => {
    const r = histogramCounts([1, 2, null, NaN, undefined as unknown as null], 'equal', 'sequential');
    expect(r.noData).toBe(3);
  });

  it('klasyfikacja zgodna z mapą (classify)', () => {
    const breaks = computeBreaks(VALUES20, 'quantile', 5);
    const expected = [0, 0, 0, 0, 0];
    for (const v of VALUES20) expected[classify(v, breaks) as number]++;
    const r = histogramCounts(VALUES20, 'quantile', 'sequential');
    expect(r.counts).toEqual(expected);
    expect(r.breaks).toEqual(breaks);
  });

  it('gotowe progi mają pierwszeństwo przed metodą', () => {
    const r = histogramCounts([1, 5, 9], { breaks: [2, 4, 6, 8] }, 'sequential');
    expect(r.counts).toEqual([1, 0, 1, 0, 1]);
  });

  it('pusta lista → same zera, bez wyjątku', () => {
    const r = histogramCounts([], 'quantile', 'sequential');
    expect(r.counts.every((c) => c === 0)).toBe(true);
    expect(r.noData).toBe(0);
    expect(() => render({ values: [] })).not.toThrow();
  });

  it('wszystkie wartości równe → bez dzielenia przez zero, jedna klasa', () => {
    for (const method of ['quantile', 'equal'] as const) {
      const r = histogramCounts([7, 7, 7, 7], method, 'sequential');
      expect(r.counts.filter((c) => c > 0)).toHaveLength(1);
      expect(r.counts.reduce((a, b) => a + b, 0)).toBe(4);
    }
    const { items } = render({ values: [7, 7, 7, 7] });
    expect(rects(items).every((r) => Number.isFinite(r.height) && Number.isFinite(r.y))).toBe(true);
  });
});

describe('renderHistogramContent', () => {
  it('rysuje 6 słupków, najwyższy ma pełną wysokość, reszta proporcjonalnie', () => {
    const { items } = render({});
    const bars = rects(items);
    expect(bars).toHaveLength(6);
    const counts = histogramCounts(VALUES20, 'quantile', 'sequential');
    const all = [...counts.counts, counts.noData];
    const maxH = Math.max(...bars.map((b) => b.height));
    all.forEach((c, i) => expect(Math.abs(bars[i].height - (c / Math.max(...all)) * maxH)).toBeLessThanOrEqual(1));
  });

  it('liczba jednostek jest wypisana nad każdym słupkiem', () => {
    const { items } = render({});
    const r = histogramCounts(VALUES20, 'quantile', 'sequential');
    const labels = texts(items).map((t) => t.lines.join(' '));
    for (const c of [...r.counts, r.noData]) expect(labels).toContain(String(c));
  });

  it('słupek klasy wybranego miejsca ma obrys korekta; pozostałe nie', () => {
    const colors = getThemeColors('light');
    const selectedValue = VALUES20[3];
    const idx = classify(selectedValue, computeBreaks(VALUES20, 'quantile', 5)) as number;
    const bars = rects(render({ selectedValue }).items);
    expect(bars.map((b) => b.stroke)).toEqual(bars.map((_, i) => (i === idx ? colors.korekta : undefined)));
    expect(bars.filter((b) => b.stroke).length).toBe(1);
  });

  it('wybrane miejsce bez danych → obrys na słupku „brak danych”', () => {
    const withNull = rects(render({ values: [...VALUES20, null], selectedValue: NaN }).items);
    expect(withNull[5].stroke).toBe(getThemeColors('light').korekta);
  });

  it('brak selectedValue → brak obrysu', () => {
    expect(rects(render({}).items).some((b) => b.stroke)).toBe(false);
  });

  it.each(['light', 'dark'] as const)('kolory słupków z tokenów (%s)', (theme) => {
    const bars = rects(render({}, 'post', theme).items);
    for (let i = 0; i < 5; i++) expect(bars[i].fill).toBe(tokens.data.sequential[theme][i]);
    expect(bars[5].fill).toBe(tokens.data.noData[theme]);
  });

  it('schemat rozbieżny używa palety diverging', () => {
    const bars = rects(render({ scheme: 'diverging' }).items);
    expect(bars[0].fill).toBe(tokens.data.diverging.light[0]);
  });

  it.each(FORMATS)('elementy mieszczą się w obszarze treści, etykiety nie nachodzą (%s)', (fmtKey) => {
    const { items, contentTop, contentBottom, safe, fmt } = render({ selectedValue: VALUES20[0] }, fmtKey);
    const left = safe.left;
    const right = fmt.width - safe.right;
    for (const r of rects(items)) {
      expect(r.x).toBeGreaterThanOrEqual(left);
      expect(r.x + r.width).toBeLessThanOrEqual(right);
      expect(r.y).toBeGreaterThanOrEqual(contentTop);
      expect(r.y + r.height).toBeLessThanOrEqual(contentBottom);
    }
    for (const t of texts(items)) {
      expect(t.x).toBeGreaterThanOrEqual(left);
      expect(t.x + t.maxWidth).toBeLessThanOrEqual(right);
      expect(t.y).toBeGreaterThanOrEqual(contentTop);
      expect(t.y + t.lines.length * t.lineHeight).toBeLessThanOrEqual(contentBottom);
    }
    // Etykiety przedziałów (najniższy wiersz tekstu) – sąsiednie pola się nie przecinają.
    const maxY = Math.max(...texts(items).map((t) => t.y));
    const labels = texts(items).filter((t) => t.y === maxY).sort((a, b) => a.x - b.x);
    expect(labels).toHaveLength(6);
    for (let i = 1; i < labels.length; i++) expect(labels[i - 1].x + labels[i - 1].maxWidth).toBeLessThanOrEqual(labels[i].x);
  });

  it('etykiety przedziałów: pierwszy „do”, ostatni „od”, środkowe „a – b”', () => {
    const labels = texts(render({ values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], method: 'equal' }).items);
    const text = labels.map((t) => t.lines.join(' '));
    expect(text.some((s) => s.includes(' – '))).toBe(true);
    expect(text).toContain('brak danych');
  });
});
