import { readConsent, canLoadAnalytics } from './consent';
import type posthogJs from 'posthog-js';

let posthogInstance: typeof posthogJs | null = null;
let currentKey: string | null = null;

/**
 * Uruchamia analitykę PostHog poprzez dynamiczny import('posthog-js')
 * wyłącznie w sytuacji, gdy użytkownik udzielił zgody ('granted')
 * oraz przekazano niepusty klucz konfiguracyjny.
 */
export async function startAnalytics(
  key?: string,
  storage?: Storage | null,
): Promise<boolean> {
  const consent = readConsent(storage);
  const apiKey = key ?? (import.meta.env.VITE_POSTHOG_KEY as string | undefined);

  if (!canLoadAnalytics(consent, apiKey)) {
    return false;
  }

  const normalizedKey = apiKey!.trim();
  if (posthogInstance && currentKey === normalizedKey) {
    return true;
  }

  try {
    const posthogModule = await import('posthog-js');
    const posthog = posthogModule.default ?? posthogModule;

    posthog.init(normalizedKey, {
      api_host: 'https://eu.i.posthog.com',
      autocapture: false,
      capture_pageview: false,
    });

    posthogInstance = posthog;
    currentKey = normalizedKey;
    return true;
  } catch {
    return false;
  }
}

/**
 * Zapisuje zdarzenie wyszukiwania w analityce PostHog bez danych osobowych.
 */
export function trackSearch(query: string): void {
  if (!posthogInstance) {
    return;
  }

  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return;
  }

  posthogInstance.capture('search', { query: cleanQuery });
}

/**
 * Pomocnicza funkcja resetująca stan analityki na potrzeby testów jednostkowych.
 */
export function resetAnalyticsForTesting(): void {
  posthogInstance = null;
  currentKey = null;
}
