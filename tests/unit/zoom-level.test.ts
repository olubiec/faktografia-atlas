import { describe, it, expect } from 'vitest';
import { levelForZoom, ZOOM_HYSTERESIS, ZOOM_THRESHOLDS } from '../../src/core/map/zoom-level';
import type { UnitLevel } from '../../src/core/units/types';

const ALL: UnitLevel[] = ['woj', 'pow', 'gmi'];

describe('levelForZoom – progi', () => {
  it('zoom całej Polski daje województwa niezależnie od obecnego poziomu', () => {
    expect(levelForZoom(5.5, 'woj', ALL)).toBe('woj');
    expect(levelForZoom(5.5, 'pow', ALL)).toBe('woj');
    expect(levelForZoom(5.5, 'gmi', ALL)).toBe('woj');
  });

  it('średni zoom daje powiaty, duży – gminy', () => {
    expect(levelForZoom(7.2, 'woj', ALL)).toBe('pow');
    expect(levelForZoom(7.2, 'gmi', ALL)).toBe('pow');
    expect(levelForZoom(8.5, 'woj', ALL)).toBe('gmi');
    expect(levelForZoom(8.5, 'pow', ALL)).toBe('gmi');
  });

  it('progi są w kolejności woj < pow < gmi', () => {
    expect(ZOOM_THRESHOLDS.pow).toBeLessThan(ZOOM_THRESHOLDS.gmi);
    expect(ZOOM_HYSTERESIS).toBeGreaterThan(0);
  });
});

describe('levelForZoom – histereza', () => {
  it('zoom 6.4 przy obecnym pow nie przełącza na woj', () => {
    expect(levelForZoom(6.4, 'pow', ALL)).toBe('pow');
  });

  it('tuż nad progiem woj/pow nie przełącza z woj na pow (bez migania)', () => {
    expect(levelForZoom(6.4, 'woj', ALL)).toBe('woj');
  });

  it('tuż pod progiem pow/gmi gminy zostają, powiaty nie schodzą niżej', () => {
    expect(levelForZoom(7.8, 'gmi', ALL)).toBe('gmi');
    expect(levelForZoom(8.1, 'pow', ALL)).toBe('pow');
  });

  it('wyraźne przekroczenie progu przełącza poziom', () => {
    expect(levelForZoom(5.9, 'pow', ALL)).toBe('woj');
    expect(levelForZoom(6.7, 'woj', ALL)).toBe('pow');
    expect(levelForZoom(7.6, 'gmi', ALL)).toBe('pow');
    expect(levelForZoom(8.4, 'pow', ALL)).toBe('gmi');
  });
});

describe('levelForZoom – poziomy dozwolone dla wskaźnika', () => {
  it('wskaźnik tylko gminny zostaje na gmi przy każdym zoomie', () => {
    expect(levelForZoom(5.0, 'gmi', ['gmi'])).toBe('gmi');
    expect(levelForZoom(7.0, 'gmi', ['gmi'])).toBe('gmi');
    expect(levelForZoom(9.0, 'gmi', ['gmi'])).toBe('gmi');
  });

  it('wskaźnik do powiatów nie schodzi do gmin przy dużym zoomie', () => {
    expect(levelForZoom(9.0, 'pow', ['woj', 'pow'])).toBe('pow');
  });

  it('wskaźnik tylko wojewódzki zostaje na woj', () => {
    expect(levelForZoom(9.0, 'woj', ['woj'])).toBe('woj');
  });
});
