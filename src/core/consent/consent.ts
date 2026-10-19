export type Consent = 'granted' | 'denied';

export const CONSENT_KEY = 'fa-consent-v1';

interface ConsentRecord {
  value: Consent;
  at: string;
}

function getDefaultStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Brak dostępu do localStorage (np. tryb prywatny)
  }
  return null;
}

/**
 * Odczytuje zapisany stan zgody z podanego Storage (domyślnie localStorage).
 * Zgoda starsza niż 12 miesięcy jest traktowana jako wygasła (null).
 */
export function readConsent(storage: Storage | null = getDefaultStorage(), now: Date = new Date()): Consent | null {
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(CONSENT_KEY);
    if (!raw) {
      return null;
    }

    const record: unknown = JSON.parse(raw);
    if (typeof record !== 'object' || record === null) {
      return null;
    }

    const { value, at } = record as Partial<ConsentRecord>;

    if (value !== 'granted' && value !== 'denied') {
      return null;
    }

    if (typeof at !== 'string') {
      return null;
    }

    const atDate = new Date(at);
    if (isNaN(atDate.getTime())) {
      return null;
    }

    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    if (atDate < twelveMonthsAgo) {
      return null;
    }

    return value;
  } catch {
    return null;
  }
}

/**
 * Zapisuje zgodę użytkownika wraz z aktualnym znacznikiem czasu.
 */
export function writeConsent(
  storage: Storage | null = getDefaultStorage(),
  value: Consent,
  now: Date = new Date(),
): void {
  if (!storage) {
    return;
  }

  try {
    const record: ConsentRecord = {
      value,
      at: now.toISOString(),
    };
    storage.setItem(CONSENT_KEY, JSON.stringify(record));
  } catch {
    // Cicha obsługa błędów zapisu (np. pełny storage lub brak uprawnień)
  }
}

/**
 * Usuwa zapisany stan zgody.
 */
export function clearConsent(storage: Storage | null = getDefaultStorage()): void {
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(CONSENT_KEY);
  } catch {
    // Cicha obsługa błędów Storage
  }
}

/**
 * Sprawdza, czy należy wyświetlić zapytanie o zgodę (brak ważnej zgody).
 */
export function shouldAskForConsent(
  storage: Storage | null = getDefaultStorage(),
  now: Date = new Date(),
): boolean {
  return readConsent(storage, now) === null;
}

/**
 * Zwraca true, jeśli analityka (PostHog) może zostać załadowana.
 * Wymaga wyraźnej zgody ('granted') oraz niepustego klucza konfiguracyjnego.
 */
export function canLoadAnalytics(consent: Consent | null, key: string | undefined | null): boolean {
  if (consent !== 'granted') {
    return false;
  }

  if (typeof key !== 'string') {
    return false;
  }

  return key.trim().length > 0;
}
