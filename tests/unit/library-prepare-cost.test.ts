import { beforeEach, describe, expect, it, vi } from 'vitest';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };
import { prepare, parseLibraryIndex } from '../../src/core/library/index-contract';

// Licznik wywołań prawdziwej funkcji normalize (przekazanie do oryginału).
const calls: string[] = [];
vi.mock('../../src/core/search/normalize', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/core/search/normalize')>();
  return {
    ...actual,
    normalize: (s: string) => {
      calls.push(s);
      return actual.normalize(s);
    },
  };
});

import {
  emptyQuery,
  filterFetched,
  filterVars,
  libraryCounts,
  type LibraryIndex,
} from '../../src/core/library/query';

const PREFIX = 'Wskaźnik ';
const nameCalls = () => calls.filter((c) => c.startsWith(PREFIX));

function makeIndex64k(): LibraryIndex {
  return {
    categories: {
      a: { id: 'a', name: 'A', parent: null },
      b: { id: 'b', name: 'B', parent: 'a' },
    },
    variables: Array.from({ length: 64000 }, (_, i) => ({
      id: i + 1,
      name: `${PREFIX}${i}`,
      cat: i % 2 === 0 ? 'a' : 'b',
      level: i % 3 === 0 ? 5 : 6,
      has: i % 640 === 0 ? 1 : 0,
    })),
  };
}

function loadFixture(): LibraryIndex {
  const parsed = parseLibraryIndex(structuredClone(indexFixture));
  if (!parsed) throw new Error('Fixture spisu jest niepoprawny');
  return prepare(parsed);
}

beforeEach(() => {
  calls.length = 0;
});

describe('PF04 – koszt przygotowania spisu biblioteki', () => {
  it('pusta fraza: filterFetched nie normalizuje żadnej nazwy zmiennej', () => {
    const index = makeIndex64k();
    const results = filterFetched(index, emptyQuery());
    expect(results).toHaveLength(100);
    expect(nameCalls()).toHaveLength(0);
  });

  it('fraza tekstowa: każda nazwa najwyżej raz, kolejne zapytanie bez dodatkowych normalizacji', () => {
    const index = makeIndex64k();
    filterVars(index, { ...emptyQuery(), text: 'wskaznik 12' });
    const first = nameCalls().length;
    expect(first).toBeGreaterThan(0);
    expect(first).toBeLessThanOrEqual(64000);
    expect(new Set(nameCalls()).size).toBe(first);

    filterVars(index, { ...emptyQuery(), text: 'wskaznik 7' });
    expect(nameCalls()).toHaveLength(first);
  });

  it('wyniki dla 5 fraz (w tym z polskimi znakami) są takie jak przed zmianą', () => {
    const index = loadFixture();
    const ids = (text: string) => filterVars(index, { ...emptyQuery(), text }).map((v) => String(v.id));
    expect(ids('ludność')).toEqual(['101', '103', '102', '104']);
    expect(ids('ludnosc')).toEqual(['101', '103', '102', '104']);
    expect(ids('mieszkani')).toEqual(['301', '303', '302', '304']);
    expect(ids('ogółem')).toEqual(['101', '304', '201']);
    expect(ids('wieku ludn')).toEqual(['103', '102', '104']);
  });

  it('wyniki z leniwą normalizacją (indeks bez normName) = wyniki z indeksem po prepare', () => {
    const ready = loadFixture();
    const vars = Object.values(ready.variables).map((v) => {
      const { normName: _omit, ...rest } = v;
      void _omit;
      return rest;
    });
    expect(vars.every((v) => !('normName' in v))).toBe(true);
    const lazy: LibraryIndex = { categories: ready.categories, variables: vars };
    for (const text of ['ludność', 'ludnosc', 'ogółem']) {
      const q = { ...emptyQuery(), text };
      expect(filterVars(lazy, q).map((v) => String(v.id))).toEqual(
        filterVars(ready, q).map((v) => String(v.id)),
      );
    }
  });

  it('libraryCounts: 100 z 64 000 bez normalizacji nazw', () => {
    const index = makeIndex64k();
    expect(libraryCounts(index)).toEqual({ fetched: 100, total: 64000 });
    expect(nameCalls()).toHaveLength(0);
  });
});
