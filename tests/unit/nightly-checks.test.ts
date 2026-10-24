import { describe, expect, it } from 'vitest';
import { checkControlNumbers, findMissingExplanations, substantiveChange } from '../../scripts/data/nightly-checks.mjs';

const wojUnits = Array.from({ length: 16 }, (_, i) => ({ teryt: String(i * 2 + 2).padStart(2, '0'), level: 'woj' }));
const gmiUnits = Array.from({ length: 2479 }, (_, i) => ({ teryt: `g${i}`, level: 'gmi' }));
const units = [...wojUnits, ...gmiUnits];

function population(wojValue: number, gmiCount = 2479) {
  const values: Record<string, number[]> = {};
  for (const u of wojUnits) values[u.teryt] = [1, wojValue];
  gmiUnits.slice(0, gmiCount).forEach((u) => (values[u.teryt] = [1, 1000]));
  return { years: [2024, 2025], values };
}

describe('substantiveChange', () => {
  it('ignoruje fetchedAt i report', () => {
    const a = { indicatorId: 'x', years: [1], values: { a: [1] }, fetchedAt: '1', report: { skipped: 1 } };
    const b = { ...a, fetchedAt: '2', report: { skipped: 5 } };
    expect(substantiveChange(a, b)).toBe(false);
  });
  it('wykrywa zmianę wartości, lat i nowych jednostek', () => {
    const a = { years: [1], values: { a: [1] } };
    expect(substantiveChange(a, { years: [1], values: { a: [2] } })).toBe(true);
    expect(substantiveChange(a, { years: [1, 2], values: { a: [1, 1] } })).toBe(true);
    expect(substantiveChange(a, { years: [1], values: { a: [1], b: [3] } })).toBe(true);
  });
});

describe('findMissingExplanations', () => {
  const indicators = [{ id: 'population' }, { id: 'density' }, { id: 'avg-wage' }];

  it('zwraca wszystkie ID, gdy plik objaśnień nie istnieje (null / undefined)', () => {
    expect(findMissingExplanations(indicators, null)).toEqual(['population', 'density', 'avg-wage']);
    expect(findMissingExplanations(indicators, undefined)).toEqual(['population', 'density', 'avg-wage']);
  });

  it('zwraca pustą tablicę, gdy wszystkie wskaźniki mają objaśnienia', () => {
    const explanations = {
      population: { short: 'Opis ludności' },
      density: { short: 'Opis gęstości' },
      'avg-wage': { short: 'Opis płacy' },
    };
    expect(findMissingExplanations(indicators, explanations)).toEqual([]);
  });

  it('zwraca listę brakujących wskaźników, gdy plik objaśnień jest częściowy', () => {
    const explanations = {
      population: { short: 'Opis ludności' },
    };
    expect(findMissingExplanations(indicators, explanations)).toEqual(['density', 'avg-wage']);
  });
});

describe('checkControlNumbers', () => {
  it('przepuszcza poprawne dane (16 woj., 2479 gmin, ~37,5 mln)', () => {
    expect(checkControlNumbers(population(2_340_000), units)).toEqual([]);
  });
  it('zgłasza sumę ludności poza zakresem 36–39 mln', () => {
    expect(checkControlNumbers(population(1_000_000), units).join(' ')).toMatch(/poza zakresem 36–39 mln/);
    expect(checkControlNumbers(population(3_000_000), units).join(' ')).toMatch(/poza zakresem 36–39 mln/);
  });
  it('zgłasza za mało gmin z wartością', () => {
    expect(checkControlNumbers(population(2_340_000, 2000), units).join(' ')).toMatch(/2000 gmin/);
  });
  it('zgłasza brak pliku ludności i złą liczbę województw', () => {
    expect(checkControlNumbers(null, units).join(' ')).toMatch(/Brak pliku ludności/);
    expect(checkControlNumbers(population(2_340_000), units.slice(1)).join(' ')).toMatch(/16 województw/);
  });
  it('zgłasza brakującą wartość województwa', () => {
    const p = population(2_340_000);
    delete (p.values as Record<string, number[]>)[wojUnits[0].teryt];
    expect(checkControlNumbers(p, units).join(' ')).toMatch(/15 z 16/);
  });
});
