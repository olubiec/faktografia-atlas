import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import indicators from '../../config/indicators.json';
import partsConfig from '../../config/parts.json';
import { isPartsIndicator, partsIndicatorIds } from '../../src/core/parts/allowed';

describe('parts-allowed', () => {
  it('config/parts.json ma dokładnie 14 id i brak duplikatów', () => {
    expect(partsConfig).toHaveLength(14);
    const uniqueIds = new Set(partsConfig);
    expect(uniqueIds.size).toBe(14);
  });

  it('każdy wskaźnik z parts.json istnieje w config/indicators.json i ma minLevel gmi', () => {
    for (const id of partsConfig) {
      const found = indicators.find((ind) => ind.id === id);
      expect(found, `Wskaźnik ${id} powinien istnieć w indicators.json`).toBeDefined();
      expect(found?.minLevel, `Wskaźnik ${id} powinien mieć minLevel gmi`).toBe('gmi');
    }
  });

  it('income-per-capita i spending-per-capita nie znajdują się na liście', () => {
    expect(partsConfig).not.toContain('income-per-capita');
    expect(partsConfig).not.toContain('spending-per-capita');
  });

  it('isPartsIndicator działa poprawnie', () => {
    expect(isPartsIndicator('population')).toBe(true);
    expect(isPartsIndicator('avg-wage')).toBe(false);
  });

  it('partsIndicatorIds zwraca pełną tablicę 14 id', () => {
    const ids = partsIndicatorIds();
    expect(ids).toHaveLength(14);
    expect(ids).toEqual([
      'population',
      'density',
      'median-age',
      'share-65plus',
      'natural-increase',
      'migration-balance',
      'regon-per-10k',
      'dwellings-per-1000',
      'dwelling-area-per-person',
      'sewerage-share',
      'forest-cover',
      'library-readers-per-1000',
      'preschool-3-6',
      'unemployed-share-working-age',
    ]);
  });

  it('plik config/parts.json jest sformatowany bez wcięć', () => {
    const filePath = resolve(__dirname, '../../config/parts.json');
    const content = readFileSync(filePath, 'utf-8').trim();
    expect(content).not.toMatch(/\n\s+/);
    expect(content.startsWith('[')).toBe(true);
    expect(content.endsWith(']')).toBe(true);
  });
});
