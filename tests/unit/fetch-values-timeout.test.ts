import { describe, expect, it, vi } from 'vitest';
import { fetchWithRetry } from '../../scripts/data/fetch-values.mjs';

describe('fetchWithRetry timeout (CC12.3)', () => {
  it('zapytanie bez odpowiedzi kończy się po timeoutMs, jest ponawiane i wyrzuca błąd po maxAttempts', async () => {
    let attempts = 0;
    const mockFetch = vi.fn<(_url: string, init?: any) => Promise<any>>().mockImplementation((_url: string, init?: any) => {
      attempts++;
      return new Promise((_, reject) => {
        const signal: AbortSignal | undefined = init?.signal;
        if (signal) {
          if (signal.aborted) {
            reject(signal.reason ?? new Error('Aborted'));
          } else {
            signal.addEventListener('abort', () => {
              reject(signal.reason ?? new Error('Aborted'));
            });
          }
        }
      });
    });

    const sleepCalls: number[] = [];
    const mockSleep = async (ms: number) => {
      sleepCalls.push(ms);
    };

    const clientId = 'SECRET_KLUCZ_API_12345';
    const url = `https://api.test/data?key=${clientId}`;

    await expect(
      fetchWithRetry(url, clientId, {
        fetchFn: mockFetch as any,
        sleepFn: mockSleep,
        intervalMs: 5,
        maxAttempts: 3,
        timeoutMs: 50,
      })
    ).rejects.toThrow('Przekroczono limit czasu zapytania (50 ms, próby: 3): https://api.test/data?key=[REDACTED]');

    expect(attempts).toBe(3);
  });

  it('klucz BDL_CLIENT_ID nie pojawia się w żadnym komunikacie błędu przy timeout', async () => {
    const clientId = 'SECRET_KLUCZ_API_99999';
    const url = `https://api.test/data?key=${clientId}`;

    const mockFetch = vi.fn<(_url: string, init?: any) => Promise<any>>().mockImplementation((_url: string, init?: any) => {
      return new Promise((_, reject) => {
        const signal: AbortSignal | undefined = init?.signal;
        if (signal) {
          if (signal.aborted) {
            reject(new Error(`Timeout with key ${clientId}`));
          } else {
            signal.addEventListener('abort', () => {
              reject(new Error(`Timeout with key ${clientId}`));
            });
          }
        }
      });
    });

    let thrownError: any = null;
    await fetchWithRetry(url, clientId, {
      fetchFn: mockFetch as any,
      sleepFn: async () => {},
      intervalMs: 1,
      maxAttempts: 1,
      timeoutMs: 10,
    }).catch((err) => {
      thrownError = err;
    });

    expect(thrownError).not.toBeNull();
    expect(thrownError.message).not.toContain(clientId);
    expect(thrownError.message).toContain('[REDACTED]');
  });
});
