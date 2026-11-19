import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { LibrarySearchBar } from '../../src/view/library/LibrarySearchBar';
import { prepareLibraryIndex } from '../../src/core/library/index-contract';
import { emptyQuery, type LibraryIndex } from '../../src/core/library/query';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };

const index: LibraryIndex = prepareLibraryIndex(indexFixture)!;

function render(text: string) {
  return renderToString(
    <LibrarySearchBar index={index} query={{ ...emptyQuery(), text }} onQueryChange={() => {}} />
  );
}

describe('Podpowiedzi szukajki Biblioteki: tylko pobrane (QS04)', () => {
  it('wskaźnik niepobrany nie jest w podpowiedziach', () => {
    const html = render('bezrobocia');
    expect(html).not.toContain('Stopa bezrobocia');
    expect(html).not.toContain('role="option"');
  });

  it('wskaźnik pobrany jest w podpowiedziach', () => {
    const html = render('ludności ogółem');
    expect(html).toContain('role="option"');
    expect(html).toContain('Liczba ludności ogółem');
  });
});
