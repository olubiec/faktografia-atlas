import { describe, it, expect } from 'vitest';
import { nextZoom, ZOOM_STEP } from '@/core/map/zoom-step';

const limits = { minZoom: 4, maxZoom: 12 };

describe('nextZoom', () => {
  it('ZOOM_STEP wynosi 0.5', () => {
    expect(ZOOM_STEP).toBe(0.5);
  });
  it('przybliża o jeden krok', () => {
    expect(nextZoom(6, 1, limits)).toBe(6.5);
  });
  it('oddala o jeden krok', () => {
    expect(nextZoom(6, -1, limits)).toBe(5.5);
  });
  it('przycina do maxZoom', () => {
    expect(nextZoom(11.8, 1, limits)).toBe(12);
    expect(nextZoom(12, 1, limits)).toBe(12);
  });
  it('przycina do minZoom', () => {
    expect(nextZoom(4.2, -1, limits)).toBe(4);
    expect(nextZoom(4, -1, limits)).toBe(4);
  });
  it('uwzględnia własny krok', () => {
    expect(nextZoom(6, 1, limits, 1)).toBe(7);
  });
});
