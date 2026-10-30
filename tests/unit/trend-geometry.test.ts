import { describe, it, expect } from 'vitest';
import {
  getX,
  getY,
  getXAxisYears,
  buildSegments,
} from '../../src/core/profile/trend-geometry';

describe('trend-geometry', () => {
  describe('getX', () => {
    it('zwraca srodek szerokosci, gdy minYear == maxYear', () => {
      expect(getX(2020, 2020, 2020, 50, 100)).toBe(100); // 50 + 100/2
    });

    it('interpoluje pozycje X miedzy minYear i maxYear', () => {
      // rok na starcie
      expect(getX(2020, 2020, 2030, 0, 100)).toBe(0);
      // rok w polowie
      expect(getX(2025, 2020, 2030, 0, 100)).toBe(50);
      // rok na koncu
      expect(getX(2030, 2020, 2030, 0, 100)).toBe(100);
    });

    it('dziala z offsetem (paddingLeft)', () => {
      expect(getX(2025, 2020, 2030, 20, 100)).toBe(70);
    });
  });

  describe('getY', () => {
    it('zwraca srodek wysokosci, gdy domainMinY == domainMaxY', () => {
      expect(getY(5, 5, 5, 20, 100)).toBe(70); // 20 + 100/2
    });

    it('interpoluje pozycje Y w domenie i odwraca osie (SVG Y rosnie w dol)', () => {
      // wartosc max - powinna byc na górze (paddingTop)
      expect(getY(20, 10, 20, 10, 100)).toBe(10);
      // wartosc min - powinna byc na dole (paddingTop + plotHeight)
      expect(getY(10, 10, 20, 10, 100)).toBe(110);
      // w polowie
      expect(getY(15, 10, 20, 10, 100)).toBe(60);
    });

    it('dziala poprawnie z wartosciami ujemnymi', () => {
      // max = 10, min = -10. Srodek = 0.
      expect(getY(0, -10, 10, 0, 100)).toBe(50);
      expect(getY(-10, -10, 10, 0, 100)).toBe(100); // na samym dole
    });
  });

  describe('getXAxisYears', () => {
    it('zwraca pusta tablice dla pustej tablicy wejsciowej', () => {
      expect(getXAxisYears([])).toEqual([]);
    });

    it('zwraca wszystkie lata, gdy jest ich <= 6', () => {
      expect(getXAxisYears([2018, 2019, 2020, 2021])).toEqual([
        2018, 2019, 2020, 2021,
      ]);
    });

    it('zwraca min, max i w miare rowno rozlozone lata wewnatrz dla > 6 lat', () => {
      const years = [
        2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
      ];
      // min = 2010, max = 2020, 4 posrednie: ~2012, ~2014, ~2016, ~2018
      const res = getXAxisYears(years);
      expect(res).toContain(2010);
      expect(res).toContain(2020);
      expect(res.length).toBeLessThanOrEqual(6); // 2 + do 4
      expect(res).toEqual([...new Set(res)].sort()); // posortowane i unikalne
    });
  });

  describe('buildSegments', () => {
    it('zwraca pustą tablicę dla pustych danych (lub samych nulli)', () => {
      expect(buildSegments([])).toEqual([]);
      expect(
        buildSegments([
          { year: 2020, value: null },
          { year: 2021, value: null },
        ])
      ).toEqual([]);
    });

    it('zwraca pojedynczy segment, jesli wartosci sa ciagle', () => {
      const data = [
        { year: 2020, value: 10 },
        { year: 2021, value: 20 },
      ];
      expect(buildSegments(data)).toEqual([
        [
          { year: 2020, value: 10 },
          { year: 2021, value: 20 },
        ],
      ]);
    });

    it('dzieli na kilka segmentow (luki w latach na null)', () => {
      const data = [
        { year: 2020, value: 10 },
        { year: 2021, value: null },
        { year: 2022, value: 20 },
      ];
      expect(buildSegments(data)).toEqual([
        [{ year: 2020, value: 10 }],
        [{ year: 2022, value: 20 }],
      ]);
    });
  });
});
