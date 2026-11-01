import { describe, it, expect } from 'vitest';
import {
  hasEnoughData,
  getValidPoints,
  getSortedYears,
  calculateYDomain,
  calculateX,
  calculateY,
  getXAxisYears,
  buildSegments,
  buildPathD,
} from '../../src/core/profile/trend-geometry';

describe('trend-geometry', () => {
  describe('przypadek: brak danych', () => {
    it('hasEnoughData zwraca false dla pustej tablicy', () => {
      expect(hasEnoughData([])).toBe(false);
      expect(getValidPoints([])).toEqual([]);
      expect(getSortedYears([])).toEqual([]);
    });

    it('calculateYDomain zwraca domyślny bezpieczny zakres', () => {
      const domain = calculateYDomain([]);
      expect(domain.minY).toBe(0);
      expect(domain.maxY).toBe(0);
      expect(domain.domainMinY).toBe(-1);
      expect(domain.domainMaxY).toBe(1);
    });

    it('getXAxisYears zwraca pustą tablicę', () => {
      expect(getXAxisYears([])).toEqual([]);
    });

    it('buildSegments zwraca pustą listę segmentów', () => {
      expect(buildSegments([])).toEqual([]);
    });
  });

  describe('przypadek: jeden punkt', () => {
    const single = [{ year: 2020, value: 42 }];

    it('hasEnoughData zwraca false dla jednego punktu', () => {
      expect(hasEnoughData(single)).toBe(false);
      expect(getValidPoints(single)).toHaveLength(1);
    });

    it('calculateYDomain rozszerza zakres gdy minY === maxY', () => {
      const domain = calculateYDomain(getValidPoints(single));
      expect(domain.minY).toBe(41);
      expect(domain.maxY).toBe(43);
      expect(domain.domainMaxY).toBeGreaterThan(domain.domainMinY);
    });

    it('calculateX centruje pozycję gdy minYear === maxYear', () => {
      const x = calculateX(2020, 2020, 2020, 70, 200);
      expect(x).toBe(70 + 200 / 2);
    });

    it('getXAxisYears zwraca ten pojedynczy rok', () => {
      expect(getXAxisYears([2020])).toEqual([2020]);
    });

    it('buildSegments tworzy pojedynczy segment z 1 punktem', () => {
      const segments = buildSegments(single);
      expect(segments).toEqual([[{ year: 2020, value: 42 }]]);
    });
  });

  describe('przypadek: luki w latach i brakujące dane (null)', () => {
    const seriesWithGaps = [
      { year: 2018, value: 10 },
      { year: 2019, value: null },
      { year: 2020, value: null },
      { year: 2021, value: 20 },
      { year: 2022, value: 25 },
    ];

    it('hasEnoughData zwraca true jeśli są min. 2 poprawne punkty', () => {
      expect(hasEnoughData(seriesWithGaps)).toBe(true);
      expect(getValidPoints(seriesWithGaps)).toHaveLength(3);
    });

    it('buildSegments dzieli serię na osobne segmenty przy nullach', () => {
      const segments = buildSegments(seriesWithGaps);
      expect(segments).toHaveLength(2);
      expect(segments[0]).toEqual([{ year: 2018, value: 10 }]);
      expect(segments[1]).toEqual([
        { year: 2021, value: 20 },
        { year: 2022, value: 25 },
      ]);
    });

    it('getXAxisYears uwzględnia skrajne lata i redukuje gęste serie do <= 6 lat', () => {
      const years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020];
      const axisYears = getXAxisYears(years);
      expect(axisYears[0]).toBe(2010);
      expect(axisYears[axisYears.length - 1]).toBe(2020);
      expect(axisYears.length).toBeLessThanOrEqual(6);
    });

    it('buildPathD poprawnie łączy punkty w ścieżkę SVG', () => {
      const pts = [
        { year: 2021, value: 20 },
        { year: 2022, value: 25 },
      ];
      const path = buildPathD(pts, (y) => y, (v) => v);
      expect(path).toBe('M 2021 20 L 2022 25');
    });
  });

  describe('przypadek: wartości ujemne', () => {
    const negativeSeries = [
      { year: 2020, value: -15 },
      { year: 2021, value: -5 },
      { year: 2022, value: 10 },
    ];

    it('calculateYDomain prawidłowo wyznacza min, max i 10% margines dla liczb ujemnych', () => {
      const valid = getValidPoints(negativeSeries);
      const domain = calculateYDomain(valid);
      expect(domain.minY).toBe(-15);
      expect(domain.maxY).toBe(10);
      // diff = 25, margin = 2.5
      expect(domain.domainMinY).toBeCloseTo(-17.5);
      expect(domain.domainMaxY).toBeCloseTo(12.5);
    });

    it('calculateY odwzorowuje wartości ujemne i dodatnie proporcjonalnie', () => {
      const yMin = calculateY(-17.5, -17.5, 12.5, 20, 100);
      const yMax = calculateY(12.5, -17.5, 12.5, 20, 100);
      // yMin powinno być na dole wykresu (20 + 100 = 120)
      expect(yMin).toBeCloseTo(120);
      // yMax powinno być na górze wykresu (20)
      expect(yMax).toBeCloseTo(20);
    });

    it('uwzględnia serię porównawczą przy wyznaczaniu zakresu ujemnego', () => {
      const main = [{ year: 2020, value: -5 }];
      const comp = [{ year: 2020, value: -30 }];
      const domain = calculateYDomain(main, comp);
      expect(domain.minY).toBe(-30);
      expect(domain.maxY).toBe(-5);
    });
  });
});
