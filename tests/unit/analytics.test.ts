import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  init: vi.fn<(key: string, config: Record<string, unknown>) => void>(),
  capture: vi.fn<(name: string, props: Record<string, unknown>) => void>(),
  optOut: vi.fn<() => void>(),
  reset: vi.fn<() => void>(),
}));

vi.mock('posthog-js', () => ({
  default: {
    init: mocks.init,
    capture: mocks.capture,
    opt_out_capturing: mocks.optOut,
    reset: mocks.reset,
  },
}));

import {
  POSTHOG_CONFIG,
  startAnalytics,
  stopAnalytics,
  trackSearch,
  resetAnalyticsForTesting,
} from '../../src/core/consent/analytics';
import { CONSENT_KEY } from '../../src/core/consent/consent';

function storageWith(value: 'granted' | 'denied' | null): Storage {
  const data = new Map<string, string>();
  if (value) {
    data.set(CONSENT_KEY, JSON.stringify({ value, at: new Date().toISOString() }));
  }
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
    key: () => null,
    length: 0,
  } as Storage;
}

beforeEach(() => {
  vi.clearAllMocks();
  resetAnalyticsForTesting();
});

describe('startAnalytics', () => {
  it('bez zgody (denied) zwraca false i nie ładuje posthog-js', async () => {
    expect(await startAnalytics('phc_test', storageWith('denied'))).toBe(false);
    expect(mocks.init).not.toHaveBeenCalled();
  });

  it('bez zapisanej decyzji zwraca false i nie ładuje posthog-js', async () => {
    expect(await startAnalytics('phc_test', storageWith(null))).toBe(false);
    expect(mocks.init).not.toHaveBeenCalled();
  });

  it('ze zgodą i kluczem przekazuje POSTHOG_CONFIG do init', async () => {
    expect(await startAnalytics('phc_test', storageWith('granted'))).toBe(true);
    expect(mocks.init).toHaveBeenCalledTimes(1);
    const [key, config] = mocks.init.mock.calls[0];
    expect(key).toBe('phc_test');
    expect(config).toEqual(POSTHOG_CONFIG);
    expect(config.persistence).toBe('memory');
    expect(config.autocapture).toBe(false);
    expect(config.disable_session_recording).toBe(true);
    expect(config.capture_pageleave).toBe(false);
    expect(config.person_profiles).toBe('identified_only');
    expect(config.ip).toBe(false);
    expect(config.disable_surveys).toBe(true);
    expect(config.api_host.startsWith('https://eu.')).toBe(true);
  });
});

describe('trackSearch', () => {
  beforeEach(async () => {
    await startAnalytics('phc_test', storageWith('granted'));
  });

  it('przycina frazę do 100 znaków', () => {
    trackSearch('a'.repeat(150));
    expect(mocks.capture).toHaveBeenCalledWith('search', { query: 'a'.repeat(100) });
  });

  it('wysyła zwykłą frazę', () => {
    trackSearch('  Kraków ');
    expect(mocks.capture).toHaveBeenCalledWith('search', { query: 'Kraków' });
  });

  it('pomija pustą frazę, e-mail i numer z 9 cyframi', () => {
    trackSearch('   ');
    trackSearch('jan@example.com');
    trackSearch('tel 123456789');
    expect(mocks.capture).not.toHaveBeenCalled();
  });

  it('wysyła frazę z 8 cyframi', () => {
    trackSearch('12345678');
    expect(mocks.capture).toHaveBeenCalledTimes(1);
  });
});

describe('stopAnalytics', () => {
  it('wywołuje opt_out_capturing i reset, a potem trackSearch nic nie wysyła', async () => {
    await startAnalytics('phc_test', storageWith('granted'));
    stopAnalytics();
    expect(mocks.optOut).toHaveBeenCalledTimes(1);
    expect(mocks.reset).toHaveBeenCalledTimes(1);
    trackSearch('Kraków');
    expect(mocks.capture).not.toHaveBeenCalled();
  });

  it('bez uruchomionej analityki nie rzuca błędu', () => {
    expect(() => stopAnalytics()).not.toThrow();
    expect(mocks.optOut).not.toHaveBeenCalled();
  });
});
