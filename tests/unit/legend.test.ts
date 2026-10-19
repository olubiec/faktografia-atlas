import { describe, it, expect } from 'vitest';
import { buildLegend } from '../../src/core/legend/legend';

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
});
