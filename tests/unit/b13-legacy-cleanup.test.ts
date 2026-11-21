import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanupLegacyStorage } from '../../src/core/profile/legacy-cleanup';

afterEach(() => vi.unstubAllGlobals());

function stub(data: Record<string, string>) {
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => data[k] ?? null,
    removeItem: (k: string) => {
      delete data[k];
    },
  });
}

describe('B13: czyszczenie starego klucza „Moje wskaźniki”', () => {
  it('usuwa klucz faktografia-my-indicators i nie rusza innych kluczy', () => {
    const data = { 'faktografia-my-indicators': '["a"]', 'faktografia-theme': 'dark' };
    stub(data);
    cleanupLegacyStorage();
    expect(data).toEqual({ 'faktografia-theme': 'dark' });
  });

  it('nie rzuca wyjątku, gdy localStorage jest niedostępny', () => {
    vi.stubGlobal('localStorage', {
      removeItem: () => {
        throw new Error('zablokowane');
      },
    });
    expect(() => cleanupLegacyStorage()).not.toThrow();
  });
});
