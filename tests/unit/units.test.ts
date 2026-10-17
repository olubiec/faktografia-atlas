import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import type { Unit } from '../../src/core/units/types';
import {
  buildIndex,
  getAncestors,
  getChildren,
  getUnit,
  levelOf
} from '../../src/core/units/units';

const UNITS_PATH = path.resolve('public/data/units.json');

const expectedTerytLenMap: Record<string, number> = {
  woj: 2,
  pow: 4,
  gmi: 7
};

describe('public/data/units.json - data integrity', () => {
  it('exists and is below size limit (<= 600 KB)', () => {
    expect(fs.existsSync(UNITS_PATH)).toBe(true);
    const stats = fs.statSync(UNITS_PATH);
    const sizeKB = stats.size / 1024;
    expect(sizeKB).toBeLessThanOrEqual(600);
  });

  it('contains exactly 16 woj, 380 pow, 2479 gmi', () => {
    const rawData = fs.readFileSync(UNITS_PATH, 'utf8');
    const units: Unit[] = JSON.parse(rawData);

    expect(units).toHaveLength(2875);

    const woj = units.filter((u) => u.level === 'woj');
    const pow = units.filter((u) => u.level === 'pow');
    const gmi = units.filter((u) => u.level === 'gmi');

    expect(woj).toHaveLength(16);
    expect(pow).toHaveLength(380);
    expect(gmi).toHaveLength(2479);
  });

  it('has unique TERYT codes of lengths 2, 4, 7', () => {
    const rawData = fs.readFileSync(UNITS_PATH, 'utf8');
    const units: Unit[] = JSON.parse(rawData);
    const terytSet = new Set(units.map((u) => u.teryt));

    expect(terytSet.size).toBe(units.length);

    const invalidTerytLengths = units.filter(
      (u) => u.teryt.length !== expectedTerytLenMap[u.level]
    );
    expect(invalidTerytLengths).toEqual([]);
  });

  it('has valid parents and levels', () => {
    const rawData = fs.readFileSync(UNITS_PATH, 'utf8');
    const units: Unit[] = JSON.parse(rawData);
    const unitsByTeryt = new Map(units.map((u) => [u.teryt, u]));

    const invalidWojParents = units.filter((u) => u.level === 'woj' && u.parent !== null);
    expect(invalidWojParents).toEqual([]);

    const nonWojUnits = units.filter((u) => u.level !== 'woj');
    const invalidNonWojParents = nonWojUnits.filter((u) => {
      if (u.parent === null) return true;
      const parent = unitsByTeryt.get(u.parent);
      if (!parent) return true;
      if (u.level === 'pow') return parent.level !== 'woj';
      if (u.level === 'gmi') return parent.level !== 'pow';
      return true;
    });

    expect(invalidNonWojParents).toEqual([]);
  });

  it('has centroid inside bbox and within Poland bounding rectangle', () => {
    const rawData = fs.readFileSync(UNITS_PATH, 'utf8');
    const units: Unit[] = JSON.parse(rawData);

    const invalidCentroids = units.filter((u) => {
      const [minLon, minLat, maxLon, maxLat] = u.bbox;
      const [cLon, cLat] = u.centroid;

      const insideBbox =
        cLon >= minLon && cLon <= maxLon && cLat >= minLat && cLat <= maxLat;
      const insidePoland =
        minLon >= 14.0 && maxLon <= 24.2 && minLat >= 49.0 && maxLat <= 55.0;

      return !insideBbox || !insidePoland;
    });

    expect(invalidCentroids).toEqual([]);
  });
});

describe('src/core/units/units.ts logic', () => {
  const rawData = fs.readFileSync(UNITS_PATH, 'utf8');
  const units: Unit[] = JSON.parse(rawData);
  const index = buildIndex(units);

  it('levelOf returns correct level by TERYT length', () => {
    expect(levelOf('12')).toBe('woj');
    expect(levelOf('1217')).toBe('pow');
    expect(levelOf('1217011')).toBe('gmi');
    expect(levelOf('1')).toBeUndefined();
    expect(levelOf('12345')).toBeUndefined();
  });

  it('Małopolska (12) -> 22 powiaty', () => {
    const children = getChildren(index, '12');
    expect(children).toHaveLength(22);
    const nonPowChildren = children.filter((u) => u.level !== 'pow');
    expect(nonPowChildren).toEqual([]);
  });

  it('powiat tatrzański (1217) -> 5 gmin', () => {
    const children = getChildren(index, '1217');
    expect(children).toHaveLength(5);
    const nonGmiChildren = children.filter((u) => u.level !== 'gmi');
    expect(nonGmiChildren).toEqual([]);
    expect(children.map((u) => u.name)).toEqual([
      'Biały Dunajec',
      'Bukowina Tatrzańska',
      'Kościelisko',
      'Poronin',
      'Zakopane'
    ]);
  });

  it('Zakopane (1217011) -> ancestors [województwo, powiat]', () => {
    const ancestors = getAncestors(index, '1217011');
    expect(ancestors).toHaveLength(2);
    expect(ancestors[0].teryt).toBe('12');
    expect(ancestors[0].name).toBe('małopolskie');
    expect(ancestors[1].teryt).toBe('1217');
    expect(ancestors[1].name).toBe('powiat tatrzański');
  });

  it('unknown TERYT -> undefined / empty array, no exception', () => {
    expect(getUnit(index, '9999999')).toBeUndefined();
    expect(getChildren(index, '9999999')).toEqual([]);
    expect(getAncestors(index, '9999999')).toEqual([]);
  });
});
