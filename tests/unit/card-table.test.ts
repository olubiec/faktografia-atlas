import { describe, expect, it } from 'vitest';
import tokens from '../../config/tokens.json';
import { getThemeColors, type CardItem, type CardTheme, type TextItem } from '../../src/core/share/card';
import { SHARE_FORMATS, type ShareFormatKey } from '../../src/core/share/formats';
import { renderTableContent, type TableCardRow } from '../../src/core/share/card-table';

const measure = (text: string, size: number): number => Math.round(0.55 * size * text.length);
const LONGEST = 'Przeciętna pow. użytkowa mieszkania na osobę (m²)';
const FORMATS: ShareFormatKey[] = ['post', 'square', 'story', 'wide'];

function render(rows: TableCardRow[], formatKey: ShareFormatKey = 'post', theme: CardTheme = 'light') {
  const { width, height, safe } = SHARE_FORMATS[formatKey];
  const scaleFactor = width / 1080;
  const fontScale: Record<string, number> = {};
  for (const [k, v] of Object.entries(tokens.font.scale)) fontScale[k] = Math.round(v * scaleFactor);
  const contentTop = Math.round(200 * scaleFactor);
  const contentBottom = height - safe.bottom - Math.round(60 * scaleFactor);
  const availableContentHeight = contentBottom - contentTop;
  const colors = getThemeColors(theme);
  const items: CardItem[] = [];
  renderTableContent({
    data: { unitName: 'Kraków', year: 2024, rows }, contentTop, availableContentHeight,
    safe, safeWidth: width - safe.left - safe.right, fontScale, colors, items, measure, scaleFactor,
  });
  return { items, contentTop, contentBottom, width, safe, colors };
}

const makeRows = (n: number, name = 'Wskaźnik'): TableCardRow[] =>
  Array.from({ length: n }, (_, i) => ({ name: `${name} ${i + 1}`, valueText: '12,3 %', rank: `${i + 1}. z 380` }));

const texts = (items: CardItem[]) => items.filter((i): i is TextItem => i.type === 'text');

function bottomOf(it: CardItem): number {
  if (it.type === 'text') return it.y + it.lines.length * it.lineHeight;
  if (it.type === 'rect') return it.y + it.height;
  return 0;
}

describe('renderTableContent', () => {
  it.each(FORMATS)('najdłuższa nazwa mieści się w polu kolumny (%s)', (fmt) => {
    const { items, width, safe } = render([{ name: LONGEST, valueText: '28,4 m²', rank: '12. z 380' }], fmt);
    const name = texts(items).find((t) => t.lines.join(' ').includes('Przeciętna'));
    expect(name).toBeDefined();
    expect(name!.lines.length).toBeLessThanOrEqual(2);
    for (const t of texts(items)) {
      expect(t.x + t.maxWidth).toBeLessThanOrEqual(width - safe.right);
      for (const line of t.lines) expect(measure(line, t.fontSize)).toBeLessThanOrEqual(t.maxWidth);
    }
  });

  it('8 wierszy w post mieści się w obszarze treści', () => {
    const { items, contentTop, contentBottom } = render(makeRows(8));
    expect(items.length).toBeGreaterThan(8);
    for (const it of items) {
      if (it.type !== 'text' && it.type !== 'rect') continue;
      expect(it.y).toBeGreaterThanOrEqual(contentTop);
      expect(bottomOf(it)).toBeLessThanOrEqual(contentBottom);
    }
  });

  it.each(FORMATS)('dużo wierszy (150): rysuje tyle, ile się mieści, i wiersz „jeszcze N” (%s)', (fmt) => {
    const { items, contentTop, contentBottom } = render(makeRows(150), fmt);
    const more = texts(items).find((t) => /^… jeszcze \d+ wskaźnik/.test(t.lines[0]));
    expect(more).toBeDefined();
    const n = Number(/\d+/.exec(more!.lines[0])![0]);
    const drawn = texts(items).filter((t) => /^Wskaźnik \d+$/.test(t.lines[0])).length;
    expect(drawn).toBeGreaterThan(0);
    expect(drawn + n).toBe(150);
    for (const it of items) {
      if (it.type !== 'text' && it.type !== 'rect') continue;
      expect(it.y).toBeGreaterThanOrEqual(contentTop);
      expect(bottomOf(it)).toBeLessThanOrEqual(contentBottom);
    }
  });

  it('wiersz selected ma korektaTekst, pozostałe tusz', () => {
    const rows = makeRows(3);
    rows[1].selected = true;
    const { items, colors } = render(rows);
    const byName = (n: string) => texts(items).find((t) => t.lines[0] === n)!;
    expect(byName('Wskaźnik 2').color).toBe(colors.korektaTekst);
    expect(byName('Wskaźnik 1').color).toBe(colors.tusz);
    expect(byName('Wskaźnik 3').color).toBe(colors.tusz);
  });

  it('puste rows nie rzuca wyjątku i nie wychodzi poza obszar', () => {
    const { items, contentTop, contentBottom } = render([]);
    expect(items.length).toBeLessThanOrEqual(4);
    for (const it of items) {
      expect(it.y).toBeGreaterThanOrEqual(contentTop);
      expect(bottomOf(it)).toBeLessThanOrEqual(contentBottom);
    }
  });

  it('wartość i miejsce są wyrównane do prawej, nagłówek ma kolor olowek', () => {
    const { items, colors } = render(makeRows(2));
    const values = texts(items).filter((t) => t.lines[0] === '12,3 %');
    expect(values).toHaveLength(2);
    for (const v of values) expect(v.align).toBe('right');
    const rank = texts(items).find((t) => t.lines[0] === '1. z 380')!;
    expect(rank.align).toBe('right');
    for (const label of ['Wskaźnik', 'Wartość', 'Miejsce']) {
      const h = texts(items).find((t) => t.lines[0] === label)!;
      expect(h.color).toBe(colors.olowek);
    }
  });

  it('linia rozdzielająca ma wysokość 1 px·scale i kolor linia', () => {
    const { items, colors } = render(makeRows(2), 'post');
    const lines = items.filter((i) => i.type === 'rect');
    expect(lines.length).toBeGreaterThan(0);
    for (const l of lines) {
      expect(l.type === 'rect' && l.height).toBe(1);
      expect(l.type === 'rect' && l.fill).toBe(colors.linia);
    }
  });

  it.each<CardTheme>(['light', 'dark'])('każdy kolor pochodzi z getThemeColors (%s)', (theme) => {
    const rows = makeRows(150);
    rows[0].selected = true;
    const { items, colors } = render(rows, 'story', theme);
    const allowed = new Set<string>([colors.kalka, colors.arkusz, colors.linia, colors.tusz, colors.olowek, colors.korekta, colors.korektaTekst]);
    const used = items.flatMap((it) => (it.type === 'text' ? [it.color] : it.type === 'rect' && it.fill ? [it.fill] : []));
    expect(used.length).toBeGreaterThan(0);
    expect(used.every((c) => allowed.has(c))).toBe(true);
  });
});
