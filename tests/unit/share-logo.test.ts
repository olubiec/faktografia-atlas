import { describe, expect, it } from 'vitest';
import { cardScene } from '../../src/core/share/card';
import { readFileSync } from 'node:fs';
import { LOGO_ASPECT, logoSize, withIntrinsicSize } from '../../src/core/share/logo';

describe('logo na karcie', () => {
  it('proporcje zgadzają się z viewBox plików w public/brand', () => {
    for (const f of ['granat', 'jasne']) {
      const svg = readFileSync(`public/brand/faktografia-logo-${f}.svg`, 'utf8');
      const m = svg.match(/viewBox="[-\d.]+ [-\d.]+ ([\d.]+) ([\d.]+)"/);
      expect(Number(m![1]) / Number(m![2])).toBeCloseTo(LOGO_ASPECT, 2);
    }
  });
  it('logoSize zachowuje proporcje', () => {
    const s = logoSize(56);
    expect(s.width / s.height).toBeCloseTo(LOGO_ASPECT, 1);
  });
  it('withIntrinsicSize dopisuje wymiary z viewBox', () => {
    const out = withIntrinsicSize('<svg viewBox="-30 -46 312.2 110.0" xmlns="x"><path/></svg>');
    expect(out).toContain('width="312.2"');
    expect(out).toContain('height="110.0"');
  });
  it('withIntrinsicSize nie nadpisuje istniejących wymiarów', () => {
    const src = '<svg width="10" height="20" viewBox="0 0 5 5"></svg>';
    expect(withIntrinsicSize(src)).toBe(src);
  });
  it('pliki logo w repo faktycznie nie mają wymiarów (powód poprawki)', () => {
    const svg = readFileSync('public/brand/faktografia-logo-granat.svg', 'utf8');
    expect(/<svg\b[^>]*\swidth=/.test(svg.match(/<svg\b[^>]*>/)![0])).toBe(false);
  });
  it('logo na karcie ma proporcje pliku i wskazuje public/brand', () => {
    const scene = cardScene(
      'ranking',
      { indicator: { name: 'Bezrobocie', unit: '%' }, year: 2024, selectedTeryt: '1', items: [] } as never,
      'square',
      'light',
      { measure: (t: string, sz: number) => t.length * sz * 0.55, siteUrl: 'faktografia.pl' },
    );
    const logo = scene.items.find((i): i is Extract<typeof i, { type: 'image' }> => i.type === 'image')!;
    expect(logo.src).toContain('public/brand/');
    expect(logo.width / logo.height).toBeCloseTo(LOGO_ASPECT, 1);
  });
});
