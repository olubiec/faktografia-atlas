import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildProfileShards } from '../../scripts/data/build-profiles.mjs';

describe('buildProfileShards & profile files (CC13.1)', () => {
  it('buildProfileShards generates shards for all 16 voivodeships with 2875 total units', { timeout: 15000 }, async () => {
    const root = path.resolve(__dirname, '../..');
    const units = JSON.parse(await readFile(path.join(root, 'public/data/units.json'), 'utf8'));
    const indicators = JSON.parse(await readFile(path.join(root, 'config/indicators.json'), 'utf8'));

    const valuesById: Record<string, any> = {};
    for (const ind of indicators) {
      const valPath = path.join(root, `public/data/values/${ind.id}.json`);
      valuesById[ind.id] = JSON.parse(await readFile(valPath, 'utf8'));
    }

    const shards = buildProfileShards(indicators, valuesById, units);

    const wojKeys = Object.keys(shards).sort();
    const expectedWojs = [
      '02', '04', '06', '08', '10', '12', '14', '16',
      '18', '20', '22', '24', '26', '28', '30', '32',
    ];
    expect(wojKeys).toEqual(expectedWojs);

    let totalUnitCount = 0;
    const seenTeryts = new Set<string>();

    for (const [woj, shard] of Object.entries(shards)) {
      expect(shard.woj).toBe(woj);
      expect(shard.generatedAt).toBeDefined();
      expect(typeof shard.generatedAt).toBe('string');

      const unitTeryts = Object.keys(shard.units);
      for (const teryt of unitTeryts) {
        expect(teryt.startsWith(woj)).toBe(true);
        expect(seenTeryts.has(teryt)).toBe(false);
        seenTeryts.add(teryt);
        totalUnitCount++;

        const items = shard.units[teryt];
        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBe(indicators.length);

        for (const item of items) {
          expect(item).toHaveProperty('indicatorId');
          expect(item).toHaveProperty('year');
          expect(item).toHaveProperty('value');
          expect(item).toHaveProperty('rankNational');
          expect(item).toHaveProperty('rankVoivodeship');
          expect(item).toHaveProperty('totalNational');
          expect(item).toHaveProperty('totalVoivodeship');
          expect(item).toHaveProperty('neutral');
          expect(item).toHaveProperty('years');
          expect(item).toHaveProperty('series');
        }
      }
    }

    expect(totalUnitCount).toBe(2875);
    expect(seenTeryts.size).toBe(units.length);
  });

  it('checks saved profile files in public/data/profiles/', async () => {
    const root = path.resolve(__dirname, '../..');
    const profilesDir = path.join(root, 'public/data/profiles');

    const files = (await readdir(profilesDir)).filter((f) => f.endsWith('.json'));
    expect(files.length).toBe(16);

    let maxSizeBytes = 0;
    for (const file of files) {
      const filePath = path.join(profilesDir, file);
      const fileStat = await stat(filePath);
      if (fileStat.size > maxSizeBytes) {
        maxSizeBytes = fileStat.size;
      }

      const content = await readFile(filePath, 'utf8');
      // Plik bez wcięć: nie powinno być wieloliniowego JSONa
      expect(content.split('\n').filter(Boolean).length).toBe(1);
    }

    // Największy plik ≤ 2.5 MB (2 621 440 bajtów)
    expect(maxSizeBytes).toBeLessThanOrEqual(2.5 * 1024 * 1024);
  });
});
