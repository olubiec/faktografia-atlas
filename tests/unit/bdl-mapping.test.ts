import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { getTerytFromBdlId, normalizeName } from '../../scripts/data/map-units.mjs';

const UNITS_PATH = path.resolve('public/data/units.json');
const FIXTURE_PATH = path.resolve('tests/fixtures/bdl/units-all-levels.json');

type Unit = {
  teryt: string;
  bdlId: string | null;
  name: string;
  level: 'woj' | 'pow' | 'gmi';
  parent: string | null;
  bbox: [number, number, number, number];
  centroid: [number, number];
};

type BdlUnitFixture = {
  id: string;
  name: string;
  level: number;
  kind?: string;
  parentId?: string | null;
};

describe('public/data/units.json - Mapowanie BDL ID ↔ TERYT', () => {
  it('każda z 2875 jednostek ma unikalny 12-cyfrowy bdlId', () => {
    expect(fs.existsSync(UNITS_PATH)).toBe(true);
    const units: Unit[] = JSON.parse(fs.readFileSync(UNITS_PATH, 'utf8'));

    expect(units).toHaveLength(2875);

    const bdlIds = units.map((u) => u.bdlId);
    const nonNullIds = bdlIds.filter((id): id is string => typeof id === 'string');

    expect(nonNullIds).toHaveLength(2875);

    const invalidFormatIds = nonNullIds.filter((id) => !/^\d{12}$/.test(id));
    expect(invalidFormatIds).toEqual([]);

    const uniqueBdlIds = new Set(nonNullIds);
    expect(uniqueBdlIds.size).toBe(2875);
  });

  it('dla województw bdlId[2..3] === teryt', () => {
    const units: Unit[] = JSON.parse(fs.readFileSync(UNITS_PATH, 'utf8'));
    const wojUnits = units.filter((u) => u.level === 'woj');

    expect(wojUnits).toHaveLength(16);

    const mismatches = wojUnits.filter((u) => u.bdlId === null || u.bdlId.slice(2, 4) !== u.teryt);
    expect(mismatches).toEqual([]);
  });

  it('spójność rodzica (gmina i jej powiat mają te same znaki woj i pow)', () => {
    const units: Unit[] = JSON.parse(fs.readFileSync(UNITS_PATH, 'utf8'));
    const unitsByTeryt = new Map(units.map((u) => [u.teryt, u]));

    const powUnits = units.filter((u) => u.level === 'pow');
    const invalidPowParents = powUnits.filter((pow) => {
      const parentWoj = unitsByTeryt.get(pow.parent!);
      if (!parentWoj || !pow.bdlId || !parentWoj.bdlId) return true;
      return pow.bdlId.slice(2, 4) !== parentWoj.bdlId.slice(2, 4);
    });
    expect(invalidPowParents).toEqual([]);

    const gmiUnits = units.filter((u) => u.level === 'gmi');
    const invalidGmiParents = gmiUnits.filter((gmi) => {
      const parentPow = unitsByTeryt.get(gmi.parent!);
      if (!parentPow || !gmi.bdlId || !parentPow.bdlId) return true;
      const wojMatch = gmi.bdlId.slice(2, 4) === parentPow.bdlId.slice(2, 4);
      const powMatch = gmi.bdlId.slice(7, 9) === parentPow.bdlId.slice(7, 9);
      return !wojMatch || !powMatch;
    });
    expect(invalidGmiParents).toEqual([]);
  });

  it('znane pary: Małopolskie, powiat tatrzański, Zakopane', () => {
    const units: Unit[] = JSON.parse(fs.readFileSync(UNITS_PATH, 'utf8'));
    const unitsByTeryt = new Map(units.map((u) => [u.teryt, u]));

    // Województwo małopolskie (12)
    const malopolska = unitsByTeryt.get('12');
    expect(malopolska?.bdlId).toBe('011200000000');

    // Powiat tatrzański (1217)
    const powTatrzanski = unitsByTeryt.get('1217');
    expect(powTatrzanski?.bdlId).not.toBeNull();
    expect(powTatrzanski?.bdlId?.slice(2, 4)).toBe('12');
    expect(powTatrzanski?.bdlId?.slice(7, 9)).toBe('17');

    // Zakopane (1217011)
    const zakopane = unitsByTeryt.get('1217011');
    expect(zakopane?.bdlId).not.toBeNull();
    expect(zakopane?.bdlId?.slice(2, 4)).toBe('12');
    expect(zakopane?.bdlId?.slice(7, 12)).toBe('17011');

    // Odczyt z nagranej odpowiedzi fixture
    expect(fs.existsSync(FIXTURE_PATH)).toBe(true);
    const bdlUnits: BdlUnitFixture[] = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));

    const bdlPow = bdlUnits.find((u) => u.level === 5 && getTerytFromBdlId(u) === '1217');
    const bdlGmi = bdlUnits.find((u) => u.level === 6 && getTerytFromBdlId(u) === '1217011');

    expect(bdlPow?.id).toBeDefined();
    expect(powTatrzanski?.bdlId).toBe(bdlPow?.id);

    expect(bdlGmi?.id).toBeDefined();
    expect(zakopane?.bdlId).toBe(bdlGmi?.id);
  });
});

describe('Funkcja wyliczająca TERYT z BDL ID (tests/fixtures/bdl/units-all-levels.json)', () => {
  it('poprawnie wylicza TERYT oraz pomija typy 4, 5, 8, 9', () => {
    expect(fs.existsSync(FIXTURE_PATH)).toBe(true);
    const bdlUnits: BdlUnitFixture[] = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));

    expect(bdlUnits.length).toBeGreaterThan(0);

    const kind4Units = bdlUnits.filter((u) => (u.kind ?? u.id.slice(11, 12)) === '4');
    const kind5Units = bdlUnits.filter((u) => (u.kind ?? u.id.slice(11, 12)) === '5');
    const kind8or9Units = bdlUnits.filter((u) => ['8', '9'].includes(u.kind ?? u.id.slice(11, 12)));

    expect(kind4Units.length).toBeGreaterThan(0);
    expect(kind5Units.length).toBeGreaterThan(0);

    const unskippedKind4 = kind4Units.filter((u) => getTerytFromBdlId(u) !== null);
    const unskippedKind5 = kind5Units.filter((u) => getTerytFromBdlId(u) !== null);
    const unskippedKind8or9 = kind8or9Units.filter((u) => getTerytFromBdlId(u) !== null);

    expect(unskippedKind4).toEqual([]);
    expect(unskippedKind5).toEqual([]);
    expect(unskippedKind8or9).toEqual([]);

    const validMappedTeryts = bdlUnits
      .map((u) => ({ unit: u, teryt: getTerytFromBdlId(u) }))
      .filter((item): item is { unit: BdlUnitFixture; teryt: string } => item.teryt !== null);

    expect(validMappedTeryts.length).toBeGreaterThanOrEqual(2875);

    const invalidLengths = validMappedTeryts.filter(({ unit, teryt }) => {
      if (unit.level === 2) return teryt.length !== 2;
      if (unit.level === 5) return teryt.length !== 4;
      if (unit.level === 6) return teryt.length !== 7;
      return true;
    });

    expect(invalidLengths).toEqual([]);
  });

  it('normalizacja nazw poprawnie usuwa przedrostki i Nawiasy', () => {
    expect(normalizeName('MAŁOPOLSKIE')).toBe('małopolskie');
    expect(normalizeName('Powiat bocheński')).toBe('bocheński');
    expect(normalizeName('powiat m.st. Warszawa')).toBe('warszawa');
    expect(normalizeName('m. Koszalin')).toBe('koszalin');
    expect(normalizeName('gmina Dobra (Szczecińska)')).toBe('dobra');
  });
});
