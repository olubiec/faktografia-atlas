import { describe, expect, it } from 'vitest';
import tokens from '../../config/tokens.json';
import { getThemeColors, type CardItem, type TextItem } from '../../src/core/share/card';
import { SHARE_FORMATS, type ShareFormatKey } from '../../src/core/share/formats';
import { renderBigNumberContent, type BigNumberCardData } from '../../src/core/share/card-bignumber';

const measure = (text: string, size: number): number => Math.round(0.55 * size * text.length);
const FORMATS = Object.keys(SHARE_FORMATS) as ShareFormatKey[];

const base: BigNumberCardData = {
  indicator: { name: 'Gęstość zaludnienia', unit: 'os./km²' },
  valueText: '3 465',
  rankText: '12. z 380 powiatów',
  unitName: 'Warszawa',
  year: 2024,
};

function render(data: BigNumberCardData, fmtKey: ShareFormatKey, theme: 'light' | 'dark' = 'light') {
  const { width, height, safe } = SHARE_FORMATS[fmtKey];
  const scaleFactor = width / 1080;
  const fs = (k: keyof typeof tokens.font.scale) => Math.round(tokens.font.scale[k] * scaleFactor);
  const fontScale = { xs: fs('xs'), sm: fs('sm'), md: fs('md'), lg: fs('lg'), xl: fs('xl'), '2xl': fs('2xl'), '3xl': fs('3xl'), '4xl': fs('4xl'), '5xl': fs('5xl') };
  const contentTop = safe.top + Math.round(120 * scaleFactor);
  const availableContentHeight = height - safe.bottom - Math.round(60 * scaleFactor) - contentTop;
  const safeWidth = width - safe.left - safe.right;
  const items: CardItem[] = [];
  const colors = getThemeColors(theme);
  renderBigNumberContent({ data, contentTop, availableContentHeight, safe, safeWidth, fontScale, colors, items, measure, scaleFactor });
  return { items, contentTop, availableContentHeight, safe, safeWidth, colors };
}

const texts = (items: CardItem[]) => items.filter((i): i is TextItem => i.type === 'text');
const annotations = (items: CardItem[]) => items.filter((i) => i.type === 'annotation');
const bigText = (items: CardItem[], value: string) => texts(items).find((t) => t.lines.join(' ') === value)!;

describe('renderBigNumberContent', () => {
  it.each(FORMATS)('liczba „3 465” mieści się w polu (%s)', (f) => {
    const { items, safeWidth } = render(base, f);
    const t = bigText(items, '3 465');
    expect(t).toBeDefined();
    expect(t.lines).toHaveLength(1);
    expect(measure(t.lines[0], t.fontSize)).toBeLessThanOrEqual(safeWidth);
  });

  it.each(FORMATS)('długi tekst zmniejsza czcionkę i nie wychodzi poza safeWidth (%s)', (f) => {
    const short = bigText(render(base, f).items, '3 465');
    const { items, safeWidth } = render({ ...base, valueText: '1 234 567 890 123,89' }, f);
    const t = bigText(items, '1 234 567 890 123,89');
    expect(t.fontSize).toBeLessThan(short.fontSize);
    expect(measure(t.lines[0], t.fontSize)).toBeLessThanOrEqual(safeWidth);
  });

  it.each(FORMATS)('dokładnie jedno zakreślenie (%s)', (f) => {
    expect(annotations(render(base, f).items)).toHaveLength(1);
    expect(annotations(render({ ...base, rankText: undefined }, f).items)).toHaveLength(1);
  });

  it('puste valueText → brak liczby, brak zakreśleń, brak wyjątku', () => {
    const { items } = render({ ...base, valueText: '' }, 'post');
    expect(annotations(items)).toHaveLength(0);
    expect(texts(items).some((t) => t.lines.join('') === '')).toBe(false);
  });

  it('rankText obecny tylko gdy podany; liczba nadal wyśrodkowana poziomo', () => {
    const withRank = render(base, 'post');
    const without = render({ ...base, rankText: undefined }, 'post');
    expect(texts(withRank.items).some((t) => t.lines.includes('12. z 380 powiatów'))).toBe(true);
    expect(texts(without.items).some((t) => t.lines.join(' ').includes('z 380'))).toBe(false);
    for (const { items, safe, safeWidth } of [withRank, without]) {
      const t = bigText(items, '3 465');
      const w = measure(t.lines[0], t.fontSize);
      const left = t.x + (t.maxWidth - w) / 2;
      expect(Math.abs(left + w / 2 - (safe.left + safeWidth / 2))).toBeLessThanOrEqual(1);
    }
  });

  it('nazwa wskaźnika, miejsce i jednostka są obecne', () => {
    const all = texts(render(base, 'post').items).map((t) => t.lines.join(' '));
    expect(all).toContain('Gęstość zaludnienia');
    expect(all).toContain('Warszawa');
    expect(all).toContain('os./km²');
  });

  it.each(FORMATS)('wszystkie elementy mieszczą się w obszarze treści (%s)', (f) => {
    const { items, contentTop, availableContentHeight, safe, safeWidth } = render(base, f);
    for (const it of texts(items)) {
      expect(it.y).toBeGreaterThanOrEqual(contentTop);
      expect(it.y + it.lines.length * it.lineHeight).toBeLessThanOrEqual(contentTop + availableContentHeight);
      expect(it.x).toBeGreaterThanOrEqual(safe.left);
      expect(it.x + it.maxWidth).toBeLessThanOrEqual(safe.left + safeWidth);
    }
    const a = annotations(items)[0] as Extract<CardItem, { type: 'annotation' }>;
    expect(a.y + a.height).toBeLessThanOrEqual(contentTop + availableContentHeight);
    expect(a.y).toBeGreaterThanOrEqual(contentTop);
  });

  it.each(['light', 'dark'] as const)('kolory z getThemeColors (%s)', (theme) => {
    const { items, colors } = render(base, 'post', theme);
    expect(bigText(items, '3 465').color).toBe(colors.tusz);
    expect((annotations(items)[0] as { color: string }).color).toBe(colors.korekta);
    expect(texts(items).find((t) => t.lines.includes('12. z 380 powiatów'))!.color).toBe(colors.korektaTekst);
  });
});
