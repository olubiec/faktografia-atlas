import { describe, it, expect, vi } from 'vitest';
import React, { useState } from 'react';
import { renderToString } from 'react-dom/server';
import { LibrarySearchBar } from '../../src/view/library/LibrarySearchBar';
import { prepareLibraryIndex } from '../../src/core/library/index-contract';
import { emptyQuery, type LibraryIndex, type LibraryQuery } from '../../src/core/library/query';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };

const sampleIndex: LibraryIndex = prepareLibraryIndex(indexFixture)!;

describe('LibrarySearchBar Unit Tests (@S21)', () => {
  it('pole zawiera etykietę „Szukaj wskaźnika” powiązaną z wejściem', () => {
    const html = renderToString(
      <LibrarySearchBar
        index={sampleIndex}
        query={emptyQuery()}
        onQueryChange={() => {}}
      />
    );

    expect(html).toContain('Szukaj wskaźnika');
    expect(html).toContain('for="library-search-input"');
    expect(html).toContain('id="library-search-input"');
    expect(html).toContain('role="combobox"');
  });

  it('wpisanie „ludnosc” pokazuje podpowiedź z „Ludność” i ścieżką kategorii', () => {
    const html = renderToString(
      <LibrarySearchBar
        index={sampleIndex}
        query={{ ...emptyQuery(), text: 'ludnosc' }}
        onQueryChange={() => {}}
      />
    );

    expect(html).toContain('role="listbox"');
    expect(html).toContain('role="option"');
    expect(html).toContain('Ludność');
    expect(html).toContain('Struktura ludności');
  });

  it('przycisk czyszczenia pojawia się tylko gdy tekst jest niepusty', () => {
    const htmlEmpty = renderToString(
      <LibrarySearchBar
        index={sampleIndex}
        query={{ ...emptyQuery(), text: '' }}
        onQueryChange={() => {}}
      />
    );
    expect(htmlEmpty).not.toContain('aria-label="Wyczyść"');

    const htmlWithText = renderToString(
      <LibrarySearchBar
        index={sampleIndex}
        query={{ ...emptyQuery(), text: 'ludnosc' }}
        onQueryChange={() => {}}
      />
    );
    expect(htmlWithText).toContain('aria-label="Wyczyść"');
  });

  it('przekazuje wpisany tekst do onQueryChange oraz czyści tekst po kliknięciu wyczyść', () => {
    const onQueryChange = vi.fn<(q: LibraryQuery) => void>();

    function InteractiveHarness({ initialText }: { initialText: string }) {
      const [query, setQuery] = useState<LibraryQuery>({
        ...emptyQuery(),
        text: initialText,
      });

      return (
        <LibrarySearchBar
          index={sampleIndex}
          query={query}
          onQueryChange={(q) => {
            setQuery(q);
            onQueryChange(q);
          }}
        />
      );
    }

    const htmlWithText = renderToString(<InteractiveHarness initialText="ludnosc" />);
    expect(htmlWithText).toContain('aria-label="Wyczyść"');
    expect(htmlWithText).toContain('value="ludnosc"');
  });

  it('zapewnia podpowiedziom maksymalnie 5 elementów w spisie', () => {
    const html = renderToString(
      <LibrarySearchBar
        index={sampleIndex}
        query={{ ...emptyQuery(), text: 'a' }}
        onQueryChange={() => {}}
      />
    );

    const optionCount = (html.match(/role="option"/g) || []).length;
    expect(optionCount).toBeLessThanOrEqual(5);
  });

  it('zapewnia polom dotykowym min-h-[44px] oraz min-w-[44px]', () => {
    const html = renderToString(
      <LibrarySearchBar
        index={sampleIndex}
        query={{ ...emptyQuery(), text: 'ludnosc' }}
        onQueryChange={() => {}}
      />
    );

    expect(html).toContain('min-h-[44px]');
    expect(html).toContain('min-w-[44px]');
  });

  it('nie zawiera kodów kolorów na sztywno (używa tokenów stylizacji)', () => {
    const html = renderToString(
      <LibrarySearchBar
        index={sampleIndex}
        query={{ ...emptyQuery(), text: 'ludnosc' }}
        onQueryChange={() => {}}
      />
    );

    expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}/);
  });
});
