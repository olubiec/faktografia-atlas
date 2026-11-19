import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { emptyQuery, type LibraryIndex } from '../../src/core/library/query';
import { LibraryResults } from '../../src/view/library/LibraryResults';
import { MyIndicatorsManager } from '../../src/view/main/MobileIndicatorBar';

const index: LibraryIndex = {
  categories: { c: { id: 'c', name: 'Dział', parent: null } },
  variables: [
    { id: '1', name: 'Pobrany wskaźnik', cat: 'c', level: 5, unit: 'osoba', has: 1 },
    { id: '2', name: 'Niepobrany wskaźnik', cat: 'c', level: 5, unit: 'osoba', has: 0 },
  ],
};

describe('Biblioteka: dodawanie do „Moich wskaźników” (@S21)', () => {
  it('pobrany wskaźnik ma przycisk dodania, niepobrany nie', () => {
    const html = renderToString(
      <MemoryRouter>
        <LibraryResults index={index} query={emptyQuery()} />
      </MemoryRouter>
    );
    expect(html).toContain('Dodaj do Moich wskaźników: Pobrany wskaźnik');
    expect(html).not.toContain('Dodaj do Moich wskaźników: Niepobrany wskaźnik');
  });

  it('„Moje wskaźniki” w panelu ma strzałkę rozwijania', () => {
    const html = renderToString(<MyIndicatorsManager all={[]} onPick={() => {}} />);
    expect(html).toContain('Moje wskaźniki');
    expect(html).toContain('<svg');
  });
});
