import { describe, expect, it } from 'vitest';
import * as plan from '../../scripts/data/library-plan.mjs';
import * as prio from '../../scripts/data/library-priority.mjs';

const NOW = Date.parse('2026-11-22T12:00:00Z');
const h = (n: number) => new Date(NOW - n * 3600_000).toISOString();

describe('Biblioteka GUS – budżet przebiegu a okno 12 h', () => {
  it('bez poprzednich przebiegów daje pełny budżet', () => {
    expect(plan.budgetForRun({ runLog: [], now: NOW, total: 3300 })).toBe(3300);
  });
  it('zmniejsza budżet o zapytania z ostatnich 12 h (limit 5000 × 0,95)', () => {
    const runLog = [{ at: h(9), used: 3300 }];
    expect(plan.budgetForRun({ runLog, now: NOW, total: 3300 })).toBe(4750 - 3300);
  });
  it('przebieg starszy niż 12 h nie liczy się', () => {
    expect(plan.budgetForRun({ runLog: [{ at: h(13), used: 3300 }], now: NOW, total: 3300 })).toBe(3300);
  });
  it('nigdy nie schodzi poniżej zera', () => {
    expect(plan.budgetForRun({ runLog: [{ at: h(1), used: 9000 }], now: NOW, total: 3300 })).toBe(0);
  });
});

describe('Biblioteka GUS – nowy rok i odświeżanie', () => {
  it('adres sondy pyta o rok po ostatnim pobranym, poziom 5, jedną stronę', () => {
    const u = new URL(plan.yearProbeUrl(72305, [2023, 2024, 2025]));
    expect(u.searchParams.get('year')).toBe('2026');
    expect(u.searchParams.get('unit-level')).toBe('5');
    expect(u.pathname.endsWith('/data/by-variable/72305')).toBe(true);
  });
  it('hasNewYear: true tylko gdy jakakolwiek jednostka ma wartość', () => {
    expect(plan.hasNewYear({ results: [{ id: '1', values: [] }] })).toBe(false);
    expect(plan.hasNewYear({ results: [] })).toBe(false);
    expect(plan.hasNewYear(null)).toBe(false);
    expect(plan.hasNewYear({ results: [{ id: '1', values: [{ year: '2026', val: 5 }] }] })).toBe(true);
  });
  it('kandydaci do odświeżenia: tylko starsze niż N dni, przypięte i popularne pierwsze', () => {
    const done = { 1: '2026-10-01', 2: '2026-11-20', 3: '2026-10-02', 4: '2026-10-03' };
    const config = { refreshAfterDays: 14, pinnedIds: [4] };
    const score = (id: number) => (id === 3 ? 90 : 10);
    const out = plan.refreshCandidates({ done, config, now: NOW, scoreOf: score });
    expect(out).toEqual([4, 3, 1]);
  });
});

describe('Biblioteka GUS – ponawianie błędów', () => {
  it('po 3 błędach zmienna wraca do kolejki dopiero po retryAfterDays', () => {
    const v = { id: 9, level: 6, subjectId: 'S', n1: 'x' };
    const catalog = { subjects: { S: { path: ['LUDNOŚĆ'] } } };
    const config = { retryAfterDays: 7 };
    const failed = { 9: 3 };
    const q = (failedAt: Record<string, string>) =>
      prio.sortQueueByPriority([v], catalog, config, { done: {}, failed, failedAt, now: NOW }) as unknown[];
    expect(q({ 9: new Date(NOW - 2 * 86400_000).toISOString() })).toHaveLength(0);
    expect(q({ 9: new Date(NOW - 8 * 86400_000).toISOString() })).toHaveLength(1);
  });
});

describe('Biblioteka GUS – popularność i klucz tematów', () => {
  it('im więcej otwarć wskaźnika, tym wyższy wynik', () => {
    const v = { id: 5, level: 6, n1: 'x' };
    const base = { sectionWeights: { LUDNOŚĆ: 100 }, popularityWeight: 10 };
    const a = prio.priorityScore(v, ['LUDNOŚĆ'], { ...base, popularity: { 5: 1 } });
    const b = prio.priorityScore(v, ['LUDNOŚĆ'], { ...base, popularity: { 5: 100 } });
    expect(b).toBeGreaterThan(a);
  });
  it('plan nocny: tylko wskaźniki z nowym rokiem (lista id)', () => {
    const probe = { population: true, 'avg-wage': false };
    expect(plan.idsWithNewYear(probe)).toEqual(['population']);
  });
});

describe('Nocna sonda nowego roku', () => {
  it('brak pliku wartości = pobierz; stary rok = pomiń; nowy rok = pobierz', async () => {
    const { probeAll } = await import('../../scripts/data/probe-new-year.mjs');
    const inds = [
      { id: 'a', bdlVarId: 1 }, { id: 'b', bdlVarId: 2 }, { id: 'c', bdlVarId: 3 },
    ];
    const years: Record<string, number[] | null> = { a: null, b: [2024, 2025], c: [2024, 2025] };
    const fetched: string[] = [];
    const out = await probeAll(
      inds,
      async (id: string) => years[id],
      async (url: string) => {
        fetched.push(url);
        return { results: [{ values: url.includes('/3?') ? [{ year: '2026', val: 1 }] : [] }] };
      },
    );
    expect(out).toEqual({ a: true, b: false, c: true });
    expect(fetched).toHaveLength(2); // dla „a” bez zapytania
  });
});
