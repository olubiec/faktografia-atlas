import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { CompareEmptyState } from '../../src/view/pages/ComparePage';
import { ProfileCompareTable } from '../../src/view/profile/ProfileCompareTable';
import type { UnitProfile, ProfileIndicatorItem } from '../../src/core/profile/profile';
import type { Unit } from '../../src/core/units/types';

const units: Unit[] = [
  { teryt: '12', bdlId: null, name: 'małopolskie', level: 'woj', parent: null, bbox: [0, 0, 1, 1], centroid: [0, 0] },
  { teryt: '14', bdlId: null, name: 'mazowieckie', level: 'woj', parent: null, bbox: [0, 0, 1, 1], centroid: [0, 0] },
  { teryt: '1261', bdlId: null, name: 'powiat Kraków', level: 'pow', parent: '12', bbox: [0, 0, 1, 1], centroid: [0, 0] },
];

function item(value: number | null): ProfileIndicatorItem {
  return {
    indicatorId: 'pop',
    indicator: { id: 'pop', bdlVarId: 1, name: 'Ludność', unit: 'osób', description: '', group: 'x', higherIsBetter: null, minLevel: 'woj' },
    year: 2023, value, rankNational: 1, rankVoivodeship: 1, totalNational: 16, totalVoivodeship: 1, neutral: true, series: [],
  };
}
const profile = (unit: Unit, v: number | null): UnitProfile => ({ teryt: unit.teryt, unit, indicators: [item(v)] });

describe('Porównaj: stan pusty (P1-B)', () => {
  const html = renderToString(
    <StaticRouter location="/porownaj"><CompareEmptyState units={units} a={null} b={null} onPick={() => {}} /></StaticRouter>,
  );

  it('ma dokładnie 3 gotowe pary jako przyciski z min. 44 px wysokości', () => {
    const links = html.match(/<button [^>]*data-slot="compare-pair"[^>]*>/g) ?? [];
    expect(links).toHaveLength(3);
    for (const l of links) {
      expect(l).toMatch(/min-h-\[44px\]/);
    }
  });

  it('pary mają czytelne nazwy „A vs B” (przyciski dostępne z nazwy)', () => {
    expect(html).toContain('Warszawa vs Kraków');
    expect(html).toContain('Wrocław vs Poznań');
    expect(html).toContain('Mazowieckie vs Małopolskie');
  });

  it('ma dwa duże pola wyboru z nazwami dostępnymi i min. 44 px', () => {
    const selects = html.match(/<select [^>]*>/g) ?? [];
    expect(selects).toHaveLength(2);
    for (const s of selects) expect(s).toMatch(/min-h-\[44px\]/);
    expect(html).toContain('Miejsce A');
    expect(html).toContain('Miejsce B');
  });

  it('ma jedno zdanie opisu i brak surowych kluczy', () => {
    expect(html).toContain('Wybierz dwa miejsca');
    expect(html).not.toMatch(/common\.|undefined|null/);
  });
});

describe('Porównaj: wynik (P1-B)', () => {
  it('po wybraniu pary pojawia się >= 1 wiersz z diffText', () => {
    const html = renderToString(
      <ProfileCompareTable profileA={profile(units[1], 110)} profileB={profile(units[0], 100)} />,
    );
    expect(html).toContain('data-slot="compare-row"');
    expect(html).toContain('wyżej o 10');
  });

  it('brak wartości w jednym profilu: komunikat zamiast pustej tabeli', () => {
    const html = renderToString(
      <ProfileCompareTable profileA={profile(units[1], null)} profileB={profile(units[0], 100)} />,
    );
    expect(html).toContain('Brak wspólnych danych');
  });
});
