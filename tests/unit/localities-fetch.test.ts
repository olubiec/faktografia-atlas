import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { parseArgs, fetchWithRetry, main } from '../../scripts/geo/localities.mjs';

describe('PRNG Localities Fetch Script', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prng-fetch-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  describe('parseArgs', () => {
    it('parses default CLI options', () => {
      const args = parseArgs([]);
      expect(args.fixture).toBe(false);
      expect(args.concurrency).toBe(5);
      expect(args.limit).toBe(150);
    });

    it('parses CLI flags correctly', () => {
      const args = parseArgs([
        '--fixture',
        'my-fixture.json',
        '--out',
        'out.json',
        '--units',
        'units.json',
        '--cache',
        'cache.json',
        '--concurrency',
        '10',
        '--limit',
        '100'
      ]);

      expect(args.fixture).toBe(true);
      expect(args.fixturePath).toContain('my-fixture.json');
      expect(args.outPath).toContain('out.json');
      expect(args.unitsPath).toContain('units.json');
      expect(args.cachePath).toContain('cache.json');
      expect(args.concurrency).toBe(10);
      expect(args.limit).toBe(100);
    });

    it('honors LOCALITIES_FIXTURE env variable', () => {
      const origEnv = process.env.LOCALITIES_FIXTURE;
      process.env.LOCALITIES_FIXTURE = '1';
      const args = parseArgs([]);
      expect(args.fixture).toBe(true);
      if (origEnv !== undefined) {
        process.env.LOCALITIES_FIXTURE = origEnv;
      } else {
        delete process.env.LOCALITIES_FIXTURE;
      }
    });
  });

  describe('fetchWithRetry', () => {
    it('returns JSON data on successful fetch', async () => {
      const mockData = { numberMatched: 10, features: [] };
      vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue({
        ok: true,
        json: async () => mockData
      } as Response));

      const res = await fetchWithRetry('https://example.com/api', {}, 5000, 2);
      expect(res).toEqual(mockData);
    });

    it('retries on HTTP error and succeeds', async () => {
      const mockData = { ok: true };
      const fetchMock = vi.fn<typeof fetch>()
        .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Error' } as Response)
        .mockResolvedValueOnce({ ok: true, json: async () => mockData } as Response);

      vi.stubGlobal('fetch', fetchMock);

      const res = await fetchWithRetry('https://example.com/api', {}, 5000, 2);
      expect(res).toEqual(mockData);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('throws after exceeding max retries', async () => {
      vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable'
      } as Response));

      await expect(fetchWithRetry('https://example.com/api', {}, 100, 2)).rejects.toThrow(/Failed to fetch/);
    });
  });

  describe('main script execution in fixture mode', () => {
    it('executes main with fixture and writes localidades output', async () => {
      const outPath = path.join(tmpDir, 'localities.json');
      const unitsPath = path.join(process.cwd(), 'public/data/units.json');
      const fixturePath = path.join(process.cwd(), 'tests/fixtures/prng/sample.json');

      const origArgv = process.argv;
      process.argv = ['node', 'scripts/geo/localities.mjs', '--fixture', fixturePath, '--units', unitsPath, '--out', outPath];

      await main();

      process.argv = origArgv;

      expect(fs.existsSync(outPath)).toBe(true);
      const content = fs.readFileSync(outPath, 'utf8');
      const localities = JSON.parse(content);
      expect(Array.isArray(localities)).toBe(true);
      expect(localities.length).toBe(6);
      expect(localities[0]).toHaveProperty('id');
      expect(localities[0]).toHaveProperty('name');
      expect(localities[0]).toHaveProperty('gminaTeryt');
    });

    it('throws if units file does not exist', async () => {
      const origArgv = process.argv;
      process.argv = ['node', 'scripts/geo/localities.mjs', '--fixture', '--units', path.join(tmpDir, 'nonexistent.json')];

      await expect(main()).rejects.toThrow(/Plik jednostek nie istnieje/);

      process.argv = origArgv;
    });
  });
});
