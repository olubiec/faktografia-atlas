import { describe, expect, it } from 'vitest';
import { prepareLibraryIndex } from '../../src/core/library/index-contract';
import { LIBRARY_PICK_LIMIT, libraryPickCategories, libraryPickResults } from '../../src/core/library/picker-results';
import indexFixture from '../fixtures/library/index.json';

const index = prepareLibraryIndex(indexFixture)!;

function bigIndex(count: number) {
  return prepareLibraryIndex({
    version: 1,
    categories: { '1': { n: 'Ludność', p: null } },
    units: ['osoba'],
    variables: Array.from({ length: count }, (_, i) => ({ id: String(1000 + i), s: '1', n: `Wymiar ${i}`, l: 5, u: 0, has: 1 })),
  })!;
}

describe('wybór wskaźnika z biblioteki: kategorie i wyniki (FIX4)', () => {
  it('kategorie to działy główne z co najmniej jedną pobraną zmienną, z licznikiem', () => {
    const cats = libraryPickCategories(index);
    expect(cats.length).toBeGreaterThan(0);
    expect(cats.every((c) => c.count > 0)).toBe(true);
    expect(cats.some((c) => c.name === 'Ludność')).toBe(true);
  });

  it('wyniki w dziale zawierają tylko zmienne z tego działu', () => {
    const cats = libraryPickCategories(index);
    const lud = cats.find((c) => c.name === 'Ludność')!;
    const { items } = libraryPickResults(index, { cat: lud.id, text: '' });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((v) => v.name.startsWith('Struktura ludności'))).toBe(true);
  });

  it('wyszukiwanie po tekście ignoruje polskie znaki', () => {
    const { items } = libraryPickResults(index, { cat: null, text: 'ludnosc' });
    expect(items.length).toBeGreaterThan(0);
  });

  it('wyniki są ograniczone do 50, a `total` podaje pełną liczbę', () => {
    const big = bigIndex(120);
    const res = libraryPickResults(big, { cat: null, text: '' });
    expect(LIBRARY_PICK_LIMIT).toBe(50);
    expect(res.items).toHaveLength(50);
    expect(res.total).toBe(120);
  });

  it('pokazuje tylko zmienne z pobranymi danymi', () => {
    const idx = prepareLibraryIndex({
      version: 1,
      categories: { '1': { n: 'Ludność', p: null } },
      units: ['osoba'],
      variables: [
        { id: '1', s: '1', n: 'a', l: 5, u: 0, has: 1 },
        { id: '2', s: '1', n: 'b', l: 5, u: 0, has: 0 },
      ],
    })!;
    expect(libraryPickResults(idx, { cat: null, text: '' }).total).toBe(1);
  });
});
