import { describe, expect, it } from 'vitest';
import {
  categoryPath,
  childCategories,
  countByCategory,
  emptyQuery,
  filterVars,
  type LibraryIndex,
  type LibraryQuery,
} from '../../src/core/library/query';

describe('Library Query Logic (W1.22)', () => {
  const testIndex: LibraryIndex = {
    categories: {
      c1: { id: 'c1', name: 'Ludność i demografia', parent: null },
      c1_1: { id: 'c1_1', name: 'Struktura ludności', parent: 'c1' },
      c2: { id: 'c2', name: 'Rynek pracy', parent: null },
    },
    variables: [
      { id: 101, name: 'Ludność ogółem', cat: 'c1_1', level: 5, has: 1, unit: 'osoba' },
      { id: 102, name: 'Ludność w wieku produkcyjnym', cat: 'c1_1', level: 6, has: 0, unit: 'osoba' },
      { id: 103, name: 'Przyrost naturalny na 1000 ludności', cat: 'c1', level: 5, has: 1, unit: 'osoba' },
      { id: 104, name: 'Bezrobotni zarejestrowani', cat: 'c2', level: 5, has: 1, unit: 'osoba' },
    ],
  };

  it('emptyQuery() zwraca domyślne puste zapytanie', () => {
    const q = emptyQuery();
    expect(q).toEqual({
      cat: null,
      text: '',
      level: null,
      unit: null,
      onlyReady: false,
    });
  });

  it('wyszukiwanie po tekście bez względu na polskie znaki („ludnosc” znajduje „Ludność”)', () => {
    const query: LibraryQuery = { ...emptyQuery(), text: 'ludnosc' };
    const results = filterVars(testIndex, query);
    expect(results.map((v) => v.name)).toEqual([
      'Ludność ogółem',
      'Ludność w wieku produkcyjnym',
      'Przyrost naturalny na 1000 ludności',
    ]);
  });

  it('kategoria nadrzędna obejmuje zmienne podkategorii', () => {
    const queryParent: LibraryQuery = { ...emptyQuery(), cat: 'c1' };
    const resultsParent = filterVars(testIndex, queryParent);
    expect(resultsParent.map((v) => v.id)).toEqual([101, 102, 103]);

    const querySub: LibraryQuery = { ...emptyQuery(), cat: 'c1_1' };
    const resultsSub = filterVars(testIndex, querySub);
    expect(resultsSub.map((v) => v.id)).toEqual([101, 102]);
  });

  it('onlyReady zostawia zmienne z has = 1', () => {
    const query: LibraryQuery = { ...emptyQuery(), cat: 'c1', onlyReady: true };
    const results = filterVars(testIndex, query);
    expect(results.map((v) => v.id)).toEqual([101, 103]);
  });

  it('level 5 nie zwraca zmiennych tylko gminnych (level = 6)', () => {
    const query: LibraryQuery = { ...emptyQuery(), cat: 'c1', level: 5 };
    const results = filterVars(testIndex, query);
    expect(results.map((v) => v.id)).toEqual([101, 103]);
    expect(results.some((v) => v.level === 6)).toBe(false);
  });

  it('childCategories i categoryPath działają poprawnie', () => {
    const rootChildren = childCategories(testIndex, null);
    expect(rootChildren.map((c) => c.id)).toEqual(['c1', 'c2']);

    const c1Children = childCategories(testIndex, 'c1');
    expect(c1Children.map((c) => c.id)).toEqual(['c1_1']);

    const path = categoryPath(testIndex, 'c1_1');
    expect(path.map((c) => c.name)).toEqual(['Ludność i demografia', 'Struktura ludności']);
  });

  it('liczniki kategorii zgodne z wynikami z uwzględnieniem podkategorii', () => {
    const query: LibraryQuery = { ...emptyQuery(), text: 'ludnosc' };
    const counts = countByCategory(testIndex, query);

    // W c1 są 3 zmienne z 'ludnosc' (103 bezpośrednio w c1, 101 i 102 w podkategorii c1_1)
    expect(counts['c1']).toBe(3);
    expect(counts['c1_1']).toBe(2);
    expect(counts['c2']).toBe(0);
  });

  it('20 000 zmiennych filtrowanych w < 100 ms (test wydajności z progiem 500 ms)', () => {
    const largeCategories: Record<string, { id: string; name: string; parent: string | null }> = {
      root: { id: 'root', name: 'Kategoria Główna', parent: null },
    };

    for (let i = 0; i < 20; i++) {
      largeCategories[`sub_${i}`] = { id: `sub_${i}`, name: `Podkategoria ${i}`, parent: 'root' };
    }

    const largeVars = Array.from({ length: 20000 }, (_, i) => ({
      id: i,
      name: `Zmienna statystyczna ${i} ${i % 2 === 0 ? 'Ludność' : 'Praca'} ${i % 3 === 0 ? 'powiatowa' : 'gminna'}`,
      cat: `sub_${i % 20}`,
      level: i % 3 === 0 ? 5 : 6,
      has: i % 2 === 0 ? 1 : 0,
      unit: 'osoba',
    }));

    const largeIndex: LibraryIndex = {
      categories: largeCategories,
      variables: largeVars,
    };

    const query: LibraryQuery = {
      cat: 'root',
      text: 'ludnosc powiatowa',
      level: 5,
      unit: 'osoba',
      onlyReady: true,
    };

    const start = performance.now();
    const results = filterVars(largeIndex, query);
    const duration = performance.now() - start;

    expect(results.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(500);
  });
});
