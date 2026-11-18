import { describe, expect, it, vi, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { prepareLibraryIndex } from '../../src/core/library/index-contract';
import { emptyQuery, type LibraryIndex } from '../../src/core/library/query';
import { resetLibraryCache } from '../../src/core/library/load-library';
import { LibraryFilters } from '../../src/view/library/LibraryFilters';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };

// Efekty w renderToString się nie wykonują; w teście „jedno żądanie” uruchamiamy je ręcznie.
const effectSwitch = vi.hoisted(() => ({ run: false }));
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useEffect: (fn: () => void, deps?: unknown[]) => {
      if (effectSwitch.run) queueMicrotask(() => { try { fn(); } catch { /* setState poza renderem w SSR */ } });
      else actual.useEffect(fn, deps);
    },
  };
});

const { Library, LibraryContent } = await import('../../src/view/pages/Library');

const index: LibraryIndex = prepareLibraryIndex(indexFixture)!;
const SENTENCE =
  '6 wskaźników z danymi (z 12 w spisie GUS). Kolejne dane dochodzą co noc.';

function renderContent(query = emptyQuery()) {
  return renderToString(
    <MemoryRouter>
      <LibraryContent index={index} query={query} onQueryChange={() => {}} onPick={() => {}} />
    </MemoryRouter>
  );
}

// Sama lista wyników (podpowiedzi wyszukiwarki są poza zakresem tego zadania).
function resultsOf(html: string): string {
  return html.slice(html.indexOf('data-testid="library-results"'));
}

afterEach(() => {
  effectSwitch.run = false;
  vi.unstubAllGlobals();
  resetLibraryCache();
});

describe('Strona Biblioteka: tylko pobrane (QC702)', () => {
  it('pokazuje zdanie z licznikami w roli status', () => {
    const html = renderContent();
    expect(html).toContain(SENTENCE);
    expect(html).toMatch(/role="status"[^>]*>[^<]*6 wskaźników z danymi/);
  });

  it('lista nie zawiera niepobranych, zawiera pobrane', () => {
    const html = resultsOf(renderContent());
    expect(html).not.toContain('Stopa bezrobocia');
    expect(html).toContain('Liczba ludności ogółem');
  });

  it('nie ma przełącznika „tylko pobrane”', () => {
    const html = renderContent();
    expect(html).not.toMatch(/tylko już pobrane/i);
    expect(html).not.toContain('library-filter-only-ready');
  });

  it('wyszukiwanie „lud” zawęża w obrębie pobranych, a licznik m się nie zmienia', () => {
    const page = renderContent({ ...emptyQuery(), text: 'lud' });
    const html = resultsOf(page);
    expect(page).toContain(SENTENCE);
    expect(html).toContain('Liczba ludności ogółem');
    expect(html).not.toContain('Ludność w wieku poprodukcyjnym');
    expect(html).toContain('Pokazano 2 z 2 wyników');
  });

  it('LibraryFilters bez nowego propa nadal pokazuje przełącznik', () => {
    const html = renderToString(
      <LibraryFilters index={index} query={emptyQuery()} onQueryChange={() => {}} />
    );
    expect(html).toContain('Tylko już pobrane');
  });

  it('LibraryFilters z showReadyToggle=false ukrywa przełącznik', () => {
    const html = renderToString(
      <LibraryFilters
        index={index}
        query={emptyQuery()}
        onQueryChange={() => {}}
        showReadyToggle={false}
      />
    );
    expect(html).not.toContain('Tylko już pobrane');
  });

  it('parametr &o=1 w adresie nie psuje strony, a p=1 jest ignorowany', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/biblioteka?o=1&p=1']}>
        <LibraryContent
          index={index}
          query={emptyQuery()}
          onQueryChange={() => {}}
          onPick={() => {}}
        />
      </MemoryRouter>
    );
    expect(html).toContain(SENTENCE);
  });

  it('wejście na stronę robi jedno żądanie indeksu', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify(indexFixture), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    effectSwitch.run = true;
    renderToString(
      <MemoryRouter initialEntries={['/biblioteka?o=1']}>
        <Library />
      </MemoryRouter>
    );
    await new Promise((r) => setTimeout(r, 0));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
