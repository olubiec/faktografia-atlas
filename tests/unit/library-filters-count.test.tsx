import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { prepareLibraryIndex } from '../../src/core/library/index-contract';
import { emptyQuery, type LibraryIndex, type LibraryQuery } from '../../src/core/library/query';
import { LibraryFilters } from '../../src/view/library/LibraryFilters';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };

describe('LibraryFilters: licznik aktywnych filtrów (@S21)', () => {
  const index = prepareLibraryIndex(indexFixture) as LibraryIndex;

  const render = (query: LibraryQuery) =>
    renderToString(
      <LibraryFilters
        index={index}
        query={query}
        onQueryChange={vi.fn<(q: LibraryQuery) => void>()}
      />,
    );

  // renderToString wstawia <!-- --> między fragmenty tekstu
  const text = (html: string) => html.replace(/<!-- -->/g, '');

  it('onlyReady bez poziomu i jednostki: aktywne 0', () => {
    expect(text(render({ ...emptyQuery(), onlyReady: true }))).toContain('Filtry (aktywne: 0)');
  });

  it('z poziomem: aktywne 1', () => {
    expect(text(render({ ...emptyQuery(), onlyReady: true, level: 5 }))).toContain(
      'Filtry (aktywne: 1)',
    );
  });

  it('z poziomem i jednostką: aktywne 2', () => {
    expect(
      text(render({ ...emptyQuery(), onlyReady: true, level: 5, unit: 'osoba' })),
    ).toContain('Filtry (aktywne: 2)');
  });

  it('onlyReady false bez innych: aktywne 0', () => {
    expect(text(render({ ...emptyQuery(), onlyReady: false }))).toContain('Filtry (aktywne: 0)');
  });
});
