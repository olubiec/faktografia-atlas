import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { LibrarySearchBar } from '../../src/view/library/LibrarySearchBar';
import { prepareLibraryIndex } from '../../src/core/library/index-contract';
import { emptyQuery, type LibraryIndex } from '../../src/core/library/query';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };

const sampleIndex: LibraryIndex = prepareLibraryIndex(indexFixture)!;

function render(text: string): string {
  return renderToString(
    <LibrarySearchBar
      index={sampleIndex}
      query={{ ...emptyQuery(), text, onlyReady: true }}
      onQueryChange={() => {}}
    />,
  );
}

describe('Podpowiedzi biblioteki z całego spisu (@S21)', () => {
  it('„Mediana” przy onlyReady: true podpowiada „Mediana wieku” ze znacznikiem „do zamówienia”', () => {
    const html = render('Mediana');
    expect(html).toContain('Mediana wieku');
    expect(html).toContain('do zamówienia');
  });

  it('wskaźnik z danymi nie ma znacznika „do zamówienia”', () => {
    const html = render('ludnosc');
    expect(html).toContain('Liczba ludności ogółem');
    // opcja „Liczba ludności ogółem” (has: 1) nie ma znacznika ani etykiety „do zamówienia”
    const option = html.split('<li ').find((li) => li.includes('Liczba ludności ogółem'))!;
    expect(option).toBeDefined();
    expect(option).not.toContain('do zamówienia');
  });
});
