import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { ProfileCompare } from '../../src/view/profile/ProfileCompare';
import type { MainView } from '../../src/view/map/hooks/useMainView';
import type { Indicator, IndicatorValues, UnitProfile } from '../../src/core/profile/profile';
import type { Unit } from '../../src/core/units/types';
import shard12 from '../fixtures/parts/shard-12.json' with { type: 'json' };

// Wartości „density” z nagranego szardu: 4 gminy województwa 12 (rok 2025).
const values: IndicatorValues = {
  indicatorId: 'density',
  years: shard12.years.density,
  values: Object.fromEntries(
    Object.entries(shard12.values).map(([teryt, v]) => [teryt, v.density]),
  ),
  fetchedAt: '2025-01-01',
};

const mkUnit = (teryt: string, level: Unit['level'], parent: string | null): Unit =>
  ({ teryt, level, parent, bdlId: null, name: teryt, bbox: [0, 0, 0, 0], centroid: [0, 0] }) as Unit;

const units: Unit[] = [
  mkUnit('12', 'woj', null),
  mkUnit('1202024', 'gmi', '12'),
  mkUnit('1202025', 'gmi', '12'),
  mkUnit('1201064', 'gmi', '12'),
  mkUnit('1201065', 'gmi', '12'),
];

const indicator = { id: 'density', name: 'Gęstość', unit: 'os./km2', higherIsBetter: true } as Indicator;

const profileOf = (teryt: string, value: number): UnitProfile => ({
  teryt,
  unit: units.find((u) => u.teryt === teryt)!,
  indicators: [
    {
      indicatorId: 'density',
      indicator,
      year: 2025,
      value,
      // Stare miejsca policzone tylko względem dwóch porównywanych jednostek.
      rankNational: 2,
      rankVoivodeship: 2,
      totalNational: 2,
      totalVoivodeship: 2,
      neutral: false,
      series: [],
    },
  ],
});

const render = (a: UnitProfile, b: UnitProfile, v: IndicatorValues | null) =>
  renderToString(
    createElement(ProfileCompare, {
      profileA: a,
      profileB: b,
      units,
      view: { values: v ?? undefined, indicator, year: 2025 } as unknown as MainView,
    }),
  );

describe('ProfileCompare – ranking z pełnej listy jednostek poziomu', () => {
  it('liczy miejsce względem wszystkich jednostek poziomu, nie tylko dwóch porównywanych', () => {
    // 1400 (1202024), 530 (1201064), 150 (1202025), 130 (1201065)
    const html = render(profileOf('1202024', 1400), profileOf('1201065', 130), values);
    expect(html).toContain('1. miejsce');
    expect(html).toContain('4. miejsce');
    expect(html).not.toContain('2. miejsce');
  });

  it('bez wczytanych wartości zostawia miejsca z profilu', () => {
    const html = render(profileOf('1202024', 1400), profileOf('1201065', 130), null);
    expect(html).toContain('2. miejsce');
  });
});
