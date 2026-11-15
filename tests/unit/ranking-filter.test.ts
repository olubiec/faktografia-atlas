import { describe, it, expect } from 'vitest';
import { filterRankedUnits } from '../../src/core/ranking/filter-ranked';
import type { RankedUnit } from '../../src/core/ranking/ranking';

const mk = (teryt: string, name: string, rank: number): RankedUnit => ({
  teryt, name, value: 100 - rank, rank, total: 4,
});
const items = [
  mk('24', 'śląskie', 1),
  mk('14', 'mazowieckie', 2),
  mk('02', 'dolnośląskie', 3),
  mk('12', 'małopolskie', 4),
];

describe('filterRankedUnits', () => {
  it('znajduje „śląskie” po frazie „slask” (bez polskich znaków)', () => {
    expect(filterRankedUnits(items, 'slask').map((i) => i.name)).toEqual(['śląskie', 'dolnośląskie']);
  });

  it('wielkość liter nie ma znaczenia', () => {
    expect(filterRankedUnits(items, 'MAZOWIECKIE')).toHaveLength(1);
    expect(filterRankedUnits(items, 'ŚLĄSKIE')[0].name).toBe('śląskie');
  });

  it('spacje na brzegach są ignorowane', () => {
    expect(filterRankedUnits(items, '  mazow  ').map((i) => i.teryt)).toEqual(['14']);
  });

  it('pusta fraza lub same spacje = cała lista w tej samej kolejności', () => {
    expect(filterRankedUnits(items, '').map((i) => i.teryt)).toEqual(['24', '14', '02', '12']);
    expect(filterRankedUnits(items, '   ').map((i) => i.teryt)).toEqual(['24', '14', '02', '12']);
  });

  it('fraza bez trafień = pusta tablica', () => {
    expect(filterRankedUnits(items, 'xyz')).toEqual([]);
  });
});
