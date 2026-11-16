import { describe, expect, it } from 'vitest';
import { paginate, pageLabel } from '../../src/core/share/pagination';
import { cardPages } from '../../src/core/share/card-pages';
import { cardScene, type CardScene, type ImageItem, type TextItem } from '../../src/core/share/card';
import { SHARE_FORMATS, type ShareFormatKey } from '../../src/core/share/formats';

const measure = (t: string, size: number) => Math.round(0.55 * size * t.length);
const mapData = { indicator: { name: 'Gęstość zaludnienia', unit: 'os./km²' }, year: 2025 } as never;

describe('paginate', () => {
  it('dzieli na strony i podaje etykietę n/N', () => {
    const pages = paginate([1, 2, 3, 4, 5], 2);
    expect(pages.map((p) => p.items)).toEqual([[1, 2], [3, 4], [5]]);
    expect(pages.map((p) => p.label)).toEqual(['1/3', '2/3', '3/3']);
    expect(pageLabel(2, 7)).toBe('2/7');
  });
  it('pusta lista daje jedną stronę 1/1', () => {
    const pages = paginate([], 10);
    expect(pages).toHaveLength(1);
    expect(pages[0].label).toBe('1/1');
  });
});

describe('cardPages', () => {
  it('ranking 25 pozycji = 3 strony z ciągłą numeracją', () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ name: `J${i}`, value: i }));
    const pages = cardPages('ranking', { indicator: { name: 'X' }, year: 2025, items });
    expect(pages).toHaveLength(3);
    expect((pages[1].data as { items: { rank: number }[] }).items[0].rank).toBe(11);
    expect(pages[2].page).toEqual({ number: 3, total: 3 });
  });
  it('mapa to jedna strona', () => {
    expect(cardPages('map', mapData)).toHaveLength(1);
  });
});

function logoAndText(scene: CardScene) {
  const logo = scene.items.find((i): i is ImageItem => i.type === 'image')!;
  const texts = scene.items.filter((i): i is TextItem => i.type === 'text');
  return { logo, texts };
}

describe.each(Object.keys(SHARE_FORMATS) as ShareFormatKey[])('proporcje karty: %s', (key) => {
  const fmt = SHARE_FORMATS[key];
  const scene = cardScene('map', mapData, key, 'light', { measure });

  it('logo ma proporcje pliku i leży w polu safe', () => {
    const { logo } = logoAndText(scene);
    expect(logo.src).toContain('public/brand/faktografia-logo-granat.svg');
    expect(logo.width / logo.height).toBeCloseTo(312.2 / 110, 1);
    expect(logo.x).toBe(fmt.safe.left);
    expect(logo.y).toBe(fmt.safe.top);
    expect(logo.height / (fmt.width / 1080)).toBeCloseTo(60, 0);
    expect(logo.x + logo.width).toBeLessThanOrEqual(fmt.width - fmt.safe.right);
  });

  it('logo jest małe względem karty (5–12% szerokości)', () => {
    const { logo } = logoAndText(scene);
    expect(logo.width / fmt.width).toBeGreaterThan(0.05);
    expect(logo.width / fmt.width).toBeLessThan(0.3);
  });

  it('teksty mieszczą się w marginesach safe', () => {
    const { texts } = logoAndText(scene);
    for (const t of texts) {
      const left = t.align === 'right' ? t.x - t.maxWidth : t.x;
      expect(left).toBeGreaterThanOrEqual(fmt.safe.left - 1);
      expect(left + t.maxWidth).toBeLessThanOrEqual(fmt.width - fmt.safe.right + 1);
      const bottom = t.y + t.lines.length * t.lineHeight;
      expect(bottom).toBeLessThanOrEqual(fmt.height - fmt.safe.bottom + 1);
    }
  });

  it('plakietka n/N pojawia się tylko przy wielu stronach i mieści się w safe', () => {
    expect(scene.items.some((i) => i.type === 'text' && i.lines[0] === '2/3')).toBe(false);
    const paged = cardScene('map', mapData, key, 'light', { measure, page: { number: 2, total: 3 } });
    const badge = paged.items.find((i): i is TextItem => i.type === 'text' && i.lines[0] === '2/3')!;
    expect(badge).toBeDefined();
    expect(badge.x).toBeLessThanOrEqual(fmt.width - fmt.safe.right);
    expect(badge.y).toBeGreaterThanOrEqual(fmt.safe.top - 1);
  });
});
