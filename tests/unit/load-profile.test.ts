import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadProfileShard, profileFromShard, resetProfileCache } from '../../src/core/data/load-profile';
import { buildProfile } from '../../src/core/profile/profile';

describe('loadProfileShard & profileFromShard (CC13.1)', () => {
  beforeEach(() => {
    resetProfileCache();
  });

  describe('loadProfileShard', () => {
    it('fetches shard once and deduplicates concurrent calls', async () => {
      const mockShard = { woj: '02', generatedAt: '2025-01-01', units: {} };
      const mockFetch = vi.fn<typeof fetch>().mockResolvedValue({
        ok: true,
        json: async () => mockShard,
      } as Response);

      const p1 = loadProfileShard('02', mockFetch);
      const p2 = loadProfileShard('02', mockFetch);

      const [res1, res2] = await Promise.all([p1, p2]);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('/data/profiles/02.json');
      expect(res1).toBe(mockShard);
      expect(res2).toBe(mockShard);

      // Subsequent call should use cache
      const res3 = await loadProfileShard('02', mockFetch);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(res3).toBe(mockShard);
    });

    it('returns null on 404 status without throwing exception', async () => {
      const mockFetch = vi.fn<typeof fetch>().mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const res = await loadProfileShard('99', mockFetch);
      expect(res).toBeNull();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Caches null
      const res2 = await loadProfileShard('99', mockFetch);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(res2).toBeNull();
    });

    it('returns null on network failure without throwing exception', async () => {
      const mockFetch = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));

      const res = await loadProfileShard('02', mockFetch);
      expect(res).toBeNull();

      // Caches null
      const res2 = await loadProfileShard('02', mockFetch);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(res2).toBeNull();
    });
  });

  describe('profileFromShard', () => {
    it('returns empty profile for unknown unit teryt', () => {
      const shard = { woj: '02', generatedAt: '2025-01-01', units: {} };
      const res = profileFromShard('9999999', shard as any, [], []);
      expect(res).toEqual({
        teryt: '9999999',
        unit: null,
        indicators: [],
      });
    });

    it('reconstructs profile matching buildProfile output for >= 30 sample units', async () => {
      const root = path.resolve(__dirname, '../..');
      const units = JSON.parse(await readFile(path.join(root, 'public/data/units.json'), 'utf8'));
      const indicators = JSON.parse(await readFile(path.join(root, 'config/indicators.json'), 'utf8'));

      const valuesById: Record<string, any> = {};
      for (const ind of indicators) {
        const valPath = path.join(root, `public/data/values/${ind.id}.json`);
        valuesById[ind.id] = JSON.parse(await readFile(valPath, 'utf8'));
      }

      const { buildProfileShards } = await import('../../scripts/data/build-profiles.mjs');
      const shards = buildProfileShards(indicators, valuesById, units);

      // Select 30 units: 16 voivodeships, 7 counties, 7 gminas
      const wojs = units.filter((u: any) => u.level === 'woj').slice(0, 16);
      const pows = units.filter((u: any) => u.level === 'pow').slice(0, 7);
      const gmis = units.filter((u: any) => u.level === 'gmi').slice(0, 7);

      const testUnits = [...wojs, ...pows, ...gmis];
      expect(testUnits.length).toBe(30);

      let foundFromParent = false;

      for (const targetUnit of testUnits) {
        const wojTeryt = targetUnit.teryt.slice(0, 2);
        const shard = shards[wojTeryt];

        const expectedProfile = buildProfile(targetUnit.teryt, indicators, valuesById, units);
        const reconstructedProfile = profileFromShard(targetUnit.teryt, shard, indicators, units);

        expect(reconstructedProfile.teryt).toBe(expectedProfile.teryt);
        expect(reconstructedProfile.unit).toEqual(expectedProfile.unit);
        expect(reconstructedProfile.indicators).toEqual(expectedProfile.indicators);

        for (const item of reconstructedProfile.indicators) {
          if (item.fromParent) {
            foundFromParent = true;
          }
        }
      }

      expect(foundFromParent).toBe(true);
    });
  });
});
