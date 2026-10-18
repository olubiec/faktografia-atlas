import { describe, it, expect, beforeEach } from 'vitest';
import unitsData from '../../public/data/units.json';
import { buildIndex } from '../../src/core/units/units';
import type { Unit, UnitIndex } from '../../src/core/units/types';
import { getBreadcrumbs } from '../../src/core/map/breadcrumbs';

describe('Breadcrumbs Logic (CC4.3)', () => {
  let index: UnitIndex;

  beforeEach(() => {
    index = buildIndex(unitsData as Unit[]);
  });

  it('returns Polska for null TERYT', () => {
    const breadcrumbs = getBreadcrumbs(null, index);
    expect(breadcrumbs).toEqual([
      { label: 'Polska', teryt: null },
    ]);
  });

  it('returns Polska for unknown TERYT', () => {
    const breadcrumbs = getBreadcrumbs('9999999', index);
    expect(breadcrumbs).toEqual([
      { label: 'Polska', teryt: null },
    ]);
  });

  it('returns Polska -> województwo for a voivodeship TERYT (02)', () => {
    const breadcrumbs = getBreadcrumbs('02', index);
    expect(breadcrumbs).toEqual([
      { label: 'Polska', teryt: null },
      { label: 'dolnośląskie', teryt: '02' },
    ]);
  });

  it('returns Polska -> województwo -> powiat for a powiat TERYT (0201)', () => {
    const breadcrumbs = getBreadcrumbs('0201', index);
    expect(breadcrumbs).toEqual([
      { label: 'Polska', teryt: null },
      { label: 'dolnośląskie', teryt: '02' },
      { label: 'powiat bolesławiecki', teryt: '0201' },
    ]);
  });

  it('returns Polska -> województwo -> powiat -> gmina for a gmina TERYT (0201011)', () => {
    const breadcrumbs = getBreadcrumbs('0201011', index);
    expect(breadcrumbs).toEqual([
      { label: 'Polska', teryt: null },
      { label: 'dolnośląskie', teryt: '02' },
      { label: 'powiat bolesławiecki', teryt: '0201' },
      { label: 'Bolesławiec', teryt: '0201011' },
    ]);
  });
});
