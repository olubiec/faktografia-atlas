import { describe, expect, it } from 'vitest';
import { shouldShowLocalitiesLayer, filterLocalitiesByZoom } from '../../src/core/map/localities-layer';
import type { Locality } from '../../src/core/search/types';

describe('Localities Layer Pure Logic (CC5.4b)', () => {
  const sampleLocalities: Locality[] = [
    { id: '1', name: 'Zakopane', gminaTeryt: '1217011', lon: 19.95, lat: 49.29, kind: 'miasto' },
    { id: '2', name: 'Borki', gminaTeryt: '1012032', lon: 19.39, lat: 51.00, kind: 'osada', approx: true },
    { id: '3', name: 'Nowa Wieś', gminaTeryt: '1012032', lon: 19.41, lat: 51.02, kind: 'wieś' },
  ];

  describe('shouldShowLocalitiesLayer', () => {
    it('returns false for zoom levels strictly below 9', () => {
      expect(shouldShowLocalitiesLayer(5)).toBe(false);
      expect(shouldShowLocalitiesLayer(8)).toBe(false);
      expect(shouldShowLocalitiesLayer(8.99)).toBe(false);
    });

    it('returns true for zoom levels equal to or greater than 9', () => {
      expect(shouldShowLocalitiesLayer(9)).toBe(true);
      expect(shouldShowLocalitiesLayer(9.1)).toBe(true);
      expect(shouldShowLocalitiesLayer(11)).toBe(true);
      expect(shouldShowLocalitiesLayer(15)).toBe(true);
    });
  });

  describe('filterLocalitiesByZoom', () => {
    it('returns an empty array when zoom < 9', () => {
      const result = filterLocalitiesByZoom(sampleLocalities, 8.5);
      expect(result).toEqual([]);
    });

    it('returns localities when zoom >= 9', () => {
      const result = filterLocalitiesByZoom(sampleLocalities, 9);
      expect(result.length).toBe(3);
    });

    it('filters by gminaTeryt when gmina filter is provided at zoom >= 9', () => {
      const result = filterLocalitiesByZoom(sampleLocalities, 10, { gminaTeryt: '1012032' });
      expect(result.length).toBe(2);
      expect(result.map((l) => l.name)).toEqual(['Borki', 'Nowa Wieś']);
    });

    it('preserves approx flag on localities', () => {
      const result = filterLocalitiesByZoom(sampleLocalities, 10, { gminaTeryt: '1012032' });
      const borki = result.find((l) => l.name === 'Borki');
      expect(borki?.approx).toBe(true);
    });
  });
});
