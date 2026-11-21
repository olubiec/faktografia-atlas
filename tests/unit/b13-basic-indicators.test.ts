import { describe, it, expect } from 'vitest';
import { BASIC_INDICATORS } from '../../src/core/indicators/basic';
import { BASIC_INDICATORS as REEXPORT } from '../../src/core/my-indicators/my-indicators';

describe('B13: stały zestaw podstawowych wskaźników', () => {
  it('ma dokładnie 7 id w zadanej kolejności', () => {
    expect([...BASIC_INDICATORS]).toEqual([
      'population',
      'density',
      'natural-increase',
      'migration-balance',
      'share-65plus',
      'unemployment-rate',
      'avg-wage',
    ]);
  });

  it('moduł „Moje wskaźniki” tylko re-eksportuje tę samą listę', () => {
    expect(REEXPORT).toBe(BASIC_INDICATORS);
  });
});
