import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { normalize } from '../../src/core/search/normalize';
import { buildSearchIndex, search } from '../../src/core/search';
import type { Unit } from '../../src/core/units/types';
import type { Locality } from '../../src/core/search/types';

const unitsPath = path.resolve(__dirname, '../../public/data/units.json');
const realUnits: Unit[] = JSON.parse(fs.readFileSync(unitsPath, 'utf-8'));

describe('Search Module', () => {
  describe('normalize', () => {
    it('converts to lowercase and removes Polish diacritics', () => {
      expect(normalize('Łódź')).toBe('lodz');
      expect(normalize('ĄĆĘŁŃÓŚŹŻąćęłńóśźż')).toBe('acelnoszzacelnoszz');
    });

    it('converts hyphens and multiple spaces into a single space', () => {
      expect(normalize('Kędzierzyn-Koźle')).toBe('kedzierzyn kozle');
      expect(normalize('  Nowy   -   Targ  ')).toBe('nowy targ');
    });

    it('handles empty or blank string inputs', () => {
      expect(normalize('')).toBe('');
      expect(normalize('   ')).toBe('');
    });
  });

  describe('buildSearchIndex & search with real units', () => {
    it('handles query "lodz" - first two results are gmina Łódź and powiat Łódź', () => {
      const index = buildSearchIndex(realUnits);
      const results = search(index, 'lodz');

      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results[0].teryt).toBe('1061011');
      expect(results[0].name).toBe('Łódź');
      expect(results[0].kind).toBe('unit');
      expect(results[0].label).toBe('gmina miejska');
      expect(results[0].context).toBe('powiat Łódź, łódzkie');

      expect(results[1].teryt).toBe('1061');
      expect(results[1].name).toBe('powiat Łódź');
      expect(results[1].kind).toBe('unit');
      expect(results[1].label).toBe('miasto na prawach powiatu');
      expect(results[1].context).toBe('łódzkie');
    });

    it('handles query "zakop" - Zakopane is first', () => {
      const index = buildSearchIndex(realUnits);
      const results = search(index, 'zakop');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].teryt).toBe('1217011');
      expect(results[0].name).toBe('Zakopane');
      expect(results[0].label).toBe('gmina miejska');
      expect(results[0].context).toBe('powiat tatrzański, małopolskie');
    });

    it('handles query "zakopne" (typo) - Zakopane is in results', () => {
      const index = buildSearchIndex(realUnits);
      const results = search(index, 'zakopne');

      const found = results.find((r) => r.teryt === '1217011');
      expect(found).toBeDefined();
      expect(found?.name).toBe('Zakopane');
    });

    it('handles query "nowy targ" - both Nowy Targ gminas with distinct labels', () => {
      const index = buildSearchIndex(realUnits);
      const results = search(index, 'nowy targ');

      const miejska = results.find((r) => r.teryt === '1211011');
      const wiejska = results.find((r) => r.teryt === '1211092');

      expect(miejska).toBeDefined();
      expect(miejska?.label).toBe('gmina miejska');
      expect(miejska?.context).toBe('powiat nowotarski, małopolskie');

      expect(wiejska).toBeDefined();
      expect(wiejska?.label).toBe('gmina wiejska');
      expect(wiejska?.context).toBe('powiat nowotarski, małopolskie');
    });

    it('handles query "krakow" - gmina Kraków before powiat krakowski', () => {
      const index = buildSearchIndex(realUnits);
      const results = search(index, 'krakow');

      const gminaIndex = results.findIndex((r) => r.teryt === '1261011');
      const powiatKrakowskiIndex = results.findIndex((r) => r.teryt === '1206');

      expect(gminaIndex).toBeGreaterThan(-1);
      expect(powiatKrakowskiIndex).toBeGreaterThan(-1);
      expect(gminaIndex).toBeLessThan(powiatKrakowskiIndex);
    });

    it('handles query "malopolskie" - województwo 12 is first', () => {
      const index = buildSearchIndex(realUnits);
      const results = search(index, 'malopolskie');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].teryt).toBe('12');
      expect(results[0].name).toBe('małopolskie');
      expect(results[0].label).toBe('województwo');
    });

    it('returns empty array for empty query, whitespace, or query shorter than 2 chars', () => {
      const index = buildSearchIndex(realUnits);

      expect(search(index, '')).toEqual([]);
      expect(search(index, '   ')).toEqual([]);
      expect(search(index, 'a')).toEqual([]);
    });

    it('supports optional localities parameter without altering unit results', () => {
      const emptyLocalities: Locality[] = [];
      const indexWithLocs = buildSearchIndex(realUnits, emptyLocalities);
      const indexWithoutLocs = buildSearchIndex(realUnits);

      const resWith = search(indexWithLocs, 'lodz');
      const resWithout = search(indexWithoutLocs, 'lodz');

      expect(resWith).toEqual(resWithout);
    });
  });

  describe('Performance benchmarks', () => {
    it('builds search index for 2875 units in less than 150 ms', () => {
      const start = performance.now();
      buildSearchIndex(realUnits);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(150);
    });

    it('executes search queries in less than 5 ms on average (100 queries)', () => {
      const index = buildSearchIndex(realUnits);
      const queries = ['lodz', 'zakop', 'zakopne', 'nowy targ', 'krakow', 'malopolskie', 'gdansk', 'poznan', 'wroclaw', 'szczecin'];

      const start = performance.now();
      const iterations = 10;
      for (let i = 0; i < iterations; i++) {
        for (const q of queries) {
          search(index, q, { limit: 8 });
        }
      }
      const duration = performance.now() - start;
      const avgTime = duration / (iterations * queries.length);

      expect(avgTime).toBeLessThan(5);
    });
  });
});
