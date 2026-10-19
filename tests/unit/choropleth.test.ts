import { describe, it, expect } from 'vitest';
import { schemeFor, buildChoropleth } from '../../src/core/map/choropleth';
import valuesSample from '../fixtures/synthetic/values-sample.json';
import unitsData from '../../public/data/units.json';
import type { Unit } from '../../src/core/units/types';
import type { IndicatorValues } from '../../src/core/profile/profile';

describe('choropleth logic (CC8.2a-1)', () => {
  describe('schemeFor', () => {
    it('zwraca "diverging", gdy są wartości ujemne i dodatnie', () => {
      expect(schemeFor([-5, 0, 10])).toBe('diverging');
      expect(schemeFor([-10, 5])).toBe('diverging');
      expect(schemeFor([-1, null as any, 1])).toBe('diverging');
    });

    it('zwraca "sequential", gdy brak wartości ujemnych lub dodatnich', () => {
      expect(schemeFor([0, 5, 10])).toBe('sequential');
      expect(schemeFor([-10, -5, 0])).toBe('sequential');
      expect(schemeFor([])).toBe('sequential');
      expect(schemeFor([0])).toBe('sequential');
    });
  });

  describe('buildChoropleth', () => {
    const sampleUnits: Unit[] = [
      { teryt: '0201000', name: 'Gmina A', level: 'gmi', parent: '0201' },
      { teryt: '0202000', name: 'Gmina B', level: 'gmi', parent: '0201' },
      { teryt: '0203000', name: 'Gmina C', level: 'gmi', parent: '0202' },
      { teryt: '0204000', name: 'Gmina D', level: 'gmi', parent: '0202' },
      { teryt: '0205000', name: 'Gmina E', level: 'gmi', parent: '0203' },
      { teryt: '0201', name: 'Powiat X', level: 'pow', parent: '02' },
    ];

    const sampleValues: IndicatorValues = valuesSample as IndicatorValues;

    it('zwraca właściwy rok (rok podany jeśli w values.years)', () => {
      const res = buildChoropleth({
        values: sampleValues,
        units: sampleUnits,
        level: 'gmi',
        year: 2022,
      });

      expect(res.year).toBe(2022);
      expect(res.scheme).toBe('sequential');
      expect(res.breaks.length).toBe(4); // default n=5 -> 4 breaks
    });

    it('dobiera ostatni rok z jakąkolwiek wartością na danym poziomie, jeśli podany rok nie jest w values.years', () => {
      const res = buildChoropleth({
        values: sampleValues,
        units: sampleUnits,
        level: 'gmi',
        year: 2025, // brak 2025 w values.years [2022, 2023]
      });

      expect(res.year).toBe(2023);
    });

    it('wyznacza progi ze wszystkich jednostek podanego poziomu', () => {
      // Dla 2023 roku, wartości gmi to: 0201000: 12.5, 0202000: null, 0203000: 30.0, 0204000: 45.0, 0205000: 52.1
      // Wartości nie-null: [12.5, 30.0, 45.0, 52.1]
      const res = buildChoropleth({
        values: sampleValues,
        units: sampleUnits,
        level: 'gmi',
        year: 2023,
        n: 5,
        method: 'quantile',
      });

      expect(res.classByTeryt['0201000']).toBe(0);
      expect(res.classByTeryt['0202000']).toBe('no-data');
      expect(res.classByTeryt['0203000']).toBeDefined();
      expect(typeof res.classByTeryt['0203000']).toBe('number');
    });

    it('działa na wycinku z prawdziwego public/data/units.json', () => {
      const realUnitsSlice = (unitsData as Unit[]).slice(0, 100);
      const res = buildChoropleth({
        values: sampleValues,
        units: realUnitsSlice,
        level: 'gmi',
      });

      expect(res).toHaveProperty('year');
      expect(res).toHaveProperty('breaks');
      expect(res).toHaveProperty('scheme');
      expect(res).toHaveProperty('classByTeryt');
    });
  });
});
