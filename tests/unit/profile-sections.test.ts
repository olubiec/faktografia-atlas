import { describe, expect, it } from 'vitest';
import unitsData from '../../public/data/units.json';
import type { Indicator, ProfileIndicatorItem, UnitProfile } from '../../src/core/profile/profile';
import { childUnits, currentIndicatorItem, rankingScope } from '../../src/core/profile/sections';
import type { Unit } from '../../src/core/units/types';

const units = unitsData as Unit[];

describe('profile sections logic (S14.1)', () => {
  describe('rankingScope', () => {
    it('dla województwa (małopolskie) zwraca zakres 16 województw i opis "w Polsce"', () => {
      const malopolskie = units.find((u) => u.name === 'małopolskie' && u.level === 'woj')!;
      expect(malopolskie).toBeDefined();

      const scope = rankingScope(malopolskie, units);
      expect(scope.teryts).toHaveLength(16);
      expect(scope.description).toBe('w Polsce');

      // Wpisane TERYT powinny być tylko dla województw
      const wojTeryts = units.filter((u) => u.level === 'woj').map((u) => u.teryt);
      expect(scope.teryts.sort()).toEqual(wojTeryts.sort());
    });

    it('dla dowolnego powiatu małopolskiego zwraca wszystkie powiaty małopolskie i opis "w województwie małopolskim"', () => {
      const powMalopolski = units.find(
        (u) => u.level === 'pow' && u.parent === '12'
      )!;
      expect(powMalopolski).toBeDefined();

      const scope = rankingScope(powMalopolski, units);
      const expectedPowiaty = units.filter((u) => u.level === 'pow' && u.parent === '12');

      expect(scope.teryts).toHaveLength(22);
      expect(scope.teryts).toHaveLength(expectedPowiaty.length);
      expect(scope.description).toBe('w województwie małopolskim');
      expect(scope.teryts.sort()).toEqual(expectedPowiaty.map((u) => u.teryt).sort());
    });

    it('dla gminy zwraca gminy jej województwa i wynik nie zawiera powiatów ani województw', () => {
      const gmina = units.find((u) => u.level === 'gmi' && u.teryt.startsWith('12'))!;
      expect(gmina).toBeDefined();

      const scope = rankingScope(gmina, units);
      const expectedGminy = units.filter((u) => u.level === 'gmi' && u.teryt.startsWith('12'));

      expect(scope.description).toBe('w województwie małopolskim');
      expect(scope.teryts).toHaveLength(expectedGminy.length);
      expect(scope.teryts.sort()).toEqual(expectedGminy.map((u) => u.teryt).sort());

      // Sprawdzenie, że żaden teryt w scope.teryts nie należy do powiatu ani województwa
      const unitsByTeryt = new Map(units.map((u) => [u.teryt, u]));
      for (const teryt of scope.teryts) {
        const u = unitsByTeryt.get(teryt);
        expect(u?.level).toBe('gmi');
      }
    });
  });

  describe('childUnits', () => {
    it('dla małopolskiego zwraca same powiaty z rodzicem 12, etykietę "Powiaty (22)"', () => {
      const malopolskie = units.find((u) => u.name === 'małopolskie' && u.level === 'woj')!;
      const result = childUnits(malopolskie, units);

      expect(result.label).toBe('Powiaty (22)');
      expect(result.units).toHaveLength(22);
      for (const child of result.units) {
        expect(child.level).toBe('pow');
        expect(child.parent).toBe('12');
      }
    });

    it('dla gminy zwraca pustą listę i null', () => {
      const gmina = units.find((u) => u.level === 'gmi')!;
      const result = childUnits(gmina, units);

      expect(result.units).toEqual([]);
      expect(result.label).toBeNull();
    });

    it('suma childUnits po wszystkich 16 województwach jest równa liczbie powiatów w units.json (380)', () => {
      const voivodeships = units.filter((u) => u.level === 'woj');
      expect(voivodeships).toHaveLength(16);

      let totalPowiatyFromChildren = 0;
      for (const woj of voivodeships) {
        const result = childUnits(woj, units);
        totalPowiatyFromChildren += result.units.length;
      }

      const totalPowiatyInUnits = units.filter((u) => u.level === 'pow').length;
      expect(totalPowiatyInUnits).toBe(380);
      expect(totalPowiatyFromChildren).toBe(380);
    });
  });

  describe('currentIndicatorItem', () => {
    const sampleIndicator1: Indicator = {
      id: 'ind-1',
      bdlVarId: 101,
      name: 'Wskaźnik 1',
      unit: 'osoby',
      description: 'Opis 1',
      group: 'Grupa 1',
      higherIsBetter: true,
      minLevel: 'woj',
    };

    const sampleIndicator2: Indicator = {
      id: 'ind-2',
      bdlVarId: 102,
      name: 'Wskaźnik 2',
      unit: '%',
      description: 'Opis 2',
      group: 'Grupa 1',
      higherIsBetter: null,
      minLevel: 'pow',
    };

    const profileItem1: ProfileIndicatorItem = {
      indicatorId: 'ind-1',
      indicator: sampleIndicator1,
      year: 2023,
      value: 100,
      rankNational: 1,
      rankVoivodeship: 1,
      totalNational: 16,
      totalVoivodeship: 16,
      neutral: false,
      series: [],
    };

    const profileItem2: ProfileIndicatorItem = {
      indicatorId: 'ind-2',
      indicator: sampleIndicator2,
      year: 2023,
      value: 50,
      rankNational: 5,
      rankVoivodeship: 2,
      totalNational: 380,
      totalVoivodeship: 22,
      neutral: true,
      series: [],
    };

    const mockProfile: UnitProfile = {
      teryt: '12',
      unit: units.find((u) => u.teryt === '12') ?? null,
      indicators: [profileItem1, profileItem2],
    };

    it('znany id -> ta pozycja', () => {
      const item = currentIndicatorItem(mockProfile, 'ind-2', 'ind-1');
      expect(item).toEqual(profileItem2);
    });

    it('nieznany id -> pozycja domyślna', () => {
      const item = currentIndicatorItem(mockProfile, 'unknown-id', 'ind-1');
      expect(item).toEqual(profileItem1);
    });

    it('brak obu -> null', () => {
      const item = currentIndicatorItem(mockProfile, 'unknown-id', 'missing-default');
      expect(item).toBeNull();

      const itemNoId = currentIndicatorItem(mockProfile, undefined, 'missing-default');
      expect(itemNoId).toBeNull();
    });

    it('dla null/undefined profilu -> null', () => {
      expect(currentIndicatorItem(null, 'ind-1', 'ind-1')).toBeNull();
      expect(currentIndicatorItem(undefined, 'ind-1', 'ind-1')).toBeNull();
    });
  });
});
