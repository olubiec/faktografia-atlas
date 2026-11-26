import { describe, expect, it } from 'vitest';
import config from '../../config/facts.json';
import fixture from '../fixtures/facts/opolskie.json';
import baseline from '../fixtures/facts/w27-d02-start-baseline.json';
import { buildFacts } from '../../src/core/facts/build';
import { decodeFact } from '../../src/core/facts/codec';
import { boostFresh, freshYears, isFresh, NEVER_FRESH, updateLedger } from '../../src/core/facts/fresh';
import { buildStart, dailyIndex } from '../../src/core/facts/start';
import type { Fact, FactIndicator, FactsConfig, FactsInput, FactUnit, IndicatorValues } from '../../src/core/facts/types';

const cfg = config as unknown as FactsConfig;
const GEN = '2026-11-17T10:00:00.000Z';
const DAY = 86_400_000;
const at = (days: number) => new Date(Date.parse(GEN) + days * DAY).toISOString();
const values = fixture.values as unknown as Record<string, IndicatorValues>;
const input = (fresh?: Record<string, number>, c: FactsConfig = cfg): FactsInput => ({
  indicators: fixture.indicators as FactIndicator[],
  units: fixture.units as FactUnit[],
  values,
  config: c,
  fresh,
});
const FRESH_ID = 'income-per-capita';
const freshInput = input({ [FRESH_ID]: 2025 });

const series = (years: number[], fetchedAt?: string): IndicatorValues => ({ fetchedAt, years, values: { a: years.map(() => 1) } });

describe('W27-D02 księga świeżości', () => {
  it('nowy rok wskaźnika ustawia since na generatedAt', () => {
    const prev = { x: { year: 2024, since: '2026-01-01T00:00:00.000Z' } };
    const out = updateLedger(prev, { x: series([2023, 2024, 2025]) }, GEN, 28);
    expect(out.x).toEqual({ year: 2025, since: GEN });
  });

  it('ten sam rok nie zmienia since', () => {
    const prev = { x: { year: 2025, since: '2026-01-01T00:00:00.000Z' } };
    expect(updateLedger(prev, { x: series([2024, 2025]) }, GEN, 28)).toEqual(prev);
  });

  it('nowy wskaźnik w istniejącej księdze jest świeży', () => {
    const out = updateLedger({}, { y: series([2025]) }, GEN, 28);
    expect(out.y.since).toBe(GEN);
  });

  it('brak pliku nie robi wszystkiego świeżym; wyjątek: fetchedAt w oknie days', () => {
    const out = updateLedger(null, { old: series([2025], at(-100)), recent: series([2025], at(-3)), none: series([2025]) }, GEN, 28);
    expect(out.old.since).toBe(NEVER_FRESH);
    expect(out.none.since).toBe(NEVER_FRESH);
    expect(freshYears(out, GEN, 28)).toEqual({ recent: 2025 });
  });

  it('ten sam stan danych daje identyczny JSON (klucze posortowane)', () => {
    const vals = { b: series([2025], at(-1)), a: series([2024], at(-50)) };
    const first = updateLedger(null, vals, GEN, 28);
    const second = updateLedger(first, vals, GEN, 28);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    expect(Object.keys(first)).toEqual(['a', 'b']);
  });

  it('świeży do fresh.days włącznie, potem nie', () => {
    const e = { year: 2025, since: GEN };
    expect(isFresh(e, at(28), 28)).toBe(true);
    expect(isFresh(e, at(29), 28)).toBe(false);
  });
});

describe('W27-D02 siła faktów', () => {
  const base = buildFacts(input());
  const boosted = buildFacts(freshInput);
  const pick = (b: ReturnType<typeof buildFacts>, pred: (f: Fact) => boolean) =>
    [...b.byUnit.values()].flatMap((u) => u.selected).filter(pred);

  it('fakty wskaźnika świeżego z najnowszego roku są silniejsze o fresh.boost (i skrajne dodatkowo)', () => {
    const f = { type: 'F2', teryt: '1609032', indicatorId: FRESH_ID, year: 2025, value: 1, frame: 'wojewodztwo', strength: 1, compare: { kind: 'rank', dir: 1, rank: 2, total: 20, tie: false } } as Fact;
    const [plain] = boostFresh([f], cfg.fresh, { [FRESH_ID]: 2025 });
    expect(plain.strength).toBeCloseTo(cfg.fresh!.boost, 2);
    const extreme = { ...f, type: 'F1', frame: 'kraj', compare: { kind: 'rank', dir: 1, rank: 1, total: 2479, tie: false } } as Fact;
    expect(boostFresh([extreme], cfg.fresh, { [FRESH_ID]: 2025 })[0].strength).toBeCloseTo(cfg.fresh!.boost * cfg.fresh!.extremeBoost, 2);
    const record = { ...f, type: 'F5', frame: 'rekord', compare: { kind: 'record', dir: 1, median: 1, sinceYear: 2000 } } as Fact;
    expect(boostFresh([record], cfg.fresh, { [FRESH_ID]: 2025 })[0].strength).toBeCloseTo(cfg.fresh!.boost * cfg.fresh!.extremeBoost, 2);
  });

  it('1. miejsce z remisem i starszy rok nie dostają skrajności ani mnożnika', () => {
    const tie = { type: 'F1', teryt: 't', indicatorId: FRESH_ID, year: 2025, value: 1, frame: 'kraj', strength: 1, compare: { kind: 'rank', dir: 1, rank: 1, total: 9, tie: true } } as Fact;
    expect(boostFresh([tie], cfg.fresh, { [FRESH_ID]: 2025 })[0].strength).toBeCloseTo(cfg.fresh!.boost, 2);
    expect(boostFresh([{ ...tie, year: 2024 }], cfg.fresh, { [FRESH_ID]: 2025 })[0].strength).toBe(1);
  });

  it('po fresh.days mnożnik znika: wskaźnik nie jest już w zbiorze świeżych', () => {
    const ledger = { [FRESH_ID]: { year: 2025, since: GEN } };
    const fresh = freshYears(ledger, at(29), cfg.fresh!.days);
    expect(fresh).toEqual({});
    const out = buildFacts(input(fresh));
    expect(JSON.stringify([...out.byUnit.values()].map((u) => u.selected))).toBe(JSON.stringify([...base.byUnit.values()].map((u) => u.selected)));
  });

  it('świeży wskaźnik wypycha stare fakty: w wyborze jednostek jest go więcej niż bez świeżości', () => {
    const count = (b: typeof base) => pick(b, (f) => f.indicatorId === FRESH_ID).length;
    expect(count(boosted)).toBeGreaterThan(count(base));
  });
});

describe('W27-D02 Odkrycie dnia i zestawienia', () => {
  it('bez świeżych wskaźników buildStart daje wynik identyczny z dotychczasowym kodem', () => {
    expect(JSON.parse(JSON.stringify(buildStart(buildFacts(input()), GEN)))).toEqual(baseline);
  });

  const build = buildFacts(freshInput);
  const start = buildStart(build, GEN);
  const L = start.daily.length;

  it('pierwsze dailySlots dni po generatedAt wskazują fakty świeżego wskaźnika, jednostki się nie powtarzają', () => {
    const nationalFresh = [...build.byUnit.values()].flatMap((u) => u.selected).filter((f) => f.indicatorId === FRESH_ID && f.frame === 'kraj' && f.compare.kind === 'rank' && f.compare.rank === 1 && !f.compare.tie);
    const expected = Math.min(cfg.fresh!.dailySlots, new Set(nationalFresh.map((f) => f.teryt)).size);
    expect(expected).toBeGreaterThan(0);
    for (let k = 0; k < expected; k++) {
      const entry = start.daily[dailyIndex(new Date(Date.parse(GEN) + k * DAY), L)];
      expect(decodeFact(entry.u, entry.f).indicatorId).toBe(FRESH_ID);
    }
    const units = start.daily.map((d) => d.u);
    expect(new Set(units).size).toBe(units.length);
    expect(L).toBeLessThanOrEqual(cfg.start.dailyCount);
  });

  it('zestawienie świeżego wskaźnika jest pierwsze, bez małych gmin, a facts-start.json ≤ 4 KB', () => {
    expect(start.lists[0]).toMatchObject({ indicatorId: FRESH_ID, level: 'gmi', dir: 1 });
    expect(start.lists.slice(1).map((l) => l.indicatorId)).toEqual(baseline.lists.slice(1).map((l) => l.indicatorId));
    const pop = values.population;
    for (const [teryt] of start.lists[0].top) {
      const s = pop.values[teryt];
      const last = [...s].reverse().find((v) => v != null) as number;
      expect(last).toBeGreaterThanOrEqual(cfg.thresholds.smallPopulation);
    }
    expect(JSON.stringify(start).length).toBeLessThanOrEqual(4096);
  });

  it('z kilku świeżych wybiera ten o większej sumie siły faktów krajowych', () => {
    const two = buildStart(buildFacts(input({ [FRESH_ID]: 2025, 'forest-cover': 2025 })), GEN);
    expect(['income-per-capita', 'forest-cover']).toContain(two.lists[0].indicatorId);
    expect(two.lists).toHaveLength(baseline.lists.length);
  });
});

describe('W27-D02 wagi nowych wskaźników', () => {
  it('wagi z config/facts.json są wpisane zgodnie z zadaniem', () => {
    expect(cfg.indicatorWeights).toMatchObject({
      'births-per-1000': 1,
      'old-per-100-young': 1,
      'deaths-per-1000': 0.8,
      'people-per-pharmacy': 0.8,
      'bike-paths-per-10k': 0.6,
      'marriages-per-1000': 0.6,
      'nursery-per-1000-under3': 0.8,
    });
  });

  it('wagi wskaźników, których nie ma w danych, niczego nie psują', () => {
    const out = buildFacts(input());
    expect(out.byUnit.size).toBe(fixture.units.length);
    expect(JSON.stringify(buildStart(out, GEN))).toBe(JSON.stringify(baseline));
  });
});
