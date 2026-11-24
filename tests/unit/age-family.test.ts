import { describe, expect, it } from 'vitest';
import { buildCatalogTree, flattenTree } from '../../src/core/catalog/tree';
import { buildAgeFamilies, familyOf } from '../../src/core/catalog/age-family';

const vars = (name: string, from: number) =>
  Array.from({ length: 6 }, (_, i) => ({
    id: String(from + i), n: `${name} – ${i}`, u: 'osoba', c: 'LUDNOŚĆ > STAN LUDNOŚCI > Ludność wg roczników',
    lv: ['woj', 'pow', 'gmi'] as ('woj' | 'pow' | 'gmi')[], y: [2024],
  }));

describe('rodziny wieku', () => {
  it('pojedyncze roczniki wieku nie trafiają do menu', () => {
    const entries = flattenTree(buildCatalogTree([], { version: 1, variables: vars('ogółem', 100) }));
    expect(entries).toHaveLength(0);
  });
  it('buildAgeFamilies znajduje rodzinę po id i sortuje roczniki', () => {
    const fams = buildAgeFamilies(vars('mężczyźni', 200));
    expect(fams).toHaveLength(1);
    expect(familyOf(fams, '203')?.members.map((m) => m.age)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(familyOf(fams, '999')).toBeNull();
  });
  it('mniej niż 4 roczniki nie tworzą rodziny', () => {
    expect(buildAgeFamilies(vars('x', 1).slice(0, 3))).toHaveLength(0);
  });
});
