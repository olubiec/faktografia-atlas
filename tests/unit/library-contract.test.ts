import { describe, expect, it } from 'vitest';
// @ts-expect-error – skrypt robota to czysty .mjs bez typów
import { buildIndex } from '../../scripts/data/library-index.mjs';
import {
  parseLibraryIndex,
  prepareLibraryIndex,
  titleOf,
} from '../../src/core/library/index-contract';
import {
  categoryPath,
  countByCategory,
  emptyQuery,
  filterVars,
} from '../../src/core/library/query';

// Test kontraktu: robot (buildIndex) → schemat → wyszukiwarka. Ten sam plik, który zapisuje robot,
// ma przejść przez obie strony bez przerabiania ręcznego.
const catalog = {
  version: 1,
  subjects: {
    K1: { id: 'K1', name: 'LUDNOŚĆ', parent: null, path: ['LUDNOŚĆ'] },
    G1: { id: 'G1', name: 'Stan ludności', parent: 'K1', path: ['LUDNOŚĆ', 'Stan ludności'] },
    P1: { id: 'P1', name: 'Ludność wg płci', parent: 'G1', path: ['LUDNOŚĆ', 'Stan ludności', 'Ludność wg płci'] },
    K2: { id: 'K2', name: 'RYNEK PRACY', parent: null, path: ['RYNEK PRACY'] },
    P2: { id: 'P2', name: 'Bezrobotni', parent: 'K2', path: ['RYNEK PRACY', 'Bezrobotni'] },
  },
  variables: {
    1: { id: 1, subjectId: 'P1', n1: 'ogółem', level: 6, unit: 'osoba' },
    2: { id: 2, subjectId: 'P1', n1: 'kobiety', n2: 'ogółem', level: 5, unit: 'osoba' },
    3: { id: 3, subjectId: 'P2', n1: 'zarejestrowani', level: 6, unit: 'osoba' },
    4: { id: 4, subjectId: 'P2', n1: 'ogółem', level: 3, unit: 'osoba' },
  },
};
const state = { done: { 1: '2026-10-26' } };

describe('Kontrakt spisu biblioteki: robot → schemat → wyszukiwarka', () => {
  const raw = JSON.parse(JSON.stringify(buildIndex(catalog, state)));

  it('plik robota przechodzi schemat, zmienna z poziomem < 5 jest pominięta', () => {
    const parsed = parseLibraryIndex(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.variables.map((item) => item.id)).toEqual([1, 2, 3]);
  });

  it('zły kształt albo brak pól daje null, nie wyjątek', () => {
    expect(parseLibraryIndex(null)).toBeNull();
    expect(parseLibraryIndex({ version: 2 })).toBeNull();
    expect(parseLibraryIndex({ ...raw, variables: [{ id: 1 }] })).toBeNull();
    expect(prepareLibraryIndex([])).toBeNull();
  });

  it('wyszukiwarka znajduje zmienną po tekście, kategorii, poziomie i gotowości', () => {
    const index = prepareLibraryIndex(raw);
    expect(index).not.toBeNull();
    if (!index) return;
    expect(filterVars(index, { ...emptyQuery(), text: 'ludnosc' }).map((v) => v.id)).toEqual([2, 1]);
    expect(filterVars(index, { ...emptyQuery(), cat: 'K1' })).toHaveLength(2);
    expect(filterVars(index, { ...emptyQuery(), cat: 'K2' })).toHaveLength(1);
    expect(filterVars(index, { ...emptyQuery(), level: 5 }).map((v) => v.id)).toEqual([2]);
    expect(filterVars(index, { ...emptyQuery(), onlyReady: true }).map((v) => v.id)).toEqual([1]);
    expect(filterVars(index, { ...emptyQuery(), unit: 'osoba' })).toHaveLength(3);
  });

  it('tytuł zmiennej to „Dział: wymiary”, szukanie po nazwie działu znajduje zmienną z samym „ogółem”', () => {
    const index = prepareLibraryIndex(raw);
    if (!index) throw new Error('spis nie przeszedł schematu');
    const variables = Array.isArray(index.variables) ? index.variables : Object.values(index.variables);
    expect(variables.map((v) => v.name)).toEqual([
      'Ludność wg płci: ogółem',
      'Ludność wg płci: kobiety – ogółem',
      'Bezrobotni: zarejestrowani',
    ]);
    expect(titleOf(undefined, 'ogółem')).toBe('ogółem');
    expect(titleOf('Dział', '')).toBe('Dział');
  });

  it('ścieżka kategorii i liczniki liczą się z kategorii robota', () => {
    const index = prepareLibraryIndex(raw);
    if (!index) throw new Error('spis nie przeszedł schematu');
    expect(categoryPath(index, 'P1').map((c) => c.name)).toEqual(['LUDNOŚĆ', 'Stan ludności', 'Ludność wg płci']);
    const counts = countByCategory(index, emptyQuery());
    expect(counts instanceof Map ? counts.get('K1') : (counts as Record<string, number>).K1).toBe(2);
  });
});
