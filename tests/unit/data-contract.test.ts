import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Indicator } from '../../src/core/profile/profile';
import type { Unit } from '../../src/core/units/types';
import { checkValuesFile } from '../../scripts/data/contract.mjs';

const rootDir = process.cwd();
const indicatorsPath = path.join(rootDir, 'config/indicators.json');
const unitsPath = path.join(rootDir, 'public/data/units.json');

const indicators: Indicator[] = JSON.parse(fs.readFileSync(indicatorsPath, 'utf8'));
const units: Unit[] = JSON.parse(fs.readFileSync(unitsPath, 'utf8'));

describe('Weryfikacja kontraktu plików wartości public/data/values/*.json', () => {
  it('każdy wskaźnik z indicators.json posiada prawidłowy plik danych w public/data/values/', () => {
    for (const indicator of indicators) {
      const filePath = path.join(rootDir, `public/data/values/${indicator.id}.json`);
      expect(fs.existsSync(filePath), `Plik ${filePath} nie istnieje!`).toBe(true);

      const fileContent = fs.readFileSync(filePath, 'utf8');
      const json = JSON.parse(fileContent);

      const errors = checkValuesFile(json, indicator, units);
      expect(errors, `Błędy w pliku ${indicator.id}.json: ${errors.join('; ')}`).toEqual([]);
    }
  });
});

describe('checkValuesFile — testy jednostkowe na danych syntetycznych z błędami', () => {
  const dummyIndicator: Indicator = {
    id: 'test-ind',
    bdlVarId: 100,
    name: 'Testowy wskaźnik',
    unit: 'osoba',
    description: 'Wskaźnik testowy',
    group: 'Test',
    higherIsBetter: true,
    minLevel: 'gmi',
  };

  const dummyUnits: Unit[] = [
    {
      teryt: '0201011',
      bdlId: '100',
      name: 'Gmina 1',
      level: 'gmi',
      parent: '0201',
      bbox: [0, 0, 1, 1],
      centroid: [0.5, 0.5],
    },
    {
      teryt: '0201022',
      bdlId: '101',
      name: 'Gmina 2',
      level: 'gmi',
      parent: '0201',
      bbox: [0, 0, 1, 1],
      centroid: [0.5, 0.5],
    },
  ];

  const validJson = {
    indicatorId: 'test-ind',
    years: [2020, 2021, 2022],
    values: {
      '0201011': [10, 20, 30],
      '0201022': [15, 25, 35],
    },
    fetchedAt: '2025-01-01T00:00:00.000Z',
  };

  it('zwraca brak błędów dla poprawnych danych syntetycznych', () => {
    const errors = checkValuesFile(validJson, dummyIndicator, dummyUnits);
    expect(errors).toEqual([]);
  });

  it('wykrywa niezgodność indicatorId z pliku i konfiguracji', () => {
    const invalidJson = { ...validJson, indicatorId: 'wrong-id' };
    const errors = checkValuesFile(invalidJson, dummyIndicator, dummyUnits);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes('indicatorId'))).toBe(true);
  });

  it('wykrywa lata (years), które nie są rosnące lub zawierają powtórzenia', () => {
    const jsonUnsorted = { ...validJson, years: [2021, 2020, 2022] };
    const jsonDuplicate = { ...validJson, years: [2020, 2020, 2022] };

    expect(checkValuesFile(jsonUnsorted, dummyIndicator, dummyUnits).length).toBeGreaterThan(0);
    expect(checkValuesFile(jsonDuplicate, dummyIndicator, dummyUnits).length).toBeGreaterThan(0);
  });

  it('wykrywa różnicę w długości tablicy wartości względem years.length', () => {
    const invalidJson = {
      ...validJson,
      values: {
        ...validJson.values,
        '0201011': [10, 20], // 2 elementy zamiast 3
      },
    };
    const errors = checkValuesFile(invalidJson, dummyIndicator, dummyUnits);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes('0201011'))).toBe(true);
  });

  it('wykrywa nieprawidłowy typ wartości w tablicy (inny niż liczba lub null)', () => {
    const invalidJson = {
      ...validJson,
      values: {
        ...validJson.values,
        '0201011': [10, 'string-val' as unknown as number, 30],
      },
    };
    const errors = checkValuesFile(invalidJson, dummyIndicator, dummyUnits);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('wykrywa TERYT w values, który nie występuje w units.json', () => {
    const invalidJson = {
      ...validJson,
      values: {
        ...validJson.values,
        '9999999': [10, 20, 30],
      },
    };
    const errors = checkValuesFile(invalidJson, dummyIndicator, dummyUnits);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes('9999999'))).toBe(true);
  });

  it('wykrywa pokrycie w ostatnim roku poniżej 95% dla jednostek z minLevel', () => {
    // 2 jednostki minLevel, obie bez wartości w ostatnim roku (null)
    const invalidJson = {
      ...validJson,
      values: {
        '0201011': [10, 20, null],
        '0201022': [15, 25, null],
      },
    };
    const errors = checkValuesFile(invalidJson, dummyIndicator, dummyUnits);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes(dummyIndicator.id) && e.includes('braków'))).toBe(true);
  });

  it('wykrywa ujemne wartości dla wskaźnika, który nie może być ujemny', () => {
    const invalidJson = {
      ...validJson,
      values: {
        ...validJson.values,
        '0201011': [10, -5, 30],
      },
    };
    const errors = checkValuesFile(invalidJson, dummyIndicator, dummyUnits);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('zezwala na ujemne wartości dla natural-increase i migration-balance', () => {
    const naturalIncreaseIndicator: Indicator = {
      ...dummyIndicator,
      id: 'natural-increase',
    };

    const migrationBalanceIndicator: Indicator = {
      ...dummyIndicator,
      id: 'migration-balance',
    };

    const jsonWithNegatives = {
      ...validJson,
      indicatorId: 'natural-increase',
      values: {
        ...validJson.values,
        '0201011': [10, -5, 30],
      },
    };

    expect(checkValuesFile(jsonWithNegatives, naturalIncreaseIndicator, dummyUnits)).toEqual([]);

    const jsonMigration = {
      ...jsonWithNegatives,
      indicatorId: 'migration-balance',
    };
    expect(checkValuesFile(jsonMigration, migrationBalanceIndicator, dummyUnits)).toEqual([]);
  });
});
