import { describe, expect, it } from 'vitest';
import config from '../../config/facts.json';
import fixture from '../fixtures/facts/opolskie.json';
import { boundaryChangeYears, impliedArea, windowHasBoundaryChange } from '../../src/core/facts/boundaries';
import { buildFacts } from '../../src/core/facts/build';
import { createContext, trailingMean } from '../../src/core/facts/context';
import { rankOf, withinTop } from '../../src/core/facts/rank';
import { factSentence } from '../../src/core/facts/sentences';
import { buildStart, dailyIndex } from '../../src/core/facts/start';
import { finishFact } from '../../src/core/facts/strength';
import type { Fact, FactIndicator, FactsConfig, FactsInput, FactUnit, IndicatorValues } from '../../src/core/facts/types';

const cfg = config as unknown as FactsConfig;
const input: FactsInput = {
  indicators: fixture.indicators as FactIndicator[],
  units: fixture.units as FactUnit[],
  values: fixture.values as unknown as Record<string, IndicatorValues>,
  config: cfg,
};
const income = { name: 'Dochody budżetu gminy na mieszkańca (zł)', unit: 'zł' };

const fact = (over: Partial<Fact>): Fact => ({
  type: 'F1',
  teryt: '1006092',
  indicatorId: 'income-per-capita',
  year: 2025,
  value: 35169,
  frame: 'kraj',
  strength: 1,
  compare: { kind: 'rank', dir: 1, rank: 1, total: 2479, tie: false },
  ...over,
});

describe('F01 szablony zdań', () => {
  it('F1: najwyższa wartość z N gmin w Polsce, liczba w formacie pl-PL', () => {
    expect(factSentence(fact({}), { indicator: income, level: 'gmi' })).toBe(
      'Dochody budżetu gminy na mieszkańca: 35 169 zł w 2025 r. – najwyższa wartość z 2 479 gmin w Polsce.',
    );
  });

  it('F2: miejsce w województwie w miejscowniku, remis jako ex aequo', () => {
    const f = fact({ type: 'F2', compare: { kind: 'rank', dir: -1, rank: 3, total: 183, tie: true } });
    expect(factSentence(f, { indicator: income, level: 'gmi', voivodeshipName: 'małopolskie' })).toContain(
      '– 3. najniższa wartość (ex aequo) z 183 gmin w województwie małopolskim.',
    );
  });

  it('F4: słowo zmiany zgodne ze znakiem (wzrost/spadek), bez oceny', () => {
    const pop = { name: 'Ludność ogółem', unit: 'osoba' };
    const up = fact({ type: 'F4', indicatorId: 'population', value: 19700, compare: { kind: 'change', dir: 1, rank: 1, total: 2329, fromYear: 2015, fromValue: 10000 } });
    expect(factSentence(up, { indicator: pop, level: 'gmi' })).toBe(
      'Ludność ogółem: +97,0% od 2015 r. (19\u00A0700\u00A0osób w 2025 r.) – największy wzrost z 2\u00A0329 gmin w Polsce.',
    );
    const down = fact({ type: 'F4', indicatorId: 'population', value: 9000, compare: { kind: 'change', dir: -1, rank: 2, total: 2329, fromYear: 2015, fromValue: 10000 } });
    expect(factSentence(down, { indicator: pop, level: 'gmi' })).toContain('– 2. największy spadek z');
  });

  it('średnia 3-letnia małej gminy jest nazwana w zdaniu', () => {
    const f = fact({ indicatorId: 'dwellings-per-1000', value: 12.3, span: 3 });
    expect(factSentence(f, { indicator: { name: 'Mieszkania oddane do użytku na 1000 ludności', unit: 'na 1000' }, level: 'gmi' })).toContain(
      'średnio 12,3 na 1000 w latach 2023–2025',
    );
  });

  it('F2 bez nazwy województwa nie daje zdania (zamiast „undefined”)', () => {
    expect(factSentence(fact({ type: 'F2' }), { indicator: income, level: 'gmi' })).toBeNull();
  });
});

describe('F01 detektor granic i pomocnicze', () => {
  it('skok powierzchni > 3% r/r to zmiana granic; zaokrąglenie gęstości nie', () => {
    const area = impliedArea([2015, 2016, 2017], [1000, 1010, 1550], [2015, 2016, 2017], [10, 10.1, 10.3]);
    expect(boundaryChangeYears(area, 0.03)).toEqual([2017]);
    expect(windowHasBoundaryChange([2017], 2015, 2025)).toBe(true);
    expect(windowHasBoundaryChange([2017], 2017, 2027)).toBe(false);
  });

  it('średnia krocząca wymaga pełnych 3 lat', () => {
    expect(trailingMean([1, 2, 3, null, 5, 6, 7], 3)).toEqual([null, null, 2, null, null, null, 6]);
  });

  it('mała gmina (< 5 tys.) dostaje średnią 3-letnią dla wskaźników „na 1000”, duża – nie', () => {
    const ctx = createContext(input);
    const small = fixture.units.find((u) => {
      const p = (fixture.values.population.values as Record<string, (number | null)[]>)[u.teryt];
      return u.level === 'gmi' && p && (p.at(-1) ?? 0) < 5000;
    })!;
    expect(ctx.series(small.teryt, 'dwellings-per-1000')!.span).toBe(3);
    expect(ctx.series(small.teryt, 'income-per-capita')!.span).toBe(1);
    expect(ctx.series('1661011', 'dwellings-per-1000')!.span).toBe(1);
  });

  it('skrajność liczy całą grupę remisu', () => {
    const sorted = [0, 0, 0, 1, 2, 3];
    expect(withinTop(rankOf(sorted, 0, -1), 1)).toBe(false);
    expect(withinTop(rankOf(sorted, 3, 1), 1)).toBe(true);
  });

  it('siła: kraj 1. z 2479 silniejszy niż województwo 1. z 20', () => {
    const national = finishFact({ ...fact({}) }, cfg, 2025);
    const voiv = finishFact({ ...fact({ type: 'F2', compare: { kind: 'rank', dir: 1, rank: 1, total: 20, tie: false } }) }, cfg, 2025);
    const old = finishFact({ ...fact({ year: 2020 }) }, cfg, 2025);
    expect(national.strength).toBeGreaterThan(voiv.strength);
    expect(old.strength).toBeLessThan(national.strength);
  });
});

describe('F01 start', () => {
  it('Odkrycie dnia: rotacja deterministyczna po dacie (UTC), co 30 dni od nowa', () => {
    const a = dailyIndex(new Date('2026-11-22T08:00:00Z'), 30);
    expect(dailyIndex(new Date('2026-11-22T23:00:00Z'), 30)).toBe(a);
    expect(dailyIndex(new Date('2026-11-23T08:00:00Z'), 30)).toBe((a + 1) % 30);
    expect(dailyIndex(new Date('2026-12-22T08:00:00Z'), 30)).toBe(a);
  });

  it('zestawienia: 3 pierwsze pozycje w kolejności wartości', () => {
    const start = buildStart(buildFacts(input), '2026-11-17T00:00:00.000Z');
    const income = start.lists.find((l) => l.indicatorId === 'income-per-capita')!;
    const values = income.top.map((t) => t[2]);
    expect(values).toEqual([...values].sort((a, b) => b - a));
    expect(income.level).toBe('gmi');
  });
});
