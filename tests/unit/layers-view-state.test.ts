import { describe, expect, it } from 'vitest';
import { layersZoomBucket } from '../../src/core/map/localities-layer';

describe('zoom przekazywany do warstw (FIX4)', () => {
  it('ma tylko dwie wartości: poniżej i od progu miejscowości', () => {
    expect(layersZoomBucket(5.5)).toBe(5);
    expect(layersZoomBucket(8.99)).toBe(5);
    expect(layersZoomBucket(9)).toBe(11);
    expect(layersZoomBucket(12)).toBe(11);
  });

  it('pomiar: w animacji 60 klatek od zoomu 5,5 do 10 warstwy przebudowują się dwa razy, nie 61', () => {
    let rebuildsBefore = 0;
    let rebuildsAfter = 0;
    let prevBucket: number | null = null;
    for (let f = 0; f <= 60; f++) {
      const zoom = 5.5 + (4.5 * f) / 60;
      rebuildsBefore++; // dawniej: nowy obiekt widoku (i nowe warstwy) na każdą klatkę
      const bucket = layersZoomBucket(zoom);
      if (bucket !== prevBucket) rebuildsAfter++;
      prevBucket = bucket;
    }
    expect(rebuildsBefore).toBe(61);
    expect(rebuildsAfter).toBe(2);
  });
});
