import { describe, expect, it } from 'vitest';
import {
  advanceColorMemory,
  blendRgba,
  createColorMemory,
  easeOutCubic,
  unitAlpha,
} from '@/core/map/fill-blend';

describe('blendRgba', () => {
  it('granice t=0 i t=1 zwracają kolory wejściowe', () => {
    expect(blendRgba([10, 20, 30, 40], [200, 100, 50, 255], 0)).toEqual([10, 20, 30, 40]);
    expect(blendRgba([10, 20, 30, 40], [200, 100, 50, 255], 1)).toEqual([200, 100, 50, 255]);
  });
  it('środek to średnia, t poza zakresem jest obcinane', () => {
    expect(blendRgba([0, 0, 0, 0], [100, 200, 50, 255], 0.5)).toEqual([50, 100, 25, 128]);
    expect(blendRgba([0, 0, 0, 0], [100, 100, 100, 100], -3)).toEqual([0, 0, 0, 0]);
    expect(blendRgba([0, 0, 0, 0], [100, 100, 100, 100], 7)).toEqual([100, 100, 100, 100]);
  });
});

describe('easeOutCubic', () => {
  it('0 -> 0, 1 -> 1, rosnąca i obcinana', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(2)).toBe(1);
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });
});

describe('unitAlpha', () => {
  it('przed delay = minAlpha, po delay+duration = 255', () => {
    expect(unitAlpha(0, 100, 150)).toBe(64);
    expect(unitAlpha(100, 100, 150)).toBe(64);
    expect(unitAlpha(250, 100, 150)).toBe(255);
    expect(unitAlpha(9999, 100, 150)).toBe(255);
  });
  it('rośnie monotonicznie w oknie', () => {
    let prev = 0;
    for (let ms = 0; ms <= 300; ms += 10) {
      const a = unitAlpha(ms, 50, 150);
      expect(a).toBeGreaterThanOrEqual(prev);
      prev = a;
    }
  });
  it('reducedMotion: zawsze pełna', () => {
    expect(unitAlpha(0, 100, 150, 64, true)).toBe(255);
  });
  it('duration 0 nie daje NaN', () => {
    expect(unitAlpha(10, 50, 0)).toBe(64);
    expect(unitAlpha(60, 50, 0)).toBe(255);
  });
});

describe('pamięć kolorów', () => {
  it('zmiana klucza przenosi obecne kolory do prev, ten sam klucz nie', () => {
    const m = createColorMemory();
    advanceColorMemory(m, 'a');
    m.cur.set('12', [1, 2, 3, 255]);
    advanceColorMemory(m, 'a');
    expect(m.prev.size).toBe(0);
    advanceColorMemory(m, 'b');
    expect(m.prev.get('12')).toEqual([1, 2, 3, 255]);
    expect(m.cur.size).toBe(0);
  });
});
