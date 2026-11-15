import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { prepareLibraryIndex } from '../../src/core/library/index-contract';
import { emptyQuery, type LibraryIndex, type LibraryQuery } from '../../src/core/library/query';
import { LibraryResults } from '../../src/view/library/LibraryResults';
import { paramsFromQuery, queryFromParams } from '../../src/view/library/library-params';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };

const fixtureIndex: LibraryIndex = prepareLibraryIndex(indexFixture)!;

function render(index: LibraryIndex, query: LibraryQuery, pageSize?: number) {
  return renderToString(
    <MemoryRouter>
      <LibraryResults index={index} query={query} onQueryChange={() => {}} pageSize={pageSize} />
    </MemoryRouter>
  );
}

const count = (html: string) => (html.match(/href="\/biblioteka\//g) || []).length;

describe('Biblioteka: domyślnie to, co działa (@P3-C)', () => {
  it('bez parametru p adres daje filtr „tylko z danymi”, p=0 pokazuje wszystkie', () => {
    expect(queryFromParams(new URLSearchParams('')).onlyReady).toBe(true);
    expect(queryFromParams(new URLSearchParams('p=0')).onlyReady).toBe(false);
    expect(queryFromParams(new URLSearchParams('p=1')).onlyReady).toBe(true);
    const all = paramsFromQuery(new URLSearchParams(), { ...emptyQuery(), onlyReady: false });
    expect(all.get('p')).toBe('0');
    const ready = paramsFromQuery(new URLSearchParams('p=0'), { ...emptyQuery(), onlyReady: true });
    expect(ready.has('p')).toBe(false);
  });

  it('na fikturach domyślnie tylko pozycje z danymi, po przełączniku więcej', () => {
    const onlyReady = render(fixtureIndex, { ...emptyQuery(), onlyReady: true });
    const all = render(fixtureIndex, { ...emptyQuery(), onlyReady: false });
    expect(count(onlyReady)).toBe(6);
    expect(count(all)).toBe(12);
    expect(onlyReady).not.toContain('jeszcze niepobrane');
    expect(onlyReady).toContain('Pokaż wszystkie (12)');
  });

  it('liczba na przełączniku jest w formacie pl-PL', () => {
    const vars = Array.from({ length: 1500 }, (_, i) => ({
      id: `v${i}`, name: `Wskaźnik ${i}`, cat: 'c', level: 5, unit: 'osoba', has: i % 2,
    }));
    const html = render({ categories: {}, variables: vars }, { ...emptyQuery(), onlyReady: true });
    const expected = new Intl.NumberFormat('pl-PL').format(1500);
    expect(html).toContain(`Pokaż wszystkie (${expected})`);
  });

  it('pierwsza strona to 20 kart i przycisk „Pokaż więcej” (44 px)', () => {
    const vars = Array.from({ length: 45 }, (_, i) => ({
      id: `p${i}`, name: `Wskaźnik ${i}`, cat: 'c', level: 5, unit: 'osoba', has: 1,
    }));
    const html = render({ categories: {}, variables: vars }, { ...emptyQuery(), onlyReady: true }, 20);
    expect(count(html)).toBe(20);
    expect(html).toContain('Pokazano 20 z 45 wyników');
    expect(html).toContain('Pokaż więcej');
    expect(html).toContain('min-h-[44px]');
  });

  it('karta: tytuł max 2 linie, okruszki skrócone do 2 ostatnich poziomów, pełne w title i aria-label', () => {
    const index: LibraryIndex = {
      categories: {
        a: { id: 'a', name: 'Poziom A', parent: null },
        b: { id: 'b', name: 'Poziom B', parent: 'a' },
        c: { id: 'c', name: 'Poziom C', parent: 'b' },
      },
      variables: [{ id: 'x', name: 'Test', cat: 'c', level: 5, unit: 'osoba', has: 1 }],
    };
    const html = render(index, { ...emptyQuery(), onlyReady: true });
    expect(html).toContain('line-clamp-2');
    expect(html).toContain('Poziom B › Poziom C');
    expect(html).toContain('title="Poziom A › Poziom B › Poziom C"');
    expect(html).toContain('aria-label="Poziom A › Poziom B › Poziom C"');
    expect(html).toContain('dane gotowe');
  });

  it('wyszukiwanie zachowuje filtr, a pusty wynik podpowiada „Pokaż wszystkie”', () => {
    // Pozycja bez danych istnieje, ale filtr „tylko z danymi” ją ukrywa
    const index: LibraryIndex = {
      categories: {},
      variables: [{ id: 'z', name: 'Zupełnie unikalny wskaźnik', cat: 'c', level: 5, unit: 'osoba', has: 0 }],
    };
    const q = { ...emptyQuery(), text: 'unikalny', onlyReady: true };
    const html = render(index, q);
    expect(html).toContain('Brak wyników');
    expect(html).toContain('Pokaż wszystkie (1)');
    expect(html).not.toContain('href="/biblioteka/z"');
    const withAll = render(index, { ...q, onlyReady: false });
    expect(withAll).toContain('href="/biblioteka/z"');
  });

  it('pozycja „jeszcze niepobrane” tłumaczy, że zamówienie to zgłoszenie w repozytorium, i zostaje linkiem', () => {
    const html = render(fixtureIndex, { ...emptyQuery(), onlyReady: false });
    expect(html).toContain('jeszcze niepobrane');
    expect(html).toContain('zgłoszenie w repozytorium');
    expect(html).toContain('nie musisz znać GitHuba');
    expect(html).toMatch(/href="\/biblioteka\/10[0-9]"/);
  });
});
