import { describe, expect, it, beforeEach } from 'vitest';
import sampleFixture from '../fixtures/prng/sample.json' with { type: 'json' };
import realUnits from '../../public/data/units.json' with { type: 'json' };
import { buildLocalities } from '../../scripts/geo/localities-parse.mjs';
import { searchLocalities } from '../../src/core/search/localities';
import { loadLocalities, resetLocalitiesCache, LOCALITIES_URL } from '../../src/core/search/load-localities';
import type { Locality } from '../../src/core/search/types';

const parsedLocalities: Locality[] = buildLocalities(sampleFixture.features, realUnits).localities;

describe('Localities Search & Loading (CC5.4a)', () => {
  beforeEach(() => {
    resetLocalitiesCache();
  });

  describe('searchLocalities', () => {
    it('returns Łódź for queries "lodz" and "Łódź"', () => {
      const mockLocalities: Locality[] = [
        {
          id: '1',
          simc: '0983988',
          name: 'Łódź',
          gminaTeryt: '1061011',
          kind: 'miasto',
          lon: 19.45,
          lat: 51.75,
        },
      ];

      const resAscii = searchLocalities('lodz', mockLocalities, realUnits);
      const resUnicode = searchLocalities('Łódź', mockLocalities, realUnits);

      expect(resAscii.length).toBeGreaterThan(0);
      expect(resUnicode.length).toBeGreaterThan(0);

      expect(resAscii[0].name).toBe('Łódź');
      expect(resAscii[0].type).toBe('miasto');
      expect(resAscii[0].gminaName).toBe('Łódź');
      expect(resAscii[0].gminaTeryt).toBe('1061011');

      expect(resUnicode[0].name).toBe('Łódź');
      expect(resUnicode[0].type).toBe('miasto');
      expect(resUnicode[0].gminaName).toBe('Łódź');
    });

    it('ranks exact matches on top before prefix or partial matches', () => {
      const mockLocalities: Locality[] = [
        { id: '1', name: 'Zakopane Podlesie', gminaTeryt: '1217011', kind: 'część wsi', lon: 0, lat: 0 },
        { id: '2', name: 'Zakopane', gminaTeryt: '1217011', kind: 'miasto', lon: 0, lat: 0 },
        { id: '3', name: 'Nowe Zakopane', gminaTeryt: '1217011', kind: 'osada', lon: 0, lat: 0 },
      ];

      const results = searchLocalities('zakopane', mockLocalities, realUnits);
      expect(results.length).toBe(3);
      expect(results[0].name).toBe('Zakopane');
      expect(results[0].type).toBe('miasto');
      expect(results[0].gminaName).toBe('Zakopane');
    });

    it('returns at most 50 results by default', () => {
      const mockLocalities: Locality[] = Array.from({ length: 100 }, (_, i) => ({
        id: String(i + 1),
        name: `Miejscowość Testowa ${i + 1}`,
        gminaTeryt: '1217011',
        kind: 'wieś',
        lon: 0,
        lat: 0,
      }));

      const results = searchLocalities('testowa', mockLocalities, realUnits);
      expect(results.length).toBe(50);
    });

    it('works with sample fixture data and attaches gminaName correctly', () => {
      const results = searchLocalities('zakop', parsedLocalities, realUnits);
      expect(results.length).toBeGreaterThan(0);
      const zakopane = results.find((r) => r.name === 'Zakopane');
      expect(zakopane).toBeDefined();
      expect(zakopane?.gminaName).toBe('Zakopane');
      expect(zakopane?.type).toBe('miasto');
      expect(zakopane?.gminaTeryt).toBe('1217011');
    });
  });

  describe('loadLocalities', () => {
    it('fetches /data/localities.json exactly once on multiple calls', async () => {
      const calls: string[] = [];
      const mockFetch = (async (input: RequestInfo | URL) => {
        calls.push(String(input));
        return new Response(JSON.stringify(parsedLocalities), { status: 200 });
      }) as typeof fetch;

      const [res1, res2] = await Promise.all([
        loadLocalities(mockFetch),
        loadLocalities(mockFetch),
      ]);

      expect(calls).toEqual([LOCALITIES_URL]);
      expect(res1).toEqual(parsedLocalities);
      expect(res2).toEqual(parsedLocalities);
    });

    it('handles 404 response gracefully without throwing error', async () => {
      const mockFetch = (async () => {
        return new Response('Not Found', { status: 404 });
      }) as typeof fetch;

      const localities = await loadLocalities(mockFetch);
      expect(localities).toEqual([]);
    });

    it('handles network error gracefully without throwing error', async () => {
      const mockFetch = (async () => {
        throw new TypeError('Failed to fetch');
      }) as typeof fetch;

      const localities = await loadLocalities(mockFetch);
      expect(localities).toEqual([]);
    });
  });
});
