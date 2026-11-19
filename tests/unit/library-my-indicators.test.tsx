import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { prepareLibraryIndex } from '../../src/core/library/index-contract';
import { emptyQuery, type LibraryIndex } from '../../src/core/library/query';
import { BASIC_INDICATORS } from '../../src/core/my-indicators/my-indicators';
import { LibraryContent } from '../../src/view/pages/Library';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };

const index: LibraryIndex = prepareLibraryIndex(indexFixture)!;

function render(query = emptyQuery()) {
  return renderToString(
    <MemoryRouter>
      <LibraryContent index={index} query={query} onQueryChange={() => {}} onPick={() => {}} personalized />
    </MemoryRouter>
  );
}

function section(html: string): string {
  const start = html.indexOf('data-testid="my-indicators-section"');
  return html.slice(start, html.indexOf('</section>', start));
}

describe('Biblioteka: sekcja „Moje wskaźniki” i pusty stan listy', () => {
  it('bez zapytania pokazuje sekcję z 7 podstawowymi i podpowiedź, nie listę', () => {
    const html = render();
    const mine = section(html);
    expect(mine).toContain('Moje wskaźniki');
    expect(mine.match(/aria-label="Usuń wskaźnik: /g)?.length).toBe(BASIC_INDICATORS.length);
    expect(mine).not.toContain('Przywróć podstawowe');
    expect(html).toContain('Wpisz frazę albo wybierz dział');
    expect(html).not.toContain('Pokazano ');
    expect(html).not.toContain('Liczba ludności ogółem');
  });

  it('po wpisaniu frazy pojawia się lista wyników', () => {
    const html = render({ ...emptyQuery(), text: 'ludnosc' });
    expect(html).not.toContain('Wpisz frazę albo wybierz dział');
    expect(html).toContain('Pokazano ');
    expect(html).toContain('Liczba ludności ogółem');
  });

  it('po wyborze działu pojawia się lista wyników', () => {
    const html = render({ ...emptyQuery(), cat: '1' });
    expect(html).not.toContain('Wpisz frazę albo wybierz dział');
    expect(html).toContain('data-testid="library-results"');
    expect(html).toContain('Pokazano ');
  });

  it('bez trybu strony (domyślnie) lista jest pełna, bez sekcji „Moje”', () => {
    const html = renderToString(
      <MemoryRouter>
        <LibraryContent index={index} query={emptyQuery()} onQueryChange={() => {}} onPick={() => {}} />
      </MemoryRouter>
    );
    expect(html).not.toContain('my-indicators-section');
    expect(html).toContain('Liczba ludności ogółem');
  });
});
