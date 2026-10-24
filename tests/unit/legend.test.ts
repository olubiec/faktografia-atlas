import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { buildLegend, LEGEND_DIRECTION_LABEL } from '../../src/core/legend/legend';
import { Legend } from '../../src/view/legend/Legend';
import { IndicatorPanel } from '../../src/view/main/IndicatorPanel';

describe('buildLegend pure function', () => {
  it('generates n + 1 classes + no-data for n breaks with sequential scheme', () => {
    const breaks = [10, 20, 30, 40];
    const legend = buildLegend({
      breaks,
      scheme: 'sequential',
      unit: '%',
    });

    // 4 breaks -> 5 classes + 1 no-data = 6 items
    expect(legend).toHaveLength(6);

    expect(legend[0]).toEqual({
      token: '--seq-1',
      from: null,
      to: 10,
      label: 'poniżej 10,0\u00A0%',
    });

    expect(legend[1]).toEqual({
      token: '--seq-2',
      from: 10,
      to: 20,
      label: 'od 10,0\u00A0% do 20,0\u00A0%',
    });

    expect(legend[2]).toEqual({
      token: '--seq-3',
      from: 20,
      to: 30,
      label: 'od 20,0\u00A0% do 30,0\u00A0%',
    });

    expect(legend[3]).toEqual({
      token: '--seq-4',
      from: 30,
      to: 40,
      label: 'od 30,0\u00A0% do 40,0\u00A0%',
    });

    expect(legend[4]).toEqual({
      token: '--seq-5',
      from: 40,
      to: null,
      label: 'powyżej 40,0\u00A0%',
    });

    expect(legend[5]).toEqual({
      token: '--no-data',
      from: null,
      to: null,
      label: 'brak danych',
    });
  });

  it('works with diverging scheme and integer unit', () => {
    const breaks = [100, 200];
    const legend = buildLegend({
      breaks,
      scheme: 'diverging',
      unit: 'osoba',
    });

    // 2 breaks -> 3 classes + 1 no-data = 4 items
    expect(legend).toHaveLength(4);

    expect(legend[0].token).toBe('--div-1');
    expect(legend[0].label).toBe('poniżej 100\u00A0osoba');

    expect(legend[1].token).toBe('--div-3');
    expect(legend[1].label).toBe('od 100\u00A0osoba do 200\u00A0osoba');

    expect(legend[2].token).toBe('--div-5');
    expect(legend[2].label).toBe('powyżej 200\u00A0osoba');

    expect(legend[3]).toEqual({
      token: '--no-data',
      from: null,
      to: null,
      label: 'brak danych',
    });
  });

  it('handles empty breaks list safely returning only no-data item', () => {
    const legend = buildLegend({
      breaks: [],
      scheme: 'sequential',
      unit: '%',
    });

    expect(legend).toEqual([
      {
        token: '--no-data',
        from: null,
        to: null,
        label: 'brak danych',
      },
    ]);
  });

  it('allows custom noData label string', () => {
    const legend = buildLegend({
      breaks: [5],
      scheme: 'sequential',
      unit: '%',
      noData: 'Brak pomiaru',
    });

    expect(legend).toHaveLength(3);
    expect(legend[2]).toEqual({
      token: '--no-data',
      from: null,
      to: null,
      label: 'Brak pomiaru',
    });
  });

  it('exports LEGEND_DIRECTION_LABEL as "mniej → więcej"', () => {
    expect(LEGEND_DIRECTION_LABEL).toBe('mniej → więcej');
  });

  it('renders "mniej → więcej" in Legend component', () => {
    const items = buildLegend({
      breaks: [10, 20],
      scheme: 'sequential',
      unit: '%',
    });
    const html = renderToString(React.createElement(Legend, { items }));
    expect(html).toContain('mniej → więcej');
  });

  it('ensures IndicatorPanel in both light and dark themes contains "mniej → więcej" and no "ciemniej znaczy więcej"', () => {
    const mockIndicator = {
      id: 'population-density',
      bdlVarId: 1,
      name: 'Gęstość zaludnienia',
      unit: 'os./km²',
      description: 'Opis',
      group: 'demografia',
      higherIsBetter: true,
      minLevel: 'gmi' as const,
    };

    const mockView = {
      indicator: mockIndicator,
      indicators: [mockIndicator],
      year: 2023,
      years: [2023],
      level: 'gmi' as const,
      setIndicator: () => {},
      setYear: () => {},
      setLevel: () => {},
    };

    const mockChoropleth = {
      breaks: [10, 20, 30, 40],
      scheme: 'sequential' as const,
      colors: ['--seq-1', '--seq-2', '--seq-3', '--seq-4', '--seq-5'],
      classifications: new Map(),
    };

    const mockIndex = {
      byTeryt: new Map(),
      all: [],
    };

    const html = renderToString(
      React.createElement(IndicatorPanel, {
        view: mockView,
        choropleth: mockChoropleth,
        ranking: { items: [], total: 0, noDataCount: 0 },
        index: mockIndex,
        selectedTeryt: null,
        onSelectUnit: () => {},
      })
    );

    expect(html).not.toContain('ciemniej znaczy więcej');
    expect(html).not.toContain('Ciemniej znaczy więcej');
    expect(html).toContain('mniej → więcej');
  });
});
