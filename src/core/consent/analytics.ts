import { readConsent, canLoadAnalytics } from './consent';
import type posthogJs from 'posthog-js';

/** Maksymalna długość wysyłanej frazy. */
const MAX_QUERY_LENGTH = 100;

/**
 * Opcje PostHog przyjazne prywatności: bez trwałego identyfikatora (pamięć karty),
 * bez nagrywania sesji, ankiet i zapytań o flagi; tylko zdarzenie „search”.
 */
export const POSTHOG_CONFIG = {
  api_host: 'https://eu.i.posthog.com',
  autocapture: false,
  capture_pageview: false,
  capture_pageleave: false,
  persistence: 'memory',
  disable_session_recording: true,
  disable_surveys: true,
  advanced_disable_flags: true,
  person_profiles: 'identified_only',
  ip: false,
} as const;

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

    posthog.init(normalizedKey, { ...POSTHOG_CONFIG });

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

  const cleanQuery = query.trim().slice(0, MAX_QUERY_LENGTH);
  if (!cleanQuery) {
    return;
  }

  // Frazy podobne do e-maila lub numeru telefonu/PESEL nie wychodzą z przeglądarki
  if (cleanQuery.includes('@') || /\d{9,}/.test(cleanQuery)) {
    return;
  }

  posthogInstance.capture('search', { query: cleanQuery });
}

/**
 * Zatrzymuje analitykę po cofnięciu zgody: wyłącza wysyłanie, czyści tożsamość
 * i zeruje stan. Do podpięcia w src/view/consent przy zmianie zgody na „denied”.
 */
export function stopAnalytics(): void {
  if (posthogInstance) {
    posthogInstance.opt_out_capturing();
    posthogInstance.reset();
  }
  posthogInstance = null;
  currentKey = null;
}

/**
 * Pomocnicza funkcja resetująca stan analityki na potrzeby testów jednostkowych.
 */
export function resetAnalyticsForTesting(): void {
  posthogInstance = null;
  currentKey = null;
}
