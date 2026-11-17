import { describe, expect, it } from 'vitest';
import { outlineWidth, resolveOutlinedIds } from '../../src/core/map/outline-style';

describe('outline-style: szerokość obrysu zależna od zoomu', () => {
  it('przy zoomie Polski (5) obrys jest cieńszy niż przy zoomie jednostki (10)', () => {
    expect(outlineWidth(5)).toBeLessThan(outlineWidth(10));
  });

  it('szerokość nigdy nie spada poniżej 1 px (także dla skrajnych zoomów)', () => {
    for (const z of [-5, 0, 2, 4.5, 5, 7, 10, 14, 22, Number.NaN]) {
      expect(outlineWidth(z)).toBeGreaterThanOrEqual(1);
    }
  });

  it('szerokość rośnie monotonicznie i ma górny limit', () => {
    expect(outlineWidth(7)).toBeGreaterThanOrEqual(outlineWidth(5));
    expect(outlineWidth(8)).toBeGreaterThanOrEqual(outlineWidth(7));
    expect(outlineWidth(20)).toBe(outlineWidth(10));
  });
});

describe('outline-style: które jednostki są obrysowane', () => {
  it('porównanie dwóch jednostek obrysowuje obie', () => {
    expect(resolveOutlinedIds('1465011,1465021', '1465011')).toEqual(['1465011', '1465021']);
  });

  it('bez porównania obrysowana jest wybrana jednostka', () => {
    expect(resolveOutlinedIds(null, '12')).toEqual(['12']);
  });

  it('bez porównania i bez wyboru nie ma obrysu', () => {
    expect(resolveOutlinedIds(null, null)).toEqual([]);
    expect(resolveOutlinedIds('12', null)).toEqual([]);
  });
});
