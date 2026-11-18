import { describe, expect, it } from 'vitest';
import {
  layersZoomBucket,
  localitiesAlphaTarget,
  localitiesLayerZoom,
  localitiesVisibleWithHysteresis,
} from '../../src/core/map/localities-layer';

describe('warstwa miejscowości bez „pop” (FIX6F)', () => {
  it('histereza: włącza od 8,5, wyłącza poniżej 8,0', () => {
    expect(localitiesVisibleWithHysteresis(false, 8.4)).toBe(false);
    expect(localitiesVisibleWithHysteresis(false, 8.5)).toBe(true);
    expect(localitiesVisibleWithHysteresis(true, 8.2)).toBe(true);
    expect(localitiesVisibleWithHysteresis(true, 7.99)).toBe(false);
  });

  it('alfa docelowa: 0 poniżej 8,8, 1 powyżej 9,2, monotoniczna i ciągła', () => {
    expect(localitiesAlphaTarget(8.7)).toBe(0);
    expect(localitiesAlphaTarget(9.3)).toBe(1);
    let prev = localitiesAlphaTarget(7);
    for (let z = 7.01; z <= 10; z += 0.01) {
      const a = localitiesAlphaTarget(z);
      expect(a).toBeGreaterThanOrEqual(prev - 1e-12);
      expect(a - prev).toBeLessThanOrEqual(0.15);
      prev = a;
    }
  });

  it('zoom dla warstw: 5 (brak), 8,5 (zbudowana, alfa 0), 11 (widoczna)', () => {
    expect(localitiesLayerZoom(false, 8.4)).toBe(5);
    expect(localitiesLayerZoom(true, 8.6)).toBe(8.5);
    expect(localitiesLayerZoom(true, 9.1)).toBe(11);
  });

  it('layersZoomBucket zostaje bez zmian', () => {
    expect(layersZoomBucket(8.99)).toBe(5);
    expect(layersZoomBucket(9)).toBe(11);
  });
});
