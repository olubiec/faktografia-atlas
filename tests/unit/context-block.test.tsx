import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ContextBlock } from '../../src/view/explain/ContextBlock';
import type { Explanation } from '../../src/core/explain/explanations';

describe('ContextBlock Component (W15-M07)', () => {
  const dummyExplanation: Explanation = {
    indicatorId: 'population',
    short: 'Liczba mieszkańców na koniec roku.',
    howToRead: 'Większa liczba mieszkańców to większy ośrodek.',
    world: null,
    funFact: null,
    definitionUrl: 'https://stat.gov.pl/metainformacje/slownik-pojec/',
  };

  const dummyIndicator = {
    id: 'population',
    name: 'Ludność',
    unit: 'osób',
    higherIsBetter: null,
  };

  const dummyUnit = { teryt: '0201011', name: 'Gmina Testowa', level: 'gmi' as const, parent: '0201' };

  it('renders explanation content and contains no forbidden classes (rounded-*, shadow-*, text-3xs)', () => {
    const dummyItem = {
      indicatorId: 'population',
      name: 'Ludność',
      unit: 'osób',
      higherIsBetter: null,
      value: 1500,
      formattedValue: '1 500',
      rankNational: 10,
      totalNational: 100,
      rankVoivodeship: 2,
      totalVoivodeship: 20,
    };

    const html = renderToString(
      <ContextBlock
        item={dummyItem}
        indicator={dummyIndicator}
        teryt="0201011"
        year={2023}
        units={[dummyUnit]}
        explanation={dummyExplanation}
        showExplanation={true}
      />
    );

    expect(html).toContain('Liczba mieszkańców');
    expect(html).toContain('Większa liczba mieszkańców to większy ośrodek');

    // Brak klas rounded, shadow i nieistniejących rozmiarów tekstu
    expect(html).not.toContain('rounded-full');
    expect(html).not.toContain('rounded-xs');
    expect(html).not.toContain('shadow-xs');
    expect(html).not.toContain('text-3xs');
  });

  it('renders technical position marker when values context is provided', () => {
    const dummyValues = {
      teryt: '0201011',
      years: [2023],
      values: {
        '0201011': [1000],
        '0201021': [2000],
        '0201031': [3000],
      },
    };

    const dummyUnits = [
      dummyUnit,
      { teryt: '0201021', name: 'Gmina 2', level: 'gmi' as const, parent: '0201' },
      { teryt: '0201031', name: 'Gmina 3', level: 'gmi' as const, parent: '0201' },
    ];

    const html = renderToString(
      <ContextBlock
        values={dummyValues}
        indicator={dummyIndicator}
        teryt="0201011"
        year={2023}
        units={dummyUnits}
        explanation={dummyExplanation}
        showExplanation={true}
      />
    );

    expect(html).toContain('Gmina Testowa');
    expect(html).not.toContain('rounded-full');
    expect(html).not.toContain('shadow-xs');
    expect(html).not.toContain('text-3xs');
  });
});
