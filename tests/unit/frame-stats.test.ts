import { describe, it, expect } from 'vitest';
import { percentile, summarizeFrames } from '../../src/core/map/frame-stats';

describe('percentile', () => {
  const sorted = [1, 2, 3, 4, 5];

  it('zwraca medianę dla p=0,5', () => {
    expect(percentile(sorted, 0.5)).toBe(3);
  });

  it('zwraca ostatnią wartość dla p=0,95', () => {
    expect(percentile(sorted, 0.95)).toBe(5);
  });

  it('pusta tablica daje 0', () => {
    expect(percentile([], 0.5)).toBe(0);
  });
});

describe('summarizeFrames', () => {
  it('61 znaczników co 16,7 ms: 60 klatek, bez długich i zgubionych', () => {
    const stamps = Array.from({ length: 61 }, (_, i) => i * 16.7);
    const s = summarizeFrames(stamps);
    expect(s.frames).toBe(60);
    expect(s.p95).toBeCloseTo(16.7, 1);
    expect(s.longFrames).toBe(0);
    expect(s.droppedShare).toBe(0);
  });

  it('jedna przerwa 120 ms: długa klatka, max 120, udział zgubionych > 0', () => {
    const stamps = [0, 16.7, 33.4, 153.4, 170.1, 186.8];
    const s = summarizeFrames(stamps);
    expect(s.longFrames).toBe(1);
    expect(s.max).toBeCloseTo(120, 5);
    expect(s.droppedShare).toBeGreaterThan(0);
    expect(s.durationMs).toBeCloseTo(186.8, 5);
  });

  it('mniej niż 2 znaczniki: same zera, bez dzielenia przez zero', () => {
    const zero = { frames: 0, durationMs: 0, p50: 0, p95: 0, max: 0, longFrames: 0, droppedShare: 0 };
    expect(summarizeFrames([])).toEqual(zero);
    expect(summarizeFrames([5])).toEqual(zero);
  });
});
