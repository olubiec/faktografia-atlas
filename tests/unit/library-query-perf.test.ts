import { describe, expect, it } from 'vitest';
import { prepare } from '../../src/core/library/index-contract';
import {
  countByCategory,
  emptyQuery,
  filterVars,
  type LibraryIndex,
  type LibraryQuery,
} from '../../src/core/library/query';
import { normalize } from '../../src/core/search/normalize';

describe('W1.26 Library Query Performance (64,000 variables)', () => {
  // Setup 64,000 generated variables with 50 categories
  const categoriesRecord: Record<string, { n: string; p: string | null }> = {
    cat_0: { n: 'Główna kategoria A', p: null },
    cat_1: { n: 'Główna kategoria B', p: null },
  };

  for (let c = 2; c < 50; c++) {
    const parentId = `cat_${c % 2}`;
    categoriesRecord[`cat_${c}`] = { n: `Podkategoria ${c}`, p: parentId };
  }

  const unitsList = ['osoba', 'zł', 'ha', '%', 'sztuka'];

  const robotVars = Array.from({ length: 64000 }, (_, i) => ({
    id: i + 1,
    s: `cat_${i % 50}`,
    n: `Wymiar ${i % 10} - Ludność ${i % 2 === 0 ? 'ogółem' : 'w wieku produkcyjnym'} ${i % 3 === 0 ? 'powiatowa' : 'gminna'}`,
    l: (i % 3 === 0 ? 5 : 6) as 5 | 6,
    u: i % unitsList.length,
    has: (i % 2 === 0 ? 1 : 0) as 0 | 1,
  }));

  const robotIndex = {
    version: 1 as const,
    categories: categoriesRecord,
    units: unitsList,
    variables: robotVars,
  };

  const index: LibraryIndex = prepare(robotIndex);

  it('filtr tekstowy na 64 000 zmiennych wykonuje się w < 150 ms', () => {
    const query: LibraryQuery = {
      ...emptyQuery(),
      text: 'ludnosc powiatowa',
    };

    const start = performance.now();
    const results = filterVars(index, query);
    const duration = performance.now() - start;

    expect(results.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(150);

    // Weryfikacja poprawności wyniku: wszystkie zmienne zawierają 'ludnosc' i 'powiatowa'
    for (const item of results) {
      const norm = normalize(item.name);
      expect(norm).toContain('ludnosc');
      expect(norm).toContain('powiatowa');
    }
  });

  it('filtr poziomu na 64 000 zmiennych wykonuje się w < 150 ms', () => {
    const query: LibraryQuery = {
      ...emptyQuery(),
      level: 5,
    };

    const start = performance.now();
    const results = filterVars(index, query);
    const duration = performance.now() - start;

    expect(results.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(150);
    for (const item of results) {
      expect(item.level).toBe(5);
    }
  });

  it('countByCategory na 64 000 zmiennych wykonuje się w < 150 ms', () => {
    const query: LibraryQuery = {
      ...emptyQuery(),
      text: 'ludnosc',
    };

    const start = performance.now();
    const counts = countByCategory(index, query);
    const duration = performance.now() - start;

    expect(Object.keys(counts).length).toBe(50);
    expect(counts['cat_0']).toBeGreaterThan(0);
    expect(duration).toBeLessThan(150);
  });

  it('wyniki filtrowania są identyczne jak przy użyciu naiwnego filtrowania bez prekomputacji', () => {
    const query: LibraryQuery = {
      ...emptyQuery(),
      cat: 'cat_0',
      text: 'ludnosc',
      level: 5,
      onlyReady: true,
    };

    const results = filterVars(index, query);

    // Na surowym indeksie bez prekomputowanych pól normName
    const rawIndex: LibraryIndex = {
      categories: index.categories,
      variables: index.variables.map((v) => ({
        id: v.id,
        name: v.name,
        cat: v.cat,
        level: v.level,
        unit: v.unit,
        has: v.has,
      })),
    };

    const expectedResults = filterVars(rawIndex, query);

    expect(results.length).toBe(expectedResults.length);
    expect(results.map((r) => r.id)).toEqual(expectedResults.map((r) => r.id));
  });
});
