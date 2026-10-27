import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { prepareLibraryIndex } from '../../src/core/library/index-contract';
import { emptyQuery, type LibraryIndex, type LibraryQuery } from '../../src/core/library/query';
import { LibraryFilters } from '../../src/view/library/LibraryFilters';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };

describe('LibraryFilters Unit Tests (@S21)', () => {
  const preparedIndex = prepareLibraryIndex(indexFixture) as LibraryIndex;

  it('renderuje przełączniki poziomu z właściwym stanem aria-pressed', () => {
    const onQueryChange = vi.fn<(query: LibraryQuery) => void>();
    const query = emptyQuery();

    const htmlDefault = renderToString(
      <LibraryFilters index={preparedIndex} query={query} onQueryChange={onQueryChange} />
    );

    expect(htmlDefault).toContain('aria-pressed="true"');
    expect(htmlDefault).toContain('Wszystkie');
    expect(htmlDefault).toContain('Powiaty');
    expect(htmlDefault).toContain('Gminy');

    const queryPowiaty: LibraryQuery = { ...query, level: 5 };
    const htmlPowiaty = renderToString(
      <LibraryFilters index={preparedIndex} query={queryPowiaty} onQueryChange={onQueryChange} />
    );
    expect(htmlPowiaty).toContain('Powiaty');
    expect(htmlPowiaty).toContain('aria-pressed="true"');

    const queryGminy: LibraryQuery = { ...query, level: 6 };
    const htmlGminy = renderToString(
      <LibraryFilters index={preparedIndex} query={queryGminy} onQueryChange={onQueryChange} />
    );
    expect(htmlGminy).toContain('Gminy');
    expect(htmlGminy).toContain('aria-pressed="true"');
  });

  it('lista jednostek w select jest zgodna z wynikami dla bieżącego zapytania', () => {
    const onQueryChange = vi.fn<(query: LibraryQuery) => void>();
    const query = emptyQuery();

    const html = renderToString(
      <LibraryFilters index={preparedIndex} query={query} onQueryChange={onQueryChange} />
    );

    expect(html).toContain('<select id="library-filter-unit"');
    expect(html).toContain('Wszystkie jednostki');
    expect(html).toContain('<option value="osoba">osoba</option>');
    expect(html).toContain('<option value="lata">lata</option>');
    expect(html).toContain('<option value="zł">zł</option>');
    expect(html).toContain('<option value="mieszkanie">mieszkanie</option>');
    expect(html).toContain('<option value="m²">m²</option>');
    expect(html).toContain('<option value="%">%</option>');
  });

  it('przycisk "Wyczyść filtry" nie renderuje się gdy żaden z 3 filtrów nie jest aktywny', () => {
    const onQueryChange = vi.fn<(query: LibraryQuery) => void>();
    const queryWithCatAndTextOnly: LibraryQuery = {
      cat: '11',
      text: 'ludność',
      level: null,
      unit: null,
      onlyReady: false,
    };

    const html = renderToString(
      <LibraryFilters
        index={preparedIndex}
        query={queryWithCatAndTextOnly}
        onQueryChange={onQueryChange}
      />
    );

    expect(html).not.toContain('Wyczyść filtry');
  });

  it('przycisk "Wyczyść filtry" jest widoczny gdy level, unit lub onlyReady jest ustawiony', () => {
    const onQueryChange = vi.fn<(query: LibraryQuery) => void>();

    const queryWithLevel: LibraryQuery = { ...emptyQuery(), level: 5 };
    const htmlLevel = renderToString(
      <LibraryFilters index={preparedIndex} query={queryWithLevel} onQueryChange={onQueryChange} />
    );
    expect(htmlLevel).toContain('Wyczyść filtry');

    const queryWithUnit: LibraryQuery = { ...emptyQuery(), unit: 'osoba' };
    const htmlUnit = renderToString(
      <LibraryFilters index={preparedIndex} query={queryWithUnit} onQueryChange={onQueryChange} />
    );
    expect(htmlUnit).toContain('Wyczyść filtry');

    const queryWithReady: LibraryQuery = { ...emptyQuery(), onlyReady: true };
    const htmlReady = renderToString(
      <LibraryFilters index={preparedIndex} query={queryWithReady} onQueryChange={onQueryChange} />
    );
    expect(htmlReady).toContain('Wyczyść filtry');
  });

  it('wszystkie interaktywne elementy mają pola dotykowe min. 44 px (min-h-[44px])', () => {
    const onQueryChange = vi.fn<(query: LibraryQuery) => void>();
    const activeQuery: LibraryQuery = {
      cat: null,
      text: '',
      level: 5,
      unit: 'osoba',
      onlyReady: true,
    };

    const html = renderToString(
      <LibraryFilters index={preparedIndex} query={activeQuery} onQueryChange={onQueryChange} />
    );

    const minHeightMatches = html.match(/min-h-\[44px\]/g);
    expect(minHeightMatches).not.toBeNull();
    expect(minHeightMatches!.length).toBeGreaterThanOrEqual(5);
  });

  it('stan aktywnych filtrów jest widoczny (aria-pressed, fajka, pogrubienie)', () => {
    const onQueryChange = vi.fn<(query: LibraryQuery) => void>();
    const activeQuery: LibraryQuery = {
      cat: null,
      text: '',
      level: 5,
      unit: 'osoba',
      onlyReady: true,
    };

    const html = renderToString(
      <LibraryFilters index={preparedIndex} query={activeQuery} onQueryChange={onQueryChange} />
    );

    expect(html).toContain('✓');
    expect(html).toContain('font-bold');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('checked=""');
  });
});
