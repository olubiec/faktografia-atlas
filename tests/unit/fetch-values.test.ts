import { describe, expect, it, vi } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  fetchIndicatorValues,
  fetchWithRetry,
  generateReportRow,
  getLevelsForIndicator,
  redactSecret,
} from '../../scripts/data/fetch-values.mjs';

const rootDir = path.resolve(__dirname, '../../');
const scriptPath = path.join(rootDir, 'scripts/data/fetch-values.mjs');
const units = JSON.parse(fs.readFileSync(path.join(rootDir, 'public/data/units.json'), 'utf8'));

describe('scripts/data/fetch-values.mjs (CC6.4b)', () => {
  it('Brak BDL_CLIENT_ID kończy skrypt kodem 1 i czytelnym komunikatem, bez tworzenia plików', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fetch-values-test-no-key-'));
    let error: any = null;
    try {
      execFileSync('node', [scriptPath, `--out-dir=${tmpDir}`], {
        env: { ...process.env, BDL_CLIENT_ID: '' },
        encoding: 'utf8',
        stdio: 'pipe',
      });
    } catch (e: any) {
      error = e;
    }

    expect(error).not.toBeNull();
    expect(error.status).toBe(1);
    const stderr = error.stderr.toString();
    expect(stderr).toMatch(/Brak BDL_CLIENT_ID/i);

    const files = fs.readdirSync(tmpDir);
    expect(files).toHaveLength(0);
  });

  it('redactSecret usuwa klucz BDL_CLIENT_ID z tekstu', () => {
    const secret = 'SECRET_KLUCZ_API_99999';
    const text = `Error: HTTP 500 dla https://bdl.stat.gov.pl/api/v1/data?key=${secret}`;
    const redacted = redactSecret(text, secret);
    expect(redacted).not.toContain(secret);
    expect(redacted).toContain('[REDACTED]');
  });

  it('poziomy dla wskaźnika: [2, 5, 6] dla gmi, [2, 5] dla pow', () => {
    expect(getLevelsForIndicator({ minLevel: 'gmi' })).toEqual([2, 5, 6]);
    expect(getLevelsForIndicator({ minLevel: 'pow' })).toEqual([2, 5]);
  });

  it('Limity i ponowienia (fetchWithRetry): tempo 1 request / 2 s, retry dla 429 i 5xx, max 5 prób', async () => {
    const sleepCalls: number[] = [];
    const mockSleep = async (ms: number) => {
      sleepCalls.push(ms);
    };

    let attempts = 0;
    const mockFetch = vi.fn<() => Promise<any>>().mockImplementation(async () => {
      attempts++;
      if (attempts === 1) return { ok: false, status: 500, statusText: 'Internal Server Error' };
      if (attempts === 2) return { ok: false, status: 429, statusText: 'Too Many Requests' };
      return { ok: true, status: 200, json: async () => ({ results: [] }) };
    });

    const res = await fetchWithRetry('https://api.test/data', 'SECRET_KLUCZ_API_99999', {
      fetchFn: mockFetch,
      sleepFn: mockSleep,
      intervalMs: 2000,
      maxAttempts: 5,
    });

    expect(res).toEqual({ results: [] });
    expect(attempts).toBe(3);
    expect(sleepCalls[0]).toBe(2000);
    expect(sleepCalls[1]).toBe(5000);
    expect(sleepCalls[2]).toBe(2000);
    expect(sleepCalls[3]).toBe(120000);
    expect(sleepCalls[4]).toBe(2000);
  });

  it('fetchWithRetry wyrzuca błąd po przekroczeniu maxAttempts', async () => {
    const mockSleep = async () => {};
    const mockFetch = vi.fn<() => Promise<any>>().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    });

    await expect(
      fetchWithRetry('https://api.test/data', 'SECRET_KLUCZ_API_99999', {
        fetchFn: mockFetch,
        sleepFn: mockSleep,
        intervalMs: 10,
        maxAttempts: 5,
      })
    ).rejects.toThrow(/HTTP 503/);

    expect(mockFetch).toHaveBeenCalledTimes(5);
  });

  it('pobiera wszystkie lata strona po stronie dla poziomów 2, 5, 6 na mockowanym fetch', async () => {
    const indicator = {
      id: 'test-ind',
      bdlVarId: 100,
      minLevel: 'gmi',
    };

    const requestedUrls: string[] = [];
    const mockFetch = vi.fn<(url: string) => Promise<any>>().mockImplementation(async (url: string) => {
      requestedUrls.push(url);
      const urlObj = new URL(url);
      const level = urlObj.searchParams.get('unit-level');
      const page = urlObj.searchParams.get('page');

      if (level === '2') {
        return {
          ok: true,
          json: async () => ({
            results: [
              { id: '030200000000', values: [{ year: 2023, val: 100 }] },
            ],
            links: {},
          }),
        };
      }
      if (level === '5') {
        return {
          ok: true,
          json: async () => ({
            results: [
              { id: '030210101000', values: [{ year: 2023, val: 50 }] },
            ],
            links: {},
          }),
        };
      }
      if (level === '6') {
        if (page === '0') {
          return {
            ok: true,
            json: async () => ({
              results: [
                { id: '030210101011', values: [{ year: 2023, val: 25 }] },
              ],
              links: {
                next: 'https://bdl.stat.gov.pl/api/v1/data/by-variable/100?unit-level=6&format=json&lang=pl&page-size=100&page=1',
              },
            }),
          };
        }
        return {
          ok: true,
          json: async () => ({
            results: [],
            links: {},
          }),
        };
      }
      return { ok: false, status: 404 };
    });

    const res = await fetchIndicatorValues(indicator, units, 'SECRET_KLUCZ_API_99999', {
      fetchFn: mockFetch,
      sleepFn: async () => {},
      intervalMs: 1,
    });

    expect(res.indicatorId).toBe('test-ind');
    expect(res.years).toEqual([2023]);
    expect(res.values['02']).toEqual([100]);
    expect(res.values['0201']).toEqual([50]);
    expect(res.values['0201011']).toEqual([25]);
  });

  it('Pobieranie z nagrań offline tworzy plik JSON z kluczami TERYT dla wskaźnika', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fetch-values-test-offline-'));

    const stdout = execFileSync('node', [scriptPath, '--only=preschool-3-6', `--out-dir=${tmpDir}`, '--offline-fixture'], {
      env: { ...process.env, BDL_CLIENT_ID: 'SECRET_KLUCZ_API_99999' },
      encoding: 'utf8',
      stdio: 'pipe',
    });

    expect(stdout).not.toContain('SECRET_KLUCZ_API_99999');

    const outFile = path.join(tmpDir, 'preschool-3-6.json');
    expect(fs.existsSync(outFile)).toBe(true);

    const data = JSON.parse(fs.readFileSync(outFile, 'utf8'));
    expect(data.indicatorId).toBe('preschool-3-6');
    expect(data.values).toBeDefined();

    const terytKeys = Object.keys(data.values);
    expect(terytKeys.some((k) => k.length === 4)).toBe(true);
    expect(terytKeys.some((k) => k.length === 7)).toBe(true);

    expect(stdout).toContain('preschool-3-6');
    expect(stdout).toMatch(/ostatni rok/i);
  });

  it('Opcja --skip-existing pomija istniejące pliki', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fetch-values-test-skip-'));
    const dummyFile = path.join(tmpDir, 'preschool-3-6.json');
    fs.writeFileSync(dummyFile, JSON.stringify({ indicatorId: 'preschool-3-6', existing: true }));

    const stdout = execFileSync('node', [scriptPath, '--only=preschool-3-6', '--skip-existing', `--out-dir=${tmpDir}`, '--offline-fixture'], {
      env: { ...process.env, BDL_CLIENT_ID: 'dummy' },
      encoding: 'utf8',
    });

    const data = JSON.parse(fs.readFileSync(dummyFile, 'utf8'));
    expect(data.existing).toBe(true);
    expect(stdout).toMatch(/skip/i);
  });

  it('generateReportRow tworzy czytelne podsumowanie wskaźnika', () => {
    const indicator = { id: 'unemployment-rate', minLevel: 'pow' };
    const result = {
      indicatorId: 'unemployment-rate',
      years: [2022, 2023],
      values: {
        '02': [1.1, 1.2],
        '0201': [5.5, 6.0],
      },
    };
    const row = generateReportRow(indicator, result, units, 4);
    expect(row).toContain('unemployment-rate');
    expect(row).toContain('ostatni rok: 2023');
    expect(row).toContain('woj: 1/16');
    expect(row).toContain('pow: 1/380');
    expect(row).toContain('zapytań: 4');
  });
});
