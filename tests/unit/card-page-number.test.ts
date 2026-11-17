import { describe, expect, it } from 'vitest';
import { cardScene, type CardData, type CardKind, type TextItem } from '../../src/core/share/card';
import { SHARE_FORMATS, type ShareFormatKey } from '../../src/core/share/formats';

const measure = (text: string, size: number): number => Math.round(0.55 * size * text.length);

const mapData: CardData = {
  indicator: { name: 'Gęstość zaludnienia', unit: 'os./km²', year: 2024 },
  year: 2024,
  unitName: 'województwa',
  features: [{ type: 'Feature', properties: { teryt: '12' }, geometry: { type: 'Polygon', coordinates: [[[19, 49.5], [21, 49.5], [21, 50.5], [19, 50.5], [19, 49.5]]] } }],
  classOf: { '12': 3 },
  selectedTeryt: '12',
};
const rankingData: CardData = {
  indicator: { name: 'Stopa bezrobocia', unit: '%' },
  year: 2024,
  selectedTeryt: '1603',
  items: Array.from({ length: 5 }, (_, i) => ({ teryt: `${1600 + i}`, name: `Powiat ${i}`, value: 10 - i, valueText: `${10 - i}%`, rank: i + 1, selected: i === 0 })),
};
const profileData: CardData = {
  unitName: 'Powiat kędzierzyńsko-kozielski', teryt: '1603', indicatorName: 'Gęstość zaludnienia', unit: 'os./km²', year: 2024,
  bigNumber: '125,4', rankText: '3. miejsce', indicators: [{ name: 'Lesistość', value: '28,4', unit: '%' }],
};
const compareData: CardData = {
  indicatorName: 'Gęstość zaludnienia', year: 2024,
  unitA: { name: 'Powiat A', teryt: '1603' }, unitB: { name: 'Powiat B', teryt: '1610' },
  rows: [{ indicatorName: 'Lesistość', valA: '28,4%', valB: '32,1%', diffText: 'niżej o 3,7 p.p.' }],
};
const DATA: Record<CardKind, CardData> = { map: mapData, ranking: rankingData, profile: profileData, compare: compareData };
const KINDS = Object.keys(DATA) as CardKind[];
const FORMATS = Object.keys(SHARE_FORMATS) as ShareFormatKey[];

const texts = (items: ReturnType<typeof cardScene>['items']) => items.filter((i): i is TextItem => i.type === 'text');
const find = (s: ReturnType<typeof cardScene>, needle: string) => texts(s.items).find((t) => t.lines.some((l) => l.includes(needle)));
const widthOf = (t: TextItem) => Math.max(...t.lines.map((l) => measure(l, t.fontSize)));

describe('numer strony na karcie (QC905)', () => {
  it('pageLabel dodaje tekst „3/5” w stopce', () => {
    const scene = cardScene('map', mapData, 'post', 'light', { measure, pageLabel: '3/5' });
    expect(find(scene, '3/5')).toBeDefined();
  });

  it('bez pageLabel i z pustym pageLabel scena jest identyczna', () => {
    for (const kind of KINDS) {
      const base = cardScene(kind, DATA[kind], 'post', 'light', { measure });
      const empty = cardScene(kind, DATA[kind], 'post', 'light', { measure, pageLabel: '' });
      expect(empty).toEqual(base);
      expect(empty.items.length).toBe(base.items.length);
      expect(find(base, ' · ')).toBeUndefined();
    }
  });

  it('numer mieści się w stopce w 4 formatach i 4 rodzajach, źródło i adres są obecne', () => {
    for (const kind of KINDS) {
      for (const f of FORMATS) {
        const { safe, width } = SHARE_FORMATS[f];
        const scene = cardScene(kind, DATA[kind], f, 'light', { measure, pageLabel: '3/5' });
        const src = find(scene, 'Źródło: GUS');
        const url = find(scene, 'faktografia.pl');
        expect(src, `${kind}/${f}`).toBeDefined();
        expect(url).toBeDefined();
        expect(src!.lines[0]).toContain('3/5');
        expect(src!.x + widthOf(src!)).toBeLessThanOrEqual(width - safe.right);
        expect(src!.x + widthOf(src!)).toBeLessThanOrEqual(src!.x + src!.maxWidth);
      }
    }
  });

  it('najdłuższy numer „12/12” mieści się (post)', () => {
    const scene = cardScene('ranking', rankingData, 'post', 'light', { measure, pageLabel: '12/12' });
    const src = find(scene, '12/12')!;
    expect(widthOf(src)).toBeLessThanOrEqual(src.maxWidth);
  });

  it('numer nie nachodzi na adres strony, a przy braku miejsca skraca się tylko „BDL”', () => {
    for (const f of FORMATS) {
      const scene = cardScene('map', mapData, f, 'light', { measure, pageLabel: '12/12' });
      const src = find(scene, '12/12')!;
      const url = find(scene, 'faktografia.pl')!;
      expect(src.x + widthOf(src)).toBeLessThan(url.x);
      expect(src.lines[0].endsWith('12/12')).toBe(true);
    }
    const tight = cardScene('map', mapData, 'post', 'light', { measure: (t, s) => measure(t, s) * 2.5, pageLabel: '12/12' });
    expect(find(tight, '12/12')!.lines[0]).toContain('BDL');
  });
});
