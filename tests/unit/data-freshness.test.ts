import { describe, it, expect } from 'vitest';
import {
  latestTimestamp,
  formatDay,
  describeFreshness,
  describeCheck,
} from '../../src/core/data/freshness';

const NOW = new Date('2026-11-18T10:00:00Z');

describe('latestTimestamp', () => {
  it('wybiera największą poprawną datę, pomijając złe i puste', () => {
    const latest = latestTimestamp(['2026-10-19T20:25:18.912Z', 'zła', undefined, '2026-10-19T21:25:48.342Z']);
    expect(latest?.toISOString()).toBe('2026-10-19T21:25:48.342Z');
  });

  it('same złe daty dają null', () => {
    expect(latestTimestamp(['zła', undefined, null, ''])).toBeNull();
    expect(latestTimestamp([])).toBeNull();
  });
});

describe('formatDay', () => {
  it('formatuje dzień w strefie Europe/Warsaw (po północy czasu polskiego jest już następny dzień)', () => {
    expect(formatDay(new Date('2026-10-19T22:30:00Z'))).toBe('20.10.2026');
  });

  it('dzień i miesiąc są dwucyfrowe', () => {
    expect(formatDay(new Date('2026-03-05T12:00:00Z'))).toBe('05.03.2026');
  });
});

describe('describeFreshness', () => {
  it('liczy wiek w dniach i oznacza dane jako przeterminowane po 3 dniach', () => {
    const f = describeFreshness('2026-10-19T20:00:00Z', NOW);
    expect(f).toEqual({ label: 'Dane z 19.10.2026', ageDays: 30, stale: true });
  });

  it('dane sprzed 3 dni jeszcze nie są przeterminowane, sprzed 4 – już tak', () => {
    expect(describeFreshness('2026-11-15T10:00:00Z', NOW)?.stale).toBe(false);
    expect(describeFreshness('2026-11-14T10:00:00Z', NOW)?.stale).toBe(true);
  });

  it('data z przyszłości daje wiek 0 i brak przeterminowania', () => {
    const f = describeFreshness('2026-12-01T10:00:00Z', NOW);
    expect(f?.ageDays).toBe(0);
    expect(f?.stale).toBe(false);
  });

  it('brak lub zła data daje null', () => {
    expect(describeFreshness(null, NOW)).toBeNull();
    expect(describeFreshness(undefined, NOW)).toBeNull();
    expect(describeFreshness('', NOW)).toBeNull();
    expect(describeFreshness('xyz', NOW)).toBeNull();
  });

  it('jawny próg staleAfterDays zmienia ocenę tego samego wieku', () => {
    expect(describeFreshness('2026-10-19T20:00:00Z', NOW, 60)?.stale).toBe(false);
  });
});

describe('describeCheck', () => {
  it('ten sam dzień: dziś', () => {
    expect(describeCheck('2026-11-18T01:00:00Z', NOW)).toBe('Sprawdzone przez automat: dziś');
  });

  it('poprzedni dzień: wczoraj', () => {
    expect(describeCheck('2026-11-17T12:00:00Z', NOW)).toBe('Sprawdzone przez automat: wczoraj');
  });

  it('kolejne dni: „N dni temu”, nigdy „1 dni”', () => {
    expect(describeCheck('2026-11-15T12:00:00Z', NOW)).toBe('Sprawdzone przez automat: 3 dni temu');
    expect(describeCheck('2026-11-13T12:00:00Z', NOW)).toBe('Sprawdzone przez automat: 5 dni temu');
  });

  it('brak lub zła data: null', () => {
    expect(describeCheck(null, NOW)).toBeNull();
    expect(describeCheck('xyz', NOW)).toBeNull();
  });
});
