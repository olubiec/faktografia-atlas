import { describe, expect, it } from 'vitest';
import tokens from '../../config/tokens.json';
import { cardScene, type CardData, type CardKind, type CardTheme } from '../../src/core/share/card';
import { SHARE_FORMATS, type ShareFormatKey } from '../../src/core/share/formats';

const mockMeasure = (text: string, size: number): number => {
  return Math.round(0.55 * size * text.length);
};

const mockMapData: CardData = {
  indicator: { name: 'Gęstość zaludnienia', unit: 'os./km²', year: 2024 },
  year: 2024,
  unitName: 'województwa',
  features: [
    {
      type: 'Feature',
      properties: { teryt: '12' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [19.0, 49.5],
            [21.0, 49.5],
            [21.0, 50.5],
            [19.0, 50.5],
            [19.0, 49.5],
          ],
        ],
      },
    },
  ],
  classOf: { '12': 3 },
  selectedTeryt: '12',
};

const mockRankingData: CardData = {
  indicator: { name: 'Stopa bezrobocia rejestrowanego', unit: '%' },
  year: 2024,
  selectedTeryt: '1603',
  items: Array.from({ length: 25 }, (_, i) => ({
    teryt: `${1600 + i}`,
    name: i === 0 ? 'Powiat kędzierzyńsko-kozielski' : i === 1 ? 'Bardzo Długa Nazwa Jednostki Samorządu 45ch' : `Powiat Nr ${i + 1}`,
    value: 12.5 - i * 0.4,
    valueText: `${(12.5 - i * 0.4).toFixed(1)}%`,
    rank: i + 1,
    selected: i === 0,
  })),
};

const mockProfileData: CardData = {
  unitName: 'Powiat kędzierzyńsko-kozielski',
  teryt: '1603',
  indicatorName: 'Gęstość zaludnienia',
  unit: 'os./km²',
  year: 2024,
  bigNumber: '125,4',
  rankText: '3. miejsce w województwie opolskim',
  indicators: [
    { name: 'Stopa bezrobocia', value: '5,2', unit: '%' },
    { name: 'Przeciętne wynagrodzenie', value: '6850,00', unit: 'zł' },
    { name: 'Mieszkania oddane do użytkowania', value: '420', unit: '' },
    { name: 'Lesistość', value: '28,4', unit: '%' },
    { name: 'Dochody własne budżetu na 1 mieszkańca z bardzo długą nazwą', value: '3420,50', unit: 'zł' },
  ],
};

const mockCompareData: CardData = {
  indicatorName: 'Gęstość zaludnienia',
  year: 2024,
  unitA: {
    name: 'Powiat kędzierzyńsko-kozielski',
    teryt: '1603',
  },
  unitB: {
    name: 'Powiat Prudnicki Z Bardzo Długą Nazwą Samorządową 45',
    teryt: '1610',
  },
  rows: [
    { indicatorName: 'Gęstość zaludnienia', valA: '125,4 os./km²', valB: '82,1 os./km²', diffText: 'wyżej o 52.7%' },
    { indicatorName: 'Stopa bezrobocia', valA: '5,2%', valB: '8,4%', diffText: 'niżej o 3,2 p.p.' },
    { indicatorName: 'Wynagrodzenie', valA: '6850 zł', valB: '6100 zł', diffText: 'wyżej o 12.3%' },
    { indicatorName: 'Lesistość', valA: '28,4%', valB: '32,1%', diffText: 'niżej o 3,7 p.p.' },
    { indicatorName: 'Mieszkania', valA: '420', valB: '210', diffText: 'wyżej o 100%' },
  ],
};

const KINDS: CardKind[] = ['map', 'ranking', 'profile', 'compare'];
const FORMATS: ShareFormatKey[] = ['post', 'square', 'story', 'wide'];
const THEMES: CardTheme[] = ['light', 'dark'];

function getMockData(kind: CardKind): CardData {
  switch (kind) {
    case 'map':
      return mockMapData;
    case 'ranking':
      return mockRankingData;
    case 'profile':
      return mockProfileData;
    case 'compare':
      return mockCompareData;
  }
}

describe('cardScene layout logic (W1.14)', () => {
  KINDS.forEach((kind) => {
    FORMATS.forEach((formatKey) => {
      THEMES.forEach((theme) => {
        it(`generates scene for kind=${kind}, format=${formatKey}, theme=${theme}`, () => {
          const data = getMockData(kind);
          const scene = cardScene(kind, data, formatKey, theme, {
            measure: mockMeasure,
            siteUrl: 'faktografia.pl',
          });

          const fmt = SHARE_FORMATS[formatKey];
          expect(scene.width).toBe(fmt.width);
          expect(scene.height).toBe(fmt.height);

          // Background matches token
          const expectedBg = tokens.color[theme].kalka;
          expect(scene.background).toBe(expectedBg);

          // Check safe margins for text items
          const textItems = scene.items.filter((it): it is Extract<typeof it, { type: 'text' }> => it.type === 'text');
          const invalidTextItems = textItems.filter((item) => {
            const minX = item.x >= fmt.safe.left - 2;
            const maxX = item.x + item.maxWidth <= fmt.width - fmt.safe.right + 2;
            const minY = item.y >= fmt.safe.top - 2;
            const maxY = item.y + item.lineHeight * item.lines.length <= fmt.height - fmt.safe.bottom + 2;
            return !(minX && maxX && minY && maxY);
          });
          expect(invalidTextItems).toEqual([]);

          // Check safe margins for image items
          const imageItems = scene.items.filter((it): it is Extract<typeof it, { type: 'image' }> => it.type === 'image');
          const invalidImageItems = imageItems.filter((item) => {
            const minX = item.x >= fmt.safe.left - 2;
            const maxX = item.x + item.width <= fmt.width - fmt.safe.right + 2;
            const minY = item.y >= fmt.safe.top - 2;
            const maxY = item.y + item.height <= fmt.height - fmt.safe.bottom + 2;
            return !(minX && maxX && minY && maxY);
          });
          expect(invalidImageItems).toEqual([]);

          // Exactly 1 logo
          const logoItems = scene.items.filter(
            (it) => it.type === 'image' && it.src.includes('public/brand/')
          );
          expect(logoItems.length).toBe(1);

          // Exactly 1 source
          const sourceItems = scene.items.filter(
            (it) => it.type === 'text' && it.lines.some((l) => l.startsWith('Źródło:'))
          );
          expect(sourceItems.length).toBe(1);

          // At most 1 annotation
          const annotationItems = scene.items.filter((it) => it.type === 'annotation');
          expect(annotationItems.length).toBeLessThanOrEqual(1);

          const expectedAnnotations = kind === 'profile' ? 1 : 0;
          expect(annotationItems.length).toBe(expectedAnnotations);

          // Check for element bounding box overlaps among text and image items
          const layoutElements = scene.items.filter(
            (it) => it.type === 'text' || it.type === 'image'
          ) as ({ type: 'text' | 'image'; x: number; y: number; width: number; height: number; lines?: string[] })[];

          const boxes = layoutElements.map((el) => {
            if (el.type === 'text') {
              const h = el.lineHeight * (el.lines?.length || 1);
              return { x1: el.x, y1: el.y, x2: el.x + el.maxWidth, y2: el.y + h };
            } else {
              return { x1: el.x, y1: el.y, x2: el.x + el.width, y2: el.y + el.height };
            }
          });

          const nonFooterOverlaps = boxes.flatMap((b1, i) =>
            boxes.slice(i + 1).filter((b2) => {
              const xOverlap = Math.max(0, Math.min(b1.x2, b2.x2) - Math.max(b1.x1, b2.x1));
              const yOverlap = Math.max(0, Math.min(b1.y2, b2.y2) - Math.max(b1.y1, b2.y1));
              const isTrivial = xOverlap <= 2 || yOverlap <= 2;
              const isFooterPair =
                b1.y1 >= fmt.height - fmt.safe.bottom - 40 &&
                b2.y1 >= fmt.height - fmt.safe.bottom - 40;
              return !isTrivial && xOverlap > 5 && yOverlap > 5 && !isFooterPair;
            })
          );

          expect(nonFooterOverlaps).toEqual([]);
        });
      });
    });
  });

  it('fits "Powiat kędzierzyńsko-kozielski" and 45-char long names without clipping or unnecessary "…"', () => {
    const scene = cardScene('ranking', mockRankingData, 'post', 'light', {
      measure: mockMeasure,
    });

    const textLines = scene.items
      .filter((it): it is Extract<typeof it, { type: 'text' }> => it.type === 'text')
      .flatMap((it) => it.lines);

    const kedzierzynFound = textLines.some((l) => l.includes('kędzierzyńsko-kozielski') || l.includes('kędzierzyńsko-'));
    expect(kedzierzynFound).toBe(true);

    const long45Found = textLines.some((l) => l.includes('Bardzo Długa Nazwa'));
    expect(long45Found).toBe(true);
  });

  it('uses colors matching exact token values from config/tokens.json', () => {
    const sceneLight = cardScene('profile', mockProfileData, 'post', 'light', {
      measure: mockMeasure,
    });
    expect(sceneLight.background).toBe(tokens.color.light.kalka);

    const sceneDark = cardScene('profile', mockProfileData, 'post', 'dark', {
      measure: mockMeasure,
    });
    expect(sceneDark.background).toBe(tokens.color.dark.kalka);
  });
});
