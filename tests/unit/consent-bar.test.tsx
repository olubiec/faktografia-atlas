import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  writeConsent,
} from '../../src/core/consent/consent';
import {
  startAnalytics,
  trackSearch,
  resetAnalyticsForTesting,
} from '../../src/core/consent/analytics';
import { ConsentBar } from '../../src/view/consent/ConsentBar';

// Helper storage
function createMockStorage(initialData: Record<string, string> = {}): Storage {
  const store: Record<string, string> = { ...initialData };
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k in store) delete store[k];
    },
    length: Object.keys(store).length,
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
}

describe('Unit tests: analytics.ts & ConsentBar (CC11.1b)', () => {
  beforeEach(() => {
    resetAnalyticsForTesting();
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  });

  describe('analytics.ts', () => {
    it('startAnalytics nie ładuje PostHog gdy brak zgody lub przy odmowie (denied)', async () => {
      const storage = createMockStorage();

      // Brak zgody (null)
      const resNull = await startAnalytics('phc_test_key_123', storage);
      expect(resNull).toBe(false);

      // Odmowa (denied)
      writeConsent(storage, 'denied');
      const resDenied = await startAnalytics('phc_test_key_123', storage);
      expect(resDenied).toBe(false);
    });

    it('startAnalytics nie ładuje PostHog gdy brak klucza lub klucz jest pusty', async () => {
      const storage = createMockStorage();
      writeConsent(storage, 'granted');

      const resUndefined = await startAnalytics(undefined, storage);
      expect(resUndefined).toBe(false);

      const resEmpty = await startAnalytics('   ', storage);
      expect(resEmpty).toBe(false);
    });

    it('trackSearch bez zainicjalizowanego PostHog wywołuje się bez błędu', () => {
      expect(() => trackSearch('Warszawa')).not.toThrow();
      expect(() => trackSearch('')).not.toThrow();
    });
  });

  describe('ConsentBar component', () => {
    it('renderuje pasek gdy brak ważnej zgody (null w localStorage)', () => {
      const html = renderToString(<ConsentBar />);

      expect(html).toContain('role="region"');
      expect(html).toContain('aria-label="Zgoda na analitykę"');
      expect(html).toContain('Czy możemy liczyć anonimowo, czego szukasz?');
      expect(html).toContain('Zgadzam się');
      expect(html).toContain('Nie');
      expect(html).toContain('min-h-[44px]');
      expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    });

    it('nie renderuje nic (null) gdy zgoda jest już udzielona lub odrzucona', () => {
      const storage = createMockStorage();

      writeConsent(storage, 'granted');
      const htmlGranted = renderToString(<ConsentBar storage={storage} />);
      expect(htmlGranted).toBe('');

      writeConsent(storage, 'denied');
      const htmlDenied = renderToString(<ConsentBar storage={storage} />);
      expect(htmlDenied).toBe('');
    });
  });
});
