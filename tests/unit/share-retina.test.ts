import { describe, expect, it } from 'vitest';
import { cardScene, scaleCardScene, type CardData } from '../../src/core/share/card';
import { SHARE_FORMATS, scaleFormat, type ShareFormatKey } from '../../src/core/share/formats';

const measure = (text: string, size: number): number => Math.round(0.55 * size * text.length);

const data: CardData = {
  indicator: { name: 'Gęstość zaludnienia', unit: 'os./km²', year: 2024 },
  year: 2024,
  unitName: 'województwa',
  features: [
    {
      type: 'Feature',
      properties: { teryt: '12' },
      geometry: { type: 'Polygon', coordinates: [[[19, 49.5], [21, 49.5], [21, 50.5], [19, 50.5], [19, 49.5]]] },
    },
  ],
  classOf: { '12': 2 },
  selectedTeryt: '12',
} as unknown as CardData;

const keys = Object.keys(SHARE_FORMATS) as ShareFormatKey[];

describe('scaleFormat', () => {
  it.each(keys)('format %s: scale 1 zwraca te same wymiary', (k) => {
    expect(scaleFormat(SHARE_FORMATS[k], 1)).toEqual(SHARE_FORMATS[k]);
  });

  it.each(keys)('format %s: scale 2 podwaja wymiary i safe, zachowując proporcje', (k) => {
    const f = SHARE_FORMATS[k];
    const s = scaleFormat(f, 2);
    expect(s.width).toBe(f.width * 2);
    expect(s.height).toBe(f.height * 2);
    expect(s.safe).toEqual({ top: f.safe.top * 2, bottom: f.safe.bottom * 2, left: f.safe.left * 2, right: f.safe.right * 2 });
    expect(s.width / s.height).toBeCloseTo(f.width / f.height, 10);
    expect(s.safe.top / s.height).toBeCloseTo(f.safe.top / f.height, 10);
  });
});

describe('cardScene scale 2', () => {
  it.each(keys)('format %s: pozycje i rozmiary są dokładnie 2x sceny bazowej', (k) => {
    const base = cardScene('map', data, k, 'light', { measure });
    const retina = cardScene('map', data, k, 'light', { measure, scale: 2 });
    expect(retina.width).toBe(base.width * 2);
    expect(retina.height).toBe(base.height * 2);
    expect(retina.items).toHaveLength(base.items.length);
    const geom = (items: typeof base.items) => items.map((it) => {
      if (it.type === 'text') return [it.type, it.x, it.y, it.maxWidth, it.fontSize, it.lineHeight, it.lines.join('|')];
      if (it.type === 'path') return [it.type, it.strokeWidth ?? 0];
      return [it.type, it.x, it.y, it.width, it.height];
    });
    const expected = geom(base.items).map((r) => r.map((v, i) => (typeof v === 'number' && !(r[0] === 'path') ? v * 2 : r[0] === 'path' && i === 1 ? (v as number) * 2 : v)));
    expect(geom(retina.items)).toEqual(expected);
  });

  it('elementy mieszczą się w skalowanym polu safe', () => {
    const f = scaleFormat(SHARE_FORMATS.story, 2);
    const scene = cardScene('map', data, 'story', 'light', { measure, scale: 2 });
    const boxed = scene.items.filter((it) => it.type === 'text' || it.type === 'image') as { x: number; y: number }[];
    expect(boxed.length).toBeGreaterThan(0);
    expect(Math.min(...boxed.map((b) => b.x))).toBeGreaterThanOrEqual(f.safe.left);
    expect(Math.min(...boxed.map((b) => b.y))).toBeGreaterThanOrEqual(f.safe.top);
    expect(Math.max(...boxed.map((b) => b.y))).toBeLessThanOrEqual(f.height - f.safe.bottom);
  });

  it('domyślnie scale 1 nie zmienia sceny', () => {
    const a = cardScene('map', data, 'post', 'light', { measure });
    const b = cardScene('map', data, 'post', 'light', { measure, scale: 1 });
    expect(b).toEqual(a);
  });
});

describe('scaleCardScene path', () => {
  it('mnoży współrzędne ścieżki i grubość obrysu', () => {
    const scene = { width: 10, height: 10, background: '#000', items: [{ type: 'path' as const, d: 'M1.5,2L3,4Z', stroke: '#fff', strokeWidth: 0.5 }] };
    const r = scaleCardScene(scene, 2);
    expect(r.items[0]).toMatchObject({ d: 'M3,4L6,8Z', strokeWidth: 1 });
  });
});
