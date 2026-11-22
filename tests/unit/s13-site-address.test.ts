import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cardScene, type CardData, type CardKind, type TextItem } from '../../src/core/share/card';
import { SHARE_FORMATS, type ShareFormatKey } from '../../src/core/share/formats';

const measure = (text: string, size: number): number => Math.round(0.55 * size * text.length);

const DATA = {
  map: {
    indicator: { name: 'Gęstość zaludnienia', unit: 'os./km²', year: 2024 }, year: 2024, unitName: 'województwa',
    features: [{ type: 'Feature', properties: { teryt: '12' }, geometry: { type: 'Polygon', coordinates: [[[19, 49.5], [21, 49.5], [21, 50.5], [19, 50.5], [19, 49.5]]] } }],
    classOf: { '12': 3 }, selectedTeryt: '12',
  },
  ranking: {
    indicator: { name: 'Stopa bezrobocia', unit: '%' }, year: 2024, selectedTeryt: '1600',
    items: Array.from({ length: 5 }, (_, i) => ({ teryt: `${1600 + i}`, name: `Powiat ${i}`, value: 10 - i, valueText: `${10 - i}%`, rank: i + 1, selected: i === 0 })),
  },
  profile: {
    unitName: 'Powiat kędzierzyńsko-kozielski', teryt: '1603', indicatorName: 'Gęstość zaludnienia', unit: 'os./km²', year: 2024,
    bigNumber: '125,4', rankText: '3. miejsce', indicators: [{ name: 'Lesistość', value: '28,4', unit: '%' }],
  },
  compare: {
    indicatorName: 'Gęstość zaludnienia', year: 2024, unitA: { name: 'Powiat A', teryt: '1603' }, unitB: { name: 'Powiat B', teryt: '1610' },
    rows: [{ indicatorName: 'Lesistość', valA: '28,4%', valB: '32,1%', diffText: 'niżej o 3,7 p.p.' }],
  },
} as unknown as Record<string, CardData>;

describe('S13 adres strony na kartach', () => {
  (Object.keys(DATA) as CardKind[]).forEach((kind) => {
    (Object.keys(SHARE_FORMATS) as ShareFormatKey[]).forEach((fmt) => {
      it(`karta ${kind} / ${fmt} domyślnie podpisana faktografia.eu`, () => {
        const scene = cardScene(kind, DATA[kind], fmt, 'light', { measure });
        const texts = scene.items.filter((i): i is TextItem => i.type === 'text').flatMap((i) => i.lines);
        expect(texts).toContain('faktografia.eu');
        expect(texts).not.toContain('faktografia.pl');
      });
    });
  });

  it('w src/ nie ma napisu faktografia.pl', () => {
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(ts|tsx)$/.test(name) && readFileSync(p, 'utf8').includes('faktografia.pl')) hits.push(p);
      }
    };
    walk(join(__dirname, '../../src'));
    expect(hits).toEqual([]);
  });
});
