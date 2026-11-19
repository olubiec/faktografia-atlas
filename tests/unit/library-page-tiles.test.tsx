import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { prepareLibraryIndex } from '../../src/core/library/index-contract';
import { emptyQuery, type LibraryIndex } from '../../src/core/library/query';
import { LibraryContent } from '../../src/view/pages/Library';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };

const index: LibraryIndex = prepareLibraryIndex(indexFixture)!;

// Wariant bez pobranych w dziale „Mieszkania” (kategorie 3 i 31).
const noHousing = prepareLibraryIndex({
  ...indexFixture,
  variables: indexFixture.variables.map((v) => (v.s === '31' ? { ...v, has: 0 } : v)),
})!;

function render(idx: LibraryIndex, query = emptyQuery()) {
  return renderToString(
    <MemoryRouter>
      <LibraryContent index={idx} query={query} onQueryChange={() => {}} onPick={() => {}} />
    </MemoryRouter>
  );
}

function tilesOf(html: string): string {
  const start = html.indexOf('data-testid="category-tiles"');
  const end = html.indexOf('data-testid="popular-searches"');
  return html.slice(start, end);
}

describe('Strona Biblioteka: kafelki działów tylko z pobranymi (QC705)', () => {
  it('kafelek pokazuje liczbę pobranych, nie wszystkich wskaźników', () => {
    const tiles = tilesOf(render(index));
    // Ludność: 2 pobrane z 4; Rynek pracy: 2 z 4; Mieszkania: 2 z 4.
    expect(tiles).toContain('2 wskaźniki');
    expect(tiles).not.toContain('4 wskaźniki');
  });

  it('dział bez pobranych wskaźników nie ma kafelka', () => {
    const tiles = tilesOf(render(noHousing));
    expect(tiles).toContain('Ludność');
    expect(tiles).toContain('Rynek pracy');
    expect(tiles).not.toContain('Mieszkania');
  });

  it('w wybranym dziale bez pobranych pokazuje komunikat zamiast pustych kafelków', () => {
    const html = render(noHousing, { ...emptyQuery(), cat: '3' });
    expect(tilesOf(html)).toContain('Na razie nie ma pobranych wskaźników w tym dziale');
  });

  it('w wybranym dziale kafelki podkategorii mają liczbę pobranych', () => {
    const tiles = tilesOf(render(index, { ...emptyQuery(), cat: '1' }));
    expect(tiles).toContain('Struktura ludności');
    expect(tiles).toContain('2 wskaźniki');
  });
});
