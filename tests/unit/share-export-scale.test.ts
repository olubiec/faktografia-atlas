import { describe, expect, it } from 'vitest';
import type { CardData } from '../../src/core/share/card';
import { SHARE_FORMATS, type ShareFormatKey } from '../../src/core/share/formats';
import { buildExportScene } from '../../src/view/share/export-scene';

const measure = (text: string, size: number): number => Math.round(0.55 * size * text.length);

const data = {
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

describe('buildExportScene', () => {
  it.each(keys)('format %s: skala 2 daje dokładnie 2x wymiary formatu', (k) => {
    const s = buildExportScene('map', data, k, 'light', { measure, scale: 2 });
    expect(s.width).toBe(SHARE_FORMATS[k].width * 2);
    expect(s.height).toBe(SHARE_FORMATS[k].height * 2);
  });

  it.each(keys)('format %s: skala 1 daje dokładnie wymiary formatu', (k) => {
    const s = buildExportScene('map', data, k, 'light', { measure, scale: 1 });
    expect(s.width).toBe(SHARE_FORMATS[k].width);
    expect(s.height).toBe(SHARE_FORMATS[k].height);
  });

  it.each(keys)('format %s: liczba elementów sceny jest taka sama w obu skalach', (k) => {
    const a = buildExportScene('map', data, k, 'light', { measure, scale: 1 });
    const b = buildExportScene('map', data, k, 'light', { measure, scale: 2 });
    expect(b.items.length).toBe(a.items.length);
  });
});
