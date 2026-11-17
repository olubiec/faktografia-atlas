import { describe, expect, it } from 'vitest';
import tokens from '../../config/tokens.json';
import { cardPages } from '../../src/core/share/card-pages';
import { cardScene, type CompareCardData, type RectItem, type TextItem } from '../../src/core/share/card';

const measure = (t: string, size: number) => Math.round(0.55 * size * t.length);
const square = (x: number) => ({
  type: 'Feature',
  properties: { teryt: String(x) },
  geometry: { type: 'Polygon', coordinates: [[[x, 50], [x + 1, 50], [x + 1, 51], [x, 51], [x, 50]]] },
});
const features = { type: 'FeatureCollection', features: [square(18), square(19)] };

function compare(n: number): CompareCardData {
  return {
    indicatorName: 'Porównanie',
    year: 2025,
    unitA: { name: 'Gmina Alfa', teryt: '18', features, classOf: { '18': 1, '19': 3 } },
    unitB: { name: 'Gmina Beta', teryt: '19', features, classOf: { '18': 1, '19': 3 } },
    rows: Array.from({ length: n }, (_, i) => ({ indicatorName: `Wskaźnik numer ${i + 1}`, valA: '10', valB: '12', diffText: '+2' })),
  };
}

const seqLight = new Set<string>(tokens.data.sequential.light);
function sceneOf(data: CompareCardData) {
  return cardScene('compare', data, 'post', 'light', { measure });
}

describe('karta porównania 4:5, 8 wskaźników', () => {
  const scene = sceneOf(compare(8));
  const texts = scene.items.filter((i): i is TextItem => i.type === 'text');
  const legendLabels = texts.filter((t) => t.lines[0] === 'mniej → więcej');
  const legendRects = scene.items.filter((i): i is RectItem => i.type === 'rect' && !!i.fill && seqLight.has(i.fill));

  it('obie mapy mają legendę 5 klas i podpis jednostki', () => {
    expect(legendLabels).toHaveLength(2);
    expect(legendRects).toHaveLength(10);
    expect(texts.some((t) => t.lines[0] === 'Gmina Alfa' && t.fontSize > tokens.font.scale.xs)).toBe(true);
    expect(texts.some((t) => t.lines[0] === 'Gmina Beta' && t.fontSize > tokens.font.scale.xs)).toBe(true);
  });

  it('mapy z legendą zajmują ok. 40% wysokości treści', () => {
    const footerY = Math.max(...texts.filter((t) => t.lines[0] === 'faktografia.eu').map((t) => t.y));
    const captionTop = Math.min(...texts.filter((t) => t.lines[0] === 'Gmina Alfa').map((t) => t.y));
    const legendBottom = Math.max(...legendRects.map((r) => r.y + r.height));
    const ratio = (legendBottom - captionTop) / (footerY - captionTop);
    expect(ratio).toBeGreaterThan(0.3);
    expect(ratio).toBeLessThan(0.5);
  });

  it('wiersze nie zachodzą na siebie, a odstęp ≤ 1,5× wysokości wiersza', () => {
    const names = texts.filter((t) => /^Wskaźnik numer/.test(t.lines[0])).sort((a, b) => a.y - b.y);
    expect(names).toHaveLength(8);
    for (let i = 0; i < names.length - 1; i++) {
      const h = names[i].lines.length * names[i].lineHeight;
      const step = names[i + 1].y - names[i].y;
      expect(step).toBeGreaterThanOrEqual(h);
      expect(step).toBeLessThanOrEqual(1.5 * h);
    }
    const last = names[names.length - 1];
    const footerY = Math.max(...texts.filter((t) => t.lines[0] === 'faktografia.eu').map((t) => t.y));
    expect(last.y + last.lines.length * last.lineHeight).toBeLessThanOrEqual(footerY);
  });

  it('stopka ma domyślną domenę faktografia.eu', () => {
    expect(texts.some((t) => t.lines[0] === 'faktografia.eu')).toBe(true);
  });

  it('wywołujący może przekazać inną domenę stopki', () => {
    const s = cardScene('compare', compare(8), 'post', 'light', { measure, siteUrl: 'example.org' });
    expect(s.items.some((i) => i.type === 'text' && i.lines[0] === 'example.org')).toBe(true);
  });
});

describe('paginacja karty porównania', () => {
  it('20 wskaźników daje co najmniej 2 karty, bez gubienia wierszy', () => {
    const pages = cardPages('compare', compare(20));
    expect(pages.length).toBeGreaterThanOrEqual(2);
    const total = pages.reduce((s, p) => s + (p.data as CompareCardData).rows.length, 0);
    expect(total).toBe(20);
    expect(pages[1].page).toEqual({ number: 2, total: pages.length });
  });
  it('8 wskaźników mieści się na jednej karcie', () => {
    expect(cardPages('compare', compare(8))).toHaveLength(1);
  });
});
