import { describe, expect, it } from 'vitest';
import { effectiveUnit } from '../../src/core/catalog/effective-unit';

describe('effectiveUnit', () => {
  it('„osoba” przy przeliczeniu na 1000 dzieci → „na 1000 dzieci w wieku do lat 3”', () => {
    expect(effectiveUnit('dzieci w żłobkach na 1000 dzieci w wieku do lat 3', 'osoba')).toBe('na 1000 dzieci w wieku do lat 3');
  });
  it('„-” i „szt.” przy „na 1000 ludności”', () => {
    expect(effectiveUnit('zgony na 1000 ludności', '-')).toBe('na 1000 ludności');
    expect(effectiveUnit('samochody osobowe na 1000 ludności', 'szt.')).toBe('na 1000 ludności');
    expect(effectiveUnit('przyrost naturalny na 1000 ludności – ogółem', '-')).toBe('na 1000 ludności');
  });
  it('rzeczowa jednostka zostaje', () => {
    expect(effectiveUnit('wydatki na 1000 ludności', 'zł')).toBe('zł');
    expect(effectiveUnit('Ludność ogółem', 'osoba')).toBe('osoba');
  });
});

describe('effectiveUnit – inne mianowniki', () => {
  it('km², urodzenia żywe, wg lokalizacji', () => {
    expect(effectiveUnit('Ludność na 1 km2', '-')).toBe('na 1 km2');
    expect(effectiveUnit('Zgony ogółem na 1000 urodzeń żywych', '-')).toBe('na 1000 urodzeń żywych');
    expect(effectiveUnit('Małżeństwa na 1000 ludności wg lokalizacji', '-')).toBe('na 1000 ludności');
  });
});
