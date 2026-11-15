import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  formatDatePl,
  ageInDays,
  isStale,
  freshnessLabel,
  loadFreshness,
  STALE_AFTER_DAYS,
} from '../../src/core/freshness/freshness';
import { DataFreshnessText } from '../../src/view/layout/DataFreshness';

const NOW = new Date('2026-11-15T12:00:00.000Z');

describe('freshness: format i próg', () => {
  it('formatuje datę po polsku DD.MM.RRRR', () => {
    expect(formatDatePl('2026-10-19T20:29:27.805Z')).toBe('19.10.2026');
    expect(formatDatePl('2026-01-05T10:00:00Z')).toBe('05.01.2026');
  });
  it('niepoprawna data daje null', () => {
    expect(formatDatePl('nie-data')).toBeNull();
    expect(formatDatePl(undefined)).toBeNull();
  });
  it('liczy wiek w pełnych dniach', () => {
    expect(ageInDays('2026-11-15T00:00:00Z', NOW)).toBe(0);
    expect(ageInDays('2026-10-19T12:00:00Z', NOW)).toBe(27);
  });
  it('próg 60 dni: 60 jeszcze aktualne, 61 nieaktualne', () => {
    expect(STALE_AFTER_DAYS).toBe(60);
    expect(isStale('2026-09-16T12:00:00Z', NOW)).toBe(false); // 60 dni
    expect(isStale('2026-09-15T12:00:00Z', NOW)).toBe(true); // 61 dni
  });
  it('etykieta: świeże bez dopisku, stare z dopiskiem', () => {
    expect(freshnessLabel('2026-10-19T20:29:27Z', NOW)).toBe('Dane GUS odświeżone: 19.10.2026');
    expect(freshnessLabel('2026-01-05T10:00:00Z', NOW)).toBe(
      'Dane GUS odświeżone: 05.01.2026 (dane mogą być nieaktualne)',
    );
    expect(freshnessLabel('zła', NOW)).toBeNull();
  });
});

describe('freshness: wczytanie (mock fetch)', () => {
  it('jest plik: zwraca etykietę', async () => {
    const f = vi.fn<typeof fetch>().mockResolvedValue({ ok: true, json: async () => ({ fetchedAt: '2026-10-19T20:29:27Z' }) } as Response);
    expect(await loadFreshness(f, NOW)).toBe('Dane GUS odświeżone: 19.10.2026');
    expect(f).toHaveBeenCalledTimes(1);
  });
  it('brak pliku (404): null', async () => {
    const f = vi.fn<typeof fetch>().mockResolvedValue({ ok: false, json: async () => ({}) } as Response);
    expect(await loadFreshness(f, NOW)).toBeNull();
  });
  it('błąd sieci: null', async () => {
    const f = vi.fn<typeof fetch>().mockRejectedValue(new Error('offline'));
    expect(await loadFreshness(f, NOW)).toBeNull();
  });
  it('plik bez fetchedAt: null', async () => {
    const f = vi.fn<typeof fetch>().mockResolvedValue({ ok: true, json: async () => ({}) } as Response);
    expect(await loadFreshness(f, NOW)).toBeNull();
  });
});

describe('freshness: komponent', () => {
  it('pokazuje tekst, a bez tekstu nic', () => {
    expect(renderToString(React.createElement(DataFreshnessText, { label: 'Dane GUS odświeżone: 19.10.2026' }))).toContain(
      'Dane GUS odświeżone: 19.10.2026',
    );
    expect(renderToString(React.createElement(DataFreshnessText, { label: null }))).toBe('');
  });
});
