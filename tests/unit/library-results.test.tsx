import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { emptyQuery, type LibraryIndex, type LibraryQuery } from '../../src/core/library/query';
import { LibraryResults } from '../../src/view/library/LibraryResults';

describe('LibraryResults Unit Tests (@S21)', () => {
  const sampleIndex: LibraryIndex = {
    categories: {
      cat1: { id: 'cat1', name: 'Ludność i demografia', parent: null },
      cat1_1: { id: 'cat1_1', name: 'Struktura wieku', parent: 'cat1' },
    },
    variables: [
      {
        id: 'var1',
        name: 'Ludność ogółem',
        cat: 'cat1_1',
        level: 5,
        unit: 'osoba',
        has: 1,
      },
      {
        id: 'var2',
        name: 'Kobiety w wieku produkcyjnym',
        cat: 'cat1_1',
        level: 6,
        unit: 'osoba',
        has: 0,
      },
    ],
  };

  it('renderuje listę wskaźników z odnośnikiem do /biblioteka/<id>, poziomem, jednostką i określeniem stanu z tekstem', () => {
    const html = renderToString(
      <MemoryRouter>
        <LibraryResults index={sampleIndex} query={emptyQuery()} />
      </MemoryRouter>
    );

    expect(html).toContain('data-testid="library-results"');
    expect(html).toContain('href="/biblioteka/var1"');
    expect(html).toContain('href="/biblioteka/var2"');
    expect(html).toContain('Ludność i demografia › Struktura wieku');
    expect(html).toContain('Ludność ogółem');
    expect(html).toContain('Kobiety w wieku produkcyjnym');
    expect(html).toContain('Jednostka:');
    expect(html).toContain('osoba');
    expect(html).toContain('Poziom:');
    expect(html).toContain('powiaty');
    expect(html).toContain('gminy i powiaty');
    expect(html).toContain('można przeglądać');
    expect(html).toContain('jeszcze niepobrane');
  });

  it('ogranicza pierwsze wyświetlenie do 50 wyników dla zestawu 120 zmiennych oraz wyświetla przycisk Pokaż więcej', () => {
    const vars120 = Array.from({ length: 120 }, (_, i) => {
      const num = String(i + 1).padStart(3, '0');
      return {
        id: `id_${num}`,
        name: `Wskaźnik testowy numer ${num}`,
        cat: 'cat1_1',
        level: i % 2 === 0 ? 5 : 6,
        unit: 'osoba',
        has: i % 2 === 0 ? 1 : 0,
      };
    });

    const largeIndex: LibraryIndex = {
      categories: sampleIndex.categories,
      variables: vars120,
    };

    const htmlInitial = renderToString(
      <MemoryRouter>
        <LibraryResults index={largeIndex} query={emptyQuery()} />
      </MemoryRouter>
    );

    const matchesCount = (htmlInitial.match(/href="\/biblioteka\/id_/g) || []).length;
    expect(matchesCount).toBe(50);
    expect(htmlInitial).toContain('Pokazano 50 z 120 wyników');
    expect(htmlInitial).toContain('Pokaż więcej');
    expect(htmlInitial).toContain('href="/biblioteka/id_001"');
    expect(htmlInitial).toContain('href="/biblioteka/id_050"');
    expect(htmlInitial).not.toContain('href="/biblioteka/id_051"');
  });

  it('wyświetla jasny komunikat w przypadku braku wyników filtrowania', () => {
    const queryNoResults: LibraryQuery = {
      ...emptyQuery(),
      text: 'nieistniejacazmienna123456789',
    };

    const html = renderToString(
      <MemoryRouter>
        <LibraryResults index={sampleIndex} query={queryNoResults} />
      </MemoryRouter>
    );

    expect(html).toContain('Brak wyników. Spróbuj innego słowa albo zdejmij filtry.');
  });

  it('zapewnia obsługę długich nazw przez zawijanie oraz touch targets min. 44px', () => {
    const longNameIndex: LibraryIndex = {
      categories: sampleIndex.categories,
      variables: [
        {
          id: 'long1',
          name: 'Bardzo długa nazwa wskaźnika statystycznego dotyczącego struktury wiekowej ludności zamieszkującej na terenach wiejskich i miejskich',
          cat: 'cat1_1',
          level: 5,
          unit: 'osoba',
          has: 1,
        },
      ],
    };

    const html = renderToString(
      <MemoryRouter>
        <LibraryResults index={longNameIndex} query={emptyQuery()} />
      </MemoryRouter>
    );

    expect(html).toContain('break-words');
    expect(html).toContain('min-h-[44px]');
  });

  it('zgodność z tokenami (brak sztywnych kodów kolorów, brak zakazanych zaokrągleń)', () => {
    const html = renderToString(
      <MemoryRouter>
        <LibraryResults index={sampleIndex} query={emptyQuery()} />
      </MemoryRouter>
    );

    expect(html).toContain('bg-arkusz');
    expect(html).toContain('border-linia');
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    expect(html).not.toMatch(/rounded-(?!none)/);
  });
});
