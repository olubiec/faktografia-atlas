import { describe, it, expect } from 'vitest';
import { compare } from '../../src/core/compare/compare';
import type { UnitProfile } from '../../src/core/profile/profile';
import type { Unit } from '../../src/core/units/types';

describe('compare', () => {
  const createMockProfile = (level: 'woj' | 'pow' | 'gmi', teryt: string, indicators: any[]): UnitProfile => {
    return {
      teryt,
      unit: { level, teryt, bdlId: null, name: 'Test', parent: null, bbox: [0, 0, 0, 0], centroid: [0, 0] } as Unit,
      indicators,
    };
  };

  it('powinien poprawnie wyliczać punkty procentowe (p.p.) dla wskaźników wyrażonych w %', () => {
    const pA = createMockProfile('gmi', '01', [
      { indicatorId: 'share-65plus', indicator: { unit: '%' }, value: 22.4, year: 2020 },
    ]);
    const pB = createMockProfile('gmi', '02', [
      { indicatorId: 'share-65plus', indicator: { unit: '%' }, value: 20.0, year: 2020 },
    ]);

    const result = compare(pA, pB);
    expect(result.rows[0].diffText).toBe('wyżej o 2,4 p.p.');
    expect(result.differentLevels).toBe(false);
  });

  it('powinien poprawnie wyliczać spadek w punktach procentowych (p.p.)', () => {
    const pA = createMockProfile('gmi', '01', [
      { indicatorId: 'share-65plus', indicator: { unit: '%' }, value: 18.0, year: 2020 },
    ]);
    const pB = createMockProfile('gmi', '02', [
      { indicatorId: 'share-65plus', indicator: { unit: '%' }, value: 20.0, year: 2020 },
    ]);

    const result = compare(pA, pB);
    expect(result.rows[0].diffText).toBe('niżej o 2,0 p.p.');
  });

  it('powinien poprawnie wyliczać różnice względne (%) dla wartości absolutnych', () => {
    const pA = createMockProfile('gmi', '01', [
      { indicatorId: 'population', indicator: { unit: 'osoba' }, value: 110, year: 2020 },
    ]);
    const pB = createMockProfile('gmi', '02', [
      { indicatorId: 'population', indicator: { unit: 'osoba' }, value: 100, year: 2020 },
    ]);

    const result = compare(pA, pB);
    expect(result.rows[0].diffText).toBe('wyżej o 10,0%');
  });

  it('powinien poprawnie wyliczać spadek względny (%) dla wartości absolutnych', () => {
    const pA = createMockProfile('gmi', '01', [
      { indicatorId: 'population', indicator: { unit: 'osoba' }, value: 90, year: 2020 },
    ]);
    const pB = createMockProfile('gmi', '02', [
      { indicatorId: 'population', indicator: { unit: 'osoba' }, value: 100, year: 2020 },
    ]);

    const result = compare(pA, pB);
    expect(result.rows[0].diffText).toBe('niżej o 10,0%');
  });

  it('powinien wyłapywać brakujące dane, gdy A=null', () => {
    const pA = createMockProfile('gmi', '01', [
      { indicatorId: 'population', indicator: { unit: 'osoba' }, value: null, year: null },
    ]);
    const pB = createMockProfile('gmi', '02', [
      { indicatorId: 'population', indicator: { unit: 'osoba' }, value: 100, year: 2020 },
    ]);

    const result = compare(pA, pB);
    expect(result.rows[0].diffText).toBe('brak danych');
  });

  it('powinien wyłapywać brakujące dane, gdy B=undefined', () => {
    const pA = createMockProfile('gmi', '01', [
      { indicatorId: 'population', indicator: { unit: 'osoba' }, value: 100, year: 2020 },
    ]);
    const pB = createMockProfile('gmi', '02', []); // Pusty profil B dla tego id

    const result = compare(pA, pB);
    expect(result.rows[0].diffText).toBe('brak danych');
  });

  it('powinien poprawnie obsługiwać dzielenie przez 0 w bValue', () => {
    const pA = createMockProfile('gmi', '01', [
      { indicatorId: 'population', indicator: { unit: 'osoba' }, value: 10, year: 2020 },
      { indicatorId: 'population-down', indicator: { unit: 'osoba' }, value: -10, year: 2020 },
    ]);
    const pB = createMockProfile('gmi', '02', [
      { indicatorId: 'population', indicator: { unit: 'osoba' }, value: 0, year: 2020 },
      { indicatorId: 'population-down', indicator: { unit: 'osoba' }, value: 0, year: 2020 },
    ]);

    const result = compare(pA, pB);
    expect(result.rows[0].diffText).toBe('wyżej');
    expect(result.rows[1].diffText).toBe('niżej');
  });

  it('powinien wypisać bez zmian, jeżeli równe', () => {
    const pA = createMockProfile('gmi', '01', [
      { indicatorId: 'population', indicator: { unit: 'osoba' }, value: 10, year: 2020 },
    ]);
    const pB = createMockProfile('gmi', '02', [
      { indicatorId: 'population', indicator: { unit: 'osoba' }, value: 10, year: 2020 },
    ]);

    const result = compare(pA, pB);
    expect(result.rows[0].diffText).toBe('bez zmian');
  });

  it('powinien poprawnie ustawić flagę differentLevels', () => {
    const pA = createMockProfile('woj', '02', []);
    const pB = createMockProfile('pow', '0201', []);
    const pC = createMockProfile('pow', '0202', []);

    expect(compare(pA, pB).differentLevels).toBe(true);
    expect(compare(pB, pC).differentLevels).toBe(false);
  });

  it('powinien zachowywać kolejność z profilu A', () => {
    const pA = createMockProfile('gmi', '01', [
      { indicatorId: 'one', indicator: { unit: 'osoba' }, value: 1, year: 2020 },
      { indicatorId: 'two', indicator: { unit: 'osoba' }, value: 2, year: 2020 },
    ]);
    const pB = createMockProfile('gmi', '02', [
      { indicatorId: 'two', indicator: { unit: 'osoba' }, value: 2, year: 2020 },
      { indicatorId: 'one', indicator: { unit: 'osoba' }, value: 1, year: 2020 },
    ]);

    const result = compare(pA, pB);
    expect(result.rows[0].indicatorId).toBe('one');
    expect(result.rows[1].indicatorId).toBe('two');
  });
});
