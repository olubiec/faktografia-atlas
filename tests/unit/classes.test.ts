import { describe, test, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { computeBreaks, classify, classColorToken } from '../../src/core/map/classes';
import syntheticData from '../fixtures/synthetic/values-sample.json';

describe('CC8.1 - Klasy kolorów kartogramu (czysta logika)', () => {
  describe('computeBreaks', () => {
    test('zwraca n - 1 progów rosnąco dla metody equal i quantile, pomijając null', () => {
      const values = [10, 20, 30, null, 40, 50];
      const equalBreaks = computeBreaks(values, 'equal', 5);
      expect(equalBreaks).toHaveLength(4);
      expect(equalBreaks).toEqual([18, 26, 34, 42]);

      const quantileBreaks = computeBreaks(values, 'quantile', 5);
      expect(quantileBreaks).toHaveLength(4);
      // Sprawdzenie rosnącej kolejności progów
      for (let i = 0; i < quantileBreaks.length - 1; i++) {
        expect(quantileBreaks[i]).toBeLessThanOrEqual(quantileBreaks[i + 1]);
      }
    });

    test('obsługuje przypadek brzegowy: wszystkie wartości równe', () => {
      const values = [10, 10, 10, 10];
      const equalBreaks = computeBreaks(values, 'equal', 5);
      expect(equalBreaks).toHaveLength(4);
      expect(equalBreaks).toEqual([10, 10, 10, 10]);

      const quantileBreaks = computeBreaks(values, 'quantile', 5);
      expect(quantileBreaks).toHaveLength(4);
      expect(quantileBreaks).toEqual([10, 10, 10, 10]);
    });

    test('obsługuje przypadek brzegowy: mniej różnych wartości niż klas', () => {
      const values = [10, 50];
      const breaks = computeBreaks(values, 'equal', 5);
      expect(breaks).toHaveLength(4);
      expect(breaks).toEqual([18, 26, 34, 42]);
    });

    test('obsługuje przypadek brzegowy: jedna wartość', () => {
      const values = [42];
      const equalBreaks = computeBreaks(values, 'equal', 5);
      expect(equalBreaks).toHaveLength(4);
      expect(equalBreaks).toEqual([42, 42, 42, 42]);

      const quantileBreaks = computeBreaks(values, 'quantile', 5);
      expect(quantileBreaks).toHaveLength(4);
      expect(quantileBreaks).toEqual([42, 42, 42, 42]);
    });

    test('obsługuje przypadek brzegowy: sama lista null', () => {
      const values = [null, null, null];
      const equalBreaks = computeBreaks(values, 'equal', 5);
      expect(equalBreaks).toEqual([]);

      const quantileBreaks = computeBreaks(values, 'quantile', 5);
      expect(quantileBreaks).toEqual([]);
    });

    test('poprawnie wylicza progi dla danych syntetycznych z pliku fixture', () => {
      expect(syntheticData._comment).toBe('dane syntetyczne do testu');
      const year2022Values = Object.values(syntheticData.values).map(v => v[0]);
      const breaks = computeBreaks(year2022Values, 'equal', 5);
      expect(breaks).toHaveLength(4);
    });
  });

  describe('classify', () => {
    const breaks = [20, 30, 40, 50]; // 5 klas

    test('przypisuje indeks klasy 0...n-1 dla wartości liczbowych', () => {
      expect(classify(10, breaks)).toBe(0);
      expect(classify(20, breaks)).toBe(1);
      expect(classify(25, breaks)).toBe(1);
      expect(classify(30, breaks)).toBe(2);
      expect(classify(45, breaks)).toBe(3);
      expect(classify(50, breaks)).toBe(4);
      expect(classify(100, breaks)).toBe(4);
    });

    test('zwraca "no-data" dla null oraz NaN', () => {
      expect(classify(null, breaks)).toBe('no-data');
      expect(classify(NaN, breaks)).toBe('no-data');
    });
  });

  describe('classColorToken', () => {
    test('zwraca właściwą nazwę zmiennej CSS dla skali sequential', () => {
      expect(classColorToken(0, 5, 'sequential')).toBe('--seq-1');
      expect(classColorToken(1, 5, 'sequential')).toBe('--seq-2');
      expect(classColorToken(2, 5, 'sequential')).toBe('--seq-3');
      expect(classColorToken(3, 5, 'sequential')).toBe('--seq-4');
      expect(classColorToken(4, 5, 'sequential')).toBe('--seq-5');
    });

    test('zwraca właściwą nazwę zmiennej CSS dla skali diverging', () => {
      expect(classColorToken(0, 5, 'diverging')).toBe('--div-1');
      expect(classColorToken(2, 5, 'diverging')).toBe('--div-3');
      expect(classColorToken(4, 5, 'diverging')).toBe('--div-5');
    });

    test('zwraca token braku danych dla "no-data"', () => {
      expect(classColorToken('no-data', 5, 'sequential')).toBe('--no-data');
      expect(classColorToken('no-data', 5, 'diverging')).toBe('--no-data');
    });

    test('nigdy nie zwraca koloru w formacie hex (#)', () => {
      const tokens = [
        classColorToken(0, 5, 'sequential'),
        classColorToken(4, 5, 'sequential'),
        classColorToken(0, 5, 'diverging'),
        classColorToken('no-data', 5, 'sequential'),
      ];
      tokens.forEach(token => {
        expect(token).not.toMatch(/^#/);
        expect(token.startsWith('--')).toBe(true);
      });
    });
  });

  describe('Izolacja zależności (brak React, DOM, deck.gl)', () => {
    test('src/core/map/classes.ts nie importuje Reacta, DOM ani deck.gl', () => {
      const filePath = path.resolve(__dirname, '../../src/core/map/classes.ts');
      const content = fs.readFileSync(filePath, 'utf8');

      expect(content).not.toMatch(/from\s+['"]react['"]/);
      expect(content).not.toMatch(/from\s+['"]react-dom['"]/);
      expect(content).not.toMatch(/from\s+['"]@deck\.gl/);
      expect(content).not.toMatch(/window\./);
      expect(content).not.toMatch(/document\./);
    });
  });
});
