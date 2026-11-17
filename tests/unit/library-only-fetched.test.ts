import { describe, expect, it } from 'vitest';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };
import { prepare, parseLibraryIndex } from '../../src/core/library/index-contract';
import {
  childCategories,
  childCategoriesWithData,
  countFetchedByCategory,
  emptyQuery,
  filterFetched,
  filterVars,
  libraryCounts,
  type LibraryIndex,
} from '../../src/core/library/query';

function loadFixture(): LibraryIndex {
  const parsed = parseLibraryIndex(structuredClone(indexFixture));
  if (!parsed) throw new Error('Fixture spisu jest niepoprawny');
  return prepare(parsed);
}

const isFetched = (has: unknown) => has === 1 || has === true;

describe('QC701 – biblioteka: tylko pobrane + liczniki', () => {
  it('filterFetched z pustym zapytaniem zwraca 6 zmiennych, każda z danymi', () => {
    const results = filterFetched(loadFixture(), emptyQuery());
    expect(results).toHaveLength(6);
    for (const v of results) expect(isFetched(v.has)).toBe(true);
  });

  it('libraryCounts zwraca { fetched: 6, total: 12 }', () => {
    expect(libraryCounts(loadFixture())).toEqual({ fetched: 6, total: 12 });
  });

  it('dział bez pobranych nie występuje w childCategoriesWithData', () => {
    const raw = structuredClone(indexFixture) as typeof indexFixture;
    // Dział „Mieszkania” (3 > 31): odbieramy dane obu pobranym zmiennym
    for (const v of raw.variables) if (v.s === '31') v.has = 0;
    const parsed = parseLibraryIndex(raw);
    if (!parsed) throw new Error('Fixture niepoprawny');
    const index = prepare(parsed);

    const roots = childCategoriesWithData(index, null).map((c) => c.id);
    expect(roots).toEqual(expect.arrayContaining(['1', '2']));
    expect(roots).not.toContain('3');
    expect(childCategoriesWithData(index, '3')).toEqual([]);
    // Zwykła wersja nadal pokazuje wszystkie 3 działy główne
    expect(childCategories(index, null)).toHaveLength(3);
  });

  it('countFetchedByCategory: dział nadrzędny = suma pobranych potomków', () => {
    const counts = countFetchedByCategory(loadFixture());
    // Struktura ludności: 101 i 102 mają dane (103, 104 nie)
    expect(counts.get('11')).toBe(2);
    // Ludność nie ma własnych zmiennych, więc = suma potomków
    expect(counts.get('1')).toBe(2);
    expect(counts.get('2')).toBe(2);
    expect(counts.get('3')).toBe(2);
  });

  it('wyszukiwanie „bezrob” nie zwraca niepobranej „Stopa bezrobocia”', () => {
    const index = loadFixture();
    const all = filterVars(index, { ...emptyQuery(), text: 'bezrob' });
    expect(all.some((v) => v.name.includes('Stopa bezrobocia'))).toBe(true);

    const fetched = filterFetched(index, { ...emptyQuery(), text: 'bezrob' });
    expect(fetched.map((v) => v.id)).toEqual(['202']);
    expect(fetched.some((v) => v.name.includes('Stopa bezrobocia'))).toBe(false);
  });

  it('filtr poziomu 5 i 6 działa razem z filterFetched', () => {
    const index = loadFixture();
    const l5 = filterFetched(index, { ...emptyQuery(), level: 5 }).map((v) => String(v.id)).sort();
    const l6 = filterFetched(index, { ...emptyQuery(), level: 6 }).map((v) => String(v.id)).sort();
    expect(l5).toEqual(['101', '201', '301']);
    expect(l6).toEqual(['102', '202', '302']);
  });

  it('istniejące eksporty zachowują wyniki (emptyQuery → 12, onlyReady:false)', () => {
    const q = emptyQuery();
    expect(q.onlyReady).toBe(false);
    expect(filterVars(loadFixture(), q)).toHaveLength(12);
  });

  it('wydajność: 64 000 zmiennych → filterFetched < 200 ms', () => {
    const index: LibraryIndex = {
      categories: {
        a: { id: 'a', name: 'A', parent: null },
        b: { id: 'b', name: 'B', parent: 'a' },
      },
      variables: Array.from({ length: 64000 }, (_, i) => ({
        id: i + 1,
        name: `Wskaźnik ${i}`,
        cat: i % 2 === 0 ? 'a' : 'b',
        level: i % 3 === 0 ? 5 : 6,
        has: i % 640 === 0 ? 1 : 0,
      })),
    };
    const start = performance.now();
    const results = filterFetched(index, emptyQuery());
    const duration = performance.now() - start;
    expect(results).toHaveLength(100);
    expect(libraryCounts(index)).toEqual({ fetched: 100, total: 64000 });
    expect(duration).toBeLessThan(200);
  });
});
