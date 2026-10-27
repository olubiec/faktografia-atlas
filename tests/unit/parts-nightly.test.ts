import { describe, expect, it, vi } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fetchIndicatorValues } from '../../scripts/data/fetch-values.mjs';

const rootDir = path.resolve(__dirname, '../../');
const scriptPath = path.join(rootDir, 'scripts/data/fetch-values.mjs');
const units = JSON.parse(fs.readFileSync(path.join(rootDir, 'public/data/units.json'), 'utf8'));

describe('W1.17 - Nocny robot zapisuje części miasto i wieś (S20)', () => {
  it('fetchIndicatorValues woła onPages(pages) raz z wszystkimi pobranymi stronami', async () => {
    const indicator = {
      id: 'test-ind',
      bdlVarId: 100,
      minLevel: 'gmi',
    };

    const mockFetch = vi.fn<(url: string) => Promise<any>>().mockImplementation(async (url: string) => {
      const urlObj = new URL(url);
      const level = urlObj.searchParams.get('unit-level');
      return {
        ok: true,
        json: async () => ({
          results: [
            { id: `03021010100${level}`, values: [{ year: 2023, val: 10 }] },
          ],
          links: {},
        }),
      };
    });

    const onPagesMock = vi.fn<(pages: any[]) => Promise<void> | void>();

    const res = await fetchIndicatorValues(indicator, units, 'SECRET_CLIENT_ID', {
      fetchFn: mockFetch,
      sleepFn: async () => {},
      intervalMs: 1,
      onPages: onPagesMock,
    });

    expect(res.indicatorId).toBe('test-ind');
    expect(onPagesMock).toHaveBeenCalledTimes(1);
    const pagesArg = onPagesMock.mock.calls[0][0];
    expect(Array.isArray(pagesArg)).toBe(true);
    expect(pagesArg.length).toBe(3); // levels 2, 5, 6
  });

  it('w trybie nagrań (offlineFixture): liczba żądań z onPages = bez onPages', async () => {
    const indicator = {
      id: 'preschool-3-6',
      bdlVarId: 1617169,
      minLevel: 'gmi',
    };
    const recordedDir = path.join(rootDir, 'tests/fixtures/bdl/recorded');

    const statsWithout = { requests: 0 };
    await fetchIndicatorValues(indicator, units, 'SECRET_CLIENT_ID', {
      offlineFixture: true,
      recordedDir,
      stats: statsWithout,
    });

    const statsWith = { requests: 0 };
    await fetchIndicatorValues(indicator, units, 'SECRET_CLIENT_ID', {
      offlineFixture: true,
      recordedDir,
      stats: statsWith,
      onPages: async () => {},
    });

    expect(statsWith.requests).toBe(statsWithout.requests);
  });

  it('wskaźnik z listy daje plik z częściami gmin m-w (bez wcięć i bez fetchedAt), spoza listy - brak pliku', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'parts-nightly-test-'));
    const outValuesDir = path.join(tmpDir, 'values');

    // Indicator in config/parts.json (preschool-3-6)
    execFileSync('node', [scriptPath, '--only=preschool-3-6', `--out-dir=${outValuesDir}`, '--offline-fixture'], {
      env: { ...process.env, BDL_CLIENT_ID: 'SECRET_KLUCZ_API_99999' },
      encoding: 'utf8',
      stdio: 'pipe',
    });

    const partsDir = path.join(tmpDir, 'parts-src');
    const partsFileAllowed = path.join(partsDir, 'preschool-3-6.json');
    expect(fs.existsSync(partsFileAllowed)).toBe(true);

    const rawAllowedContent = fs.readFileSync(partsFileAllowed, 'utf8');
    // Plik bez wcięć - JSON.stringify bez zamienników i wcięć
    expect(rawAllowedContent.endsWith('\n')).toBe(true);
    const parsedAllowed = JSON.parse(rawAllowedContent);
    expect(JSON.stringify(parsedAllowed) + '\n').toBe(rawAllowedContent);

    // Brak pola fetchedAt
    expect(parsedAllowed.fetchedAt).toBeUndefined();
    expect(parsedAllowed.indicatorId).toBe('preschool-3-6');
    expect(parsedAllowed.years).toBeDefined();
    expect(parsedAllowed.values).toBeDefined();

    // Indicator not in config/parts.json (unemployment-rate)
    execFileSync('node', [scriptPath, '--only=unemployment-rate', `--out-dir=${outValuesDir}`, '--offline-fixture'], {
      env: { ...process.env, BDL_CLIENT_ID: 'SECRET_KLUCZ_API_99999' },
      encoding: 'utf8',
      stdio: 'pipe',
    });

    const partsFileNotAllowed = path.join(partsDir, 'unemployment-rate.json');
    expect(fs.existsSync(partsFileNotAllowed)).toBe(false);
  });
});
