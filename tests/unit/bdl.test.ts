import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  unitsResponseSchema,
  variablesSearchResponseSchema,
  dataByVariableResponseSchema,
} from '../../src/core/bdl/schemas';
import {
  bdlGet,
  bdlGetAllPages,
  getRequestCount,
  resetRequestCount,
} from '../../src/core/bdl/client';

describe('BDL Fixtures Validation', () => {
  test('units.json odpowiada schematowi Zod', () => {
    const fixturePath = path.resolve(__dirname, '../fixtures/bdl/units.json');
    const content = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    const result = unitsResponseSchema.safeParse(content);
    expect(result.success).toBe(true);
  });

  test('variables-search.json odpowiada schematowi Zod', () => {
    const fixturePath = path.resolve(__dirname, '../fixtures/bdl/variables-search.json');
    const content = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    const result = variablesSearchResponseSchema.safeParse(content);
    expect(result.success).toBe(true);
  });

  test('data-by-variable.json odpowiada schematowi Zod', () => {
    const fixturePath = path.resolve(__dirname, '../fixtures/bdl/data-by-variable.json');
    const content = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    const result = dataByVariableResponseSchema.safeParse(content);
    expect(result.success).toBe(true);
  });
});

describe('BDL API Client (Sztuczny Fetch)', () => {
  const originalEnv = process.env.BDL_CLIENT_ID;

  beforeEach(() => {
    resetRequestCount();
    delete process.env.BDL_CLIENT_ID;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.BDL_CLIENT_ID = originalEnv;
    } else {
      delete process.env.BDL_CLIENT_ID;
    }
  });

  test('ponawia zapytanie przy HTTP 429 i 5xx z potęgującym opóźnieniem (maks 5 prób)', async () => {
    let attempts = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      attempts++;
      if (attempts < 3) {
        return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
          status: 429,
          statusText: 'Too Many Requests',
        });
      }
      return new Response(JSON.stringify({ totalRecords: 1, results: [{ id: '1', name: 'Test' }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const result = await bdlGet<{ totalRecords: number }>('/test', {}, {
      fetchFn: mockFetch,
      initialDelayMs: 1,
    });

    expect(attempts).toBe(3);
    expect(result.totalRecords).toBe(1);
    expect(getRequestCount()).toBe(3);
  });

  test('nie ponawia zapytania przy błędach nieodnawialnych np. HTTP 404', async () => {
    let attempts = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      attempts++;
      return new Response('Not Found', {
        status: 404,
        statusText: 'Not Found',
      });
    });

    await expect(
      bdlGet('/test', {}, { fetchFn: mockFetch, initialDelayMs: 1, maxRetries: 5 })
    ).rejects.toThrow('HTTP 404 Not Found');

    expect(attempts).toBe(1);
    expect(getRequestCount()).toBe(1);
  });

  test('zgłasza błąd po 5 nieudanych próbach (429 / 5xx)', async () => {
    let attempts = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      attempts++;
      return new Response(JSON.stringify({ error: 'Server Error' }), {
        status: 500,
        statusText: 'Internal Server Error',
      });
    });

    await expect(
      bdlGet('/test', {}, { fetchFn: mockFetch, initialDelayMs: 1, maxRetries: 5 })
    ).rejects.toThrow();

    expect(attempts).toBe(5);
  });

  test('stronicowanie pobiera dane z 3 stron', async () => {
    const mockFetch = vi.fn().mockImplementation(async (url: string) => {
      const parsedUrl = new URL(url);
      const page = parsedUrl.searchParams.get('page') || '0';

      if (page === '0') {
        return new Response(
          JSON.stringify({
            totalRecords: 3,
            links: {
              self: 'https://bdl.stat.gov.pl/api/v1/test?page=0',
              next: 'https://bdl.stat.gov.pl/api/v1/test?page=1',
            },
            results: [{ id: '1' }],
          }),
          { status: 200 }
        );
      } else if (page === '1') {
        return new Response(
          JSON.stringify({
            totalRecords: 3,
            links: {
              self: 'https://bdl.stat.gov.pl/api/v1/test?page=1',
              next: 'https://bdl.stat.gov.pl/api/v1/test?page=2',
            },
            results: [{ id: '2' }],
          }),
          { status: 200 }
        );
      } else {
        return new Response(
          JSON.stringify({
            totalRecords: 3,
            links: {
              self: 'https://bdl.stat.gov.pl/api/v1/test?page=2',
            },
            results: [{ id: '3' }],
          }),
          { status: 200 }
        );
      }
    });

    const results = await bdlGetAllPages<{ id: string }>('/test', {}, {
      fetchFn: mockFetch,
      initialDelayMs: 1,
    });

    expect(results).toHaveLength(3);
    expect(results).toEqual([{ id: '1' }, { id: '2' }, { id: '3' }]);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  test('ustawia nagłówek X-ClientId tylko gdy klucz jest ustawiony', async () => {
    let lastHeaders: Headers | null = null;
    const mockFetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      lastHeaders = new Headers(init?.headers);
      return new Response(JSON.stringify({ totalRecords: 0, results: [] }), { status: 200 });
    });

    // 1. Bez klucza
    delete process.env.BDL_CLIENT_ID;
    await bdlGet('/test', {}, { fetchFn: mockFetch, initialDelayMs: 1 });
    expect(lastHeaders?.get('X-ClientId')).toBeNull();

    // 2. Z kluczem w process.env.BDL_CLIENT_ID
    process.env.BDL_CLIENT_ID = 'secret-key-12345';
    await bdlGet('/test', {}, { fetchFn: mockFetch, initialDelayMs: 1 });
    expect(lastHeaders?.get('X-ClientId')).toBe('secret-key-12345');
  });

  test('klucz nie pojawia się w żaden sposób w komunikatach błędu', async () => {
    const SECRET = 'SECRET_KLUCZ_API_99999';
    process.env.BDL_CLIENT_ID = SECRET;

    const mockFetch = vi.fn().mockImplementation(async () => {
      return new Response('Błąd serwera', { status: 500 });
    });

    try {
      await bdlGet('/test', {}, { fetchFn: mockFetch, initialDelayMs: 1, maxRetries: 1 });
      expect.fail('Powinien zgłosić wyjątek');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      expect(errorMessage).not.toContain(SECRET);
    }
  });
});

describe('Architektura: brak importów klienta BDL poza src/core/bdl', () => {
  test('żaden plik w src/view ani src/core (poza src/core/bdl) nie importuje klienta BDL', () => {
    const srcDir = path.resolve(__dirname, '../../src');

    function checkDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          // Pomijamy katalog src/core/bdl
          if (fullPath.includes(path.join('src', 'core', 'bdl'))) {
            continue;
          }
          checkDir(fullPath);
        } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          // Sprawdzamy czy importuje klienta BDL
          const importsBdl =
            /from\s+['"].*bdl(\/client)?['"]/i.test(content) ||
            /import\(['"].*bdl(\/client)?['"]\)/i.test(content);
          expect(
            importsBdl,
            `Plik ${fullPath} nie powinien importować klienta BDL!`
          ).toBe(false);
        }
      }
    }

    checkDir(srcDir);
  });
});
