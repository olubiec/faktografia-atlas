import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  CONSENT_KEY,
  readConsent,
  writeConsent,
  clearConsent,
  shouldAskForConsent,
  canLoadAnalytics,
  type Consent,
} from '../../src/core/consent/consent';

// Mock storage helper
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

function createFailingStorage(): Storage {
  return {
    getItem: () => {
      throw new Error('SecurityError: Access is denied for this document');
    },
    setItem: () => {
      throw new Error('SecurityError: Access is denied for this document');
    },
    removeItem: () => {
      throw new Error('SecurityError: Access is denied for this document');
    },
    clear: () => {
      throw new Error('SecurityError: Access is denied for this document');
    },
    length: 0,
    key: () => null,
  };
}

describe('Logika zgody na statystyki (CC11.1a)', () => {
  it('definiuje poprawną stałą CONSENT_KEY', () => {
    expect(CONSENT_KEY).toBe('fa-consent-v1');
  });

  it('zapisuje i odczytuje zgodę z datą w formacie JSON { value, at }', () => {
    const storage = createMockStorage();
    const now = new Date('2026-03-01T12:00:00Z');
    const value: Consent = 'granted';

    writeConsent(storage, value, now);

    const raw = storage.getItem(CONSENT_KEY);
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveProperty('value', 'granted');
    expect(parsed).toHaveProperty('at');
    expect(new Date(parsed.at).toISOString()).toBe(now.toISOString());

    expect(readConsent(storage, now)).toBe(value);
    expect(shouldAskForConsent(storage, now)).toBe(false);
  });

  it('traktuje zgodę starszą niż 12 miesięcy jako brak zgody (wygaśnięcie)', () => {
    const storage = createMockStorage();
    const initialTime = new Date('2025-01-01T10:00:00Z');
    writeConsent(storage, 'granted', initialTime);

    // Po 11 miesiącach - zgoda jest nadal ważna
    const month11 = new Date('2025-12-01T10:00:00Z');
    expect(readConsent(storage, month11)).toBe('granted');
    expect(shouldAskForConsent(storage, month11)).toBe(false);

    // Po 12 miesiącach i 1 dniu - zgoda wygasła
    const month12Plus1Day = new Date('2026-01-02T10:00:00Z');
    expect(readConsent(storage, month12Plus1Day)).toBeNull();
    expect(shouldAskForConsent(storage, month12Plus1Day)).toBe(true);
  });

  it('poprawnie obsługuje decyzję odmowną (denied)', () => {
    const storage = createMockStorage();
    const now = new Date('2026-03-01T12:00:00Z');
    const deniedValue: Consent = 'denied';

    writeConsent(storage, deniedValue, now);

    expect(readConsent(storage, now)).toBe(deniedValue);
    expect(shouldAskForConsent(storage, now)).toBe(false);
  });

  it('czyszczenie zgody (clearConsent) usuwa wpis z pamięci', () => {
    const storage = createMockStorage();
    writeConsent(storage, 'granted');
    expect(readConsent(storage)).toBe('granted');

    clearConsent(storage);
    expect(readConsent(storage)).toBeNull();
    expect(shouldAskForConsent(storage)).toBe(true);
  });

  it('obsługuje uszkodzony wpis JSON oraz nieprawidłowe wartości pola value/at bez wyjątku', () => {
    const storage = createMockStorage();

    // Uszkodzony syntaktycznie JSON
    storage.setItem(CONSENT_KEY, 'invalid-json-{');
    expect(readConsent(storage)).toBeNull();
    expect(shouldAskForConsent(storage)).toBe(true);

    // Nieprawidłowe value
    storage.setItem(CONSENT_KEY, JSON.stringify({ value: 'maybe', at: new Date().toISOString() }));
    expect(readConsent(storage)).toBeNull();

    // Nieprawidłowa data
    storage.setItem(CONSENT_KEY, JSON.stringify({ value: 'granted', at: 'not-a-date' }));
    expect(readConsent(storage)).toBeNull();

    // Brak pola at
    storage.setItem(CONSENT_KEY, JSON.stringify({ value: 'granted' }));
    expect(readConsent(storage)).toBeNull();
  });

  it('obsługuje wyjątki storage (np. tryb prywatny lub zablokowany localStorage) bez wyjątku', () => {
    const failingStorage = createFailingStorage();

    expect(() => readConsent(failingStorage)).not.toThrow();
    expect(readConsent(failingStorage)).toBeNull();

    expect(() => writeConsent(failingStorage, 'granted')).not.toThrow();

    expect(() => clearConsent(failingStorage)).not.toThrow();

    expect(() => shouldAskForConsent(failingStorage)).not.toThrow();
    expect(shouldAskForConsent(failingStorage)).toBe(true);
  });

  it('canLoadAnalytics zwraca true tylko dla "granted" i niepustego klucza', () => {
    const validKey = 'phc_abc123';

    expect(canLoadAnalytics('granted', validKey)).toBe(true);
    expect(canLoadAnalytics('granted', '   ')).toBe(false);
    expect(canLoadAnalytics('granted', '')).toBe(false);
    expect(canLoadAnalytics('granted', undefined as unknown as string)).toBe(false);

    expect(canLoadAnalytics('denied', validKey)).toBe(false);
    expect(canLoadAnalytics(null, validKey)).toBe(false);
  });

  it('nie zawiera jakiegokolwiek importu posthog-js w pliku źródłowym src/core/consent/consent.ts', () => {
    const filePath = path.join(__dirname, '../../src/core/consent/consent.ts');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).not.toContain('posthog-js');
    expect(content).not.toContain('posthog');
  });
});
