import { describe, expect, it } from 'vitest';
import { MAX_ZOOM_STEP, wheelZoomDelta } from '../../src/core/map/camera-wheel';

describe('wheelZoomDelta', () => {
  it('w górę przybliża, w dół oddala, symetrycznie', () => {
    expect(wheelZoomDelta(-100, 0)).toBeGreaterThan(0);
    expect(wheelZoomDelta(100, 0)).toBeLessThan(0);
    expect(wheelZoomDelta(-100, 0)).toBeCloseTo(-wheelZoomDelta(100, 0), 12);
  });
  it('tryb liniowy daje ok. 16x większy krok niż piksele', () => {
    expect(wheelZoomDelta(-1, 1) / wheelZoomDelta(-1, 0)).toBeCloseTo(16, 6);
  });
  it('jedno kliknięcie kółka (-100 px) mieści się w [0,15; 0,5]', () => {
    const d = wheelZoomDelta(-100, 0);
    expect(d).toBeGreaterThanOrEqual(0.15);
    expect(d).toBeLessThanOrEqual(0.5);
  });
  it('krok jest obcięty do ±0,6 na zdarzenie', () => {
    expect(wheelZoomDelta(-100000, 0)).toBe(MAX_ZOOM_STEP);
    expect(wheelZoomDelta(100000, 0)).toBe(-MAX_ZOOM_STEP);
    expect(MAX_ZOOM_STEP).toBe(0.6);
  });
});
