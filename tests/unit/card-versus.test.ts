import { describe, expect, it } from 'vitest';
import tokens from '../../config/tokens.json';
import { getThemeColors, type CardItem, type TextItem } from '../../src/core/share/card';
import { SHARE_FORMATS, type ShareFormatKey } from '../../src/core/share/formats';
import { renderVersusContent, type VersusCardData } from '../../src/core/share/card-versus';

const measure = (text: string, size: number): number => Math.round(0.55 * size * text.length);
const FORMATS = Object.keys(SHARE_FORMATS) as ShareFormatKey[];

const base: VersusCardData = {
  indicator: { name: 'Stopa bezrobocia', unit: '%' },
  year: 2024,
  a: { name: 'Powiat opolski', valueText: '5,4' },
  b: { name: 'Powiat nyski', valueText: '4,2' },
  diffText: 'A wyżej o 1,2 p.p.',
};
const LONG = 'Powiat kędzierzyńsko-kozielski';

function render(data: VersusCardData, fmtKey: ShareFormatKey, theme: 'light' | 'dark' = 'light') {
  const { width, height, safe } = SHARE_FORMATS[fmtKey];
  const scaleFactor = width / 1080;
  const fs = (k: keyof typeof tokens.font.scale) => Math.round(tokens.font.scale[k] * scaleFactor);
  const fontScale = { xs: fs('xs'), sm: fs('sm'), md: fs('md'), lg: fs('lg'), xl: fs('xl'), '2xl': fs('2xl'), '3xl': fs('3xl'), '4xl': fs('4xl'), '5xl': fs('5xl') };
  const contentTop = safe.top + Math.round(120 * scaleFactor);
  const availableContentHeight = height - safe.bottom - Math.round(60 * scaleFactor) - contentTop;
  const safeWidth = width - safe.left - safe.right;
  const items: CardItem[] = [];
  const colors = getThemeColors(theme);
  renderVersusContent({ data, contentTop, availableContentHeight, safe, safeWidth, fontScale, colors, items, measure, scaleFactor });
  return { items, contentTop, availableContentHeight, safe, safeWidth, colors };
}

const texts = (items: CardItem[]) => items.filter((i): i is TextItem => i.type === 'text');
const annotations = (items: CardItem[]) => items.filter((i) => i.type === 'annotation');
const find = (items: CardItem[], s: string) => texts(items).find((t) => t.lines.join(' ').includes(s))!;

describe('renderVersusContent', () => {
  it.each(FORMATS)('dwie nazwy i słowna różnica są w scenie (%s)', (f) => {
    const { items } = render(base, f);
    expect(find(items, 'Powiat opolski')).toBeDefined();
    expect(find(items, 'Powiat nyski')).toBeDefined();
    expect(find(items, 'wyżej o 1,2 p.p.')).toBeDefined();
    expect(find(items, '5,4')).toBeDefined();
    expect(find(items, '4,2')).toBeDefined();
  });

  it.each(FORMATS)('najdłuższe nazwy mieszczą się w polu (%s)', (f) => {
    const { items, safe, safeWidth } = render({ ...base, a: { ...base.a, name: LONG }, b: { ...base.b, name: LONG } }, f);
    const names = texts(items).filter((t) => t.lines.join(' ').includes('kozielski') || t.lines.join(' ').includes('kędzierzyńsko'));
    expect(names.length).toBeGreaterThanOrEqual(2);
    for (const t of names) {
      expect(t.lines.length).toBeLessThanOrEqual(2);
      expect(t.x).toBeGreaterThanOrEqual(safe.left);
      expect(t.x + t.maxWidth).toBeLessThanOrEqual(safe.left + safeWidth);
      for (const l of t.lines) expect(measure(l, t.fontSize)).toBeLessThanOrEqual(t.maxWidth);
    }
  });

  it.each(['light', 'dark'] as const)('kolory tylko neutralne (%s)', (theme) => {
    const { colors } = render(base, 'post', theme);
    const allowed = new Set([colors.tusz, colors.olowek, colors.linia, colors.korekta, colors.kalka]);
    const used: string[] = [];
    for (const f of FORMATS) {
      for (const it of render(base, f, theme).items) {
        const o = it as { color?: string; fill?: string; stroke?: string };
        used.push(...[o.color, o.fill, o.stroke].filter((v): v is string => v !== undefined));
      }
    }
    expect(used.length).toBeGreaterThan(0);
    expect(used.filter((c) => !allowed.has(c))).toEqual([]);
  });

  it.each(['post', 'story'] as const)('układ pionowy: A nad B (%s)', (f) => {
    const { items } = render(base, f);
    const a = find(items, 'Powiat opolski');
    const b = find(items, 'Powiat nyski');
    expect(a.y).toBeLessThan(b.y);
    expect(Math.abs(a.x - b.x)).toBeLessThanOrEqual(1);
  });

  it('układ poziomy w wide: A po lewej, B po prawej, na tej samej wysokości', () => {
    const { items } = render(base, 'wide');
    const a = find(items, 'Powiat opolski');
    const b = find(items, 'Powiat nyski');
    expect(a.x).toBeLessThan(b.x);
    expect(a.y).toBe(b.y);
  });

  it.each(FORMATS)('najwyżej jedno zakreślenie (%s)', (f) => {
    expect(annotations(render(base, f).items).length).toBeLessThanOrEqual(1);
    expect(annotations(render({ ...base, diffText: '' }, f).items).length).toBeLessThanOrEqual(1);
  });

  it('pusty diffText → brak pustej linii, brak zakreślenia, bez wyjątku', () => {
    const { items } = render({ ...base, diffText: '' }, 'post');
    expect(texts(items).some((t) => t.lines.join('').trim() === '')).toBe(false);
    expect(annotations(items)).toHaveLength(0);
    expect(find(items, 'Powiat opolski')).toBeDefined();
  });

  it.each(FORMATS)('wszystko w obszarze treści (%s)', (f) => {
    const data = { ...base, a: { ...base.a, name: LONG }, b: { ...base.b, name: LONG } };
    const { items, contentTop, availableContentHeight, safe, safeWidth } = render(data, f);
    for (const it of texts(items)) {
      expect(it.y).toBeGreaterThanOrEqual(contentTop);
      expect(it.y + it.lines.length * it.lineHeight).toBeLessThanOrEqual(contentTop + availableContentHeight);
      expect(it.x).toBeGreaterThanOrEqual(safe.left);
      expect(it.x + it.maxWidth).toBeLessThanOrEqual(safe.left + safeWidth);
    }
    for (const a of annotations(items) as Extract<CardItem, { type: 'annotation' }>[]) {
      expect(a.y).toBeGreaterThanOrEqual(contentTop);
      expect(a.y + a.height).toBeLessThanOrEqual(contentTop + availableContentHeight);
      expect(a.x).toBeGreaterThanOrEqual(safe.left);
      expect(a.x + a.width).toBeLessThanOrEqual(safe.left + safeWidth);
    }
  });
});
