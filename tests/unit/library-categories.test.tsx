import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { emptyQuery, type LibraryIndex, type LibraryQuery } from '../../src/core/library/query';
import { CategoryTiles } from '../../src/view/library/CategoryTiles';

describe('CategoryTiles Unit Tests (@S21)', () => {
  const testIndex: LibraryIndex = {
    categories: {
      c1: { id: 'c1', name: 'Ludność i demografia', parent: null },
      c1_1: { id: 'c1_1', name: 'Struktura ludności', parent: 'c1' },
      c2: { id: 'c2', name: 'Rynek pracy', parent: null },
    },
    variables: [
      { id: 101, name: 'Ludność ogółem', cat: 'c1_1', level: 5, has: 1 },
      { id: 102, name: 'Ludność w wieku produkcyjnym', cat: 'c1_1', level: 6, has: 1 },
      { id: 103, name: 'Przyrost naturalny', cat: 'c1', level: 5, has: 1 },
      { id: 104, name: 'Bezrobotni zarejestrowani', cat: 'c2', level: 5, has: 1 },
    ],
  };

  it('bez wybranej kategorii renderuje kafelki działów głównych z liczbami wskaźników (@S21)', () => {
    const query = emptyQuery();
    const html = renderToString(
      <CategoryTiles index={testIndex} query={query} onQueryChange={() => {}} />
    );

    expect(html).toContain('Ludność i demografia');
    expect(html).toContain('Rynek pracy');
    expect(html).toContain('3 wskaźniki');
    expect(html).toContain('1 wskaźnik');
    expect(html).not.toContain('aria-label="Ścieżka kategorii"');
  });

  it('z wybraną kategorią renderuje okruszki („Wszystkie › Dział”) i kafelki podkategorii (@S21)', () => {
    const query: LibraryQuery = { ...emptyQuery(), cat: 'c1' };
    const html = renderToString(
      <CategoryTiles index={testIndex} query={query} onQueryChange={() => {}} />
    );

    expect(html).toContain('aria-label="Ścieżka kategorii"');
    expect(html).toContain('Wszystkie');
    expect(html).toContain('Ludność i demografia');
    expect(html).toContain('Struktura ludności');
    expect(html).toContain('2 wskaźniki');
  });

  it('dla kategorii będącej liściem renderuje okruszki i brak kafelków podkategorii (@S21)', () => {
    const query: LibraryQuery = { ...emptyQuery(), cat: 'c1_1' };
    const html = renderToString(
      <CategoryTiles index={testIndex} query={query} onQueryChange={() => {}} />
    );

    expect(html).toContain('aria-label="Ścieżka kategorii"');
    expect(html).toContain('Wszystkie');
    expect(html).toContain('Ludność i demografia');
    expect(html).toContain('Struktura ludności');
    expect(html).not.toContain('grid grid-cols-1');
  });

  it('zapewnia polom dotykowym i przyciskom min. 44 px wysokości i szerokości (@S21)', () => {
    const query: LibraryQuery = { ...emptyQuery(), cat: 'c1' };
    const html = renderToString(
      <CategoryTiles index={testIndex} query={query} onQueryChange={() => {}} />
    );

    expect(html).toContain('min-h-[44px]');
    expect(html).toContain('min-w-[44px]');
  });

  it('nie używa kolorów pisanych na sztywno (zgodność z tokenami) (@S21)', () => {
    const query: LibraryQuery = { ...emptyQuery(), cat: 'c1' };
    const html = renderToString(
      <CategoryTiles index={testIndex} query={query} onQueryChange={() => {}} />
    );

    expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}/);
  });
});
