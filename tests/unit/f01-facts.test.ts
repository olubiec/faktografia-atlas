import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import config from '../../config/facts.json';
import indicatorsConfig from '../../config/indicators.json';
import fixture from '../fixtures/facts/opolskie.json';
import { buildFacts } from '../../src/core/facts/build';
import { decodeFact, encodeFact } from '../../src/core/facts/codec';
import { createContext } from '../../src/core/facts/context';
import { detectChange } from '../../src/core/facts/detectors';
import { sentenceFor } from '../../src/core/facts/report';
import { selectFacts } from '../../src/core/facts/select';
import type { Fact, FactIndicator, FactsConfig, FactsInput, FactUnit, IndicatorValues } from '../../src/core/facts/types';

// Wycinek prawdziwych danych (opis w polu $opis fixture): woj. opolskie, 84 jednostki, 9 wskaźników.
const input: FactsInput = {
  indicators: fixture.indicators as FactIndicator[],
  units: fixture.units as FactUnit[],
  values: fixture.values as unknown as Record<string, IndicatorValues>,
  config: config as unknown as FactsConfig,
};
const build = buildFacts(input);
const all = [...build.byUnit.values()].flatMap((u) => u.selected);
const sentences = all.map((f) => sentenceFor(build.ctx, f));

const root = path.resolve(__dirname, '../..');
const readPublic = (rel: string) => fs.readFileSync(path.join(root, 'public/data', rel), 'utf8');

describe('F01 fakty na wycinku danych', () => {
  it('każda jednostka fixture ma co najmniej 3 fakty', () => {
    expect(build.byUnit.size).toBe(84);
    const short = [...build.byUnit].filter(([, u]) => u.selected.length < 3).map(([teryt]) => teryt);
    expect(short).toEqual([]);
  });

  it('zdania nie mają undefined/NaN/null, mają liczbę i rok', () => {
    expect(sentences.length).toBe(all.length);
    for (const s of sentences) {
      expect(s).not.toBeNull();
      expect(s).not.toMatch(/undefined|NaN|null/);
      expect(s).toMatch(/\b(19|20)\d\d\b/);
      // Liczba poza rokiem (wartość) – po usunięciu lat zostaje cyfra.
      expect(s!.replace(/\b(19|20)\d\d\b/g, '')).toMatch(/\d/);
    }
  });

  it('zakazane słowa nie występują w żadnym zdaniu', () => {
    for (const s of sentences) {
      expect(s!.toLowerCase()).not.toMatch(/najlepsz|najgorsz/);
      expect(s).not.toContain('!');
    }
  });

  it('miejsce w rankingu zawsze „z N”', () => {
    const ranked = all.filter((f) => f.compare.kind === 'rank' || f.compare.kind === 'change');
    expect(ranked.length).toBeGreaterThan(0);
    for (const f of ranked) expect(sentenceFor(build.ctx, f)).toMatch(/ z \d[\d ]* (gmin|powiatów|województw)/);
  });

  it('dobór nie daje 2 faktów o tym samym wskaźniku ani > 2 z jednej grupy', () => {
    for (const u of build.byUnit.values()) {
      const ids = u.selected.map((f) => f.indicatorId);
      expect(new Set(ids).size).toBe(ids.length);
      const groups = ids.map((id) => build.ctx.indicators.get(id)!.group);
      for (const g of new Set(groups)) expect(groups.filter((x) => x === g).length).toBeLessThanOrEqual(2);
    }
  });

  it('dobór odrzuca drugi, słabszy fakt o tym samym wskaźniku', () => {
    const base = all.find((f) => f.type !== 'F9')!;
    const twin: Fact = { ...base, type: 'F9', strength: base.strength - 0.01, compare: { kind: 'typical', median: 1, percentile: 50 } };
    const other: Fact = { ...base, indicatorId: 'forest-cover', strength: 0.01 };
    const picked = selectFacts([twin, base, other], build.ctx.indicators, { count: 3, perIndicator: 1, perGroup: 2 });
    expect(picked.map((f) => f.indicatorId)).toEqual([base.indicatorId, 'forest-cover']);
    expect(picked[0]).toBe(base);
  });
});

describe('F01 zmiany granic', () => {
  const ctx = build.ctx;
  const population = ctx.indicators.get('population')!;

  it('wykrywa skok powierzchni Opola w 2017 r. (miasto i powiat)', () => {
    expect(ctx.boundaryYears('1661011')).toContain(2017);
    expect(ctx.boundaryYears('1661')).toContain(2017);
    expect(ctx.boundaryYears('1609032')).toContain(2017); // Dobrzeń Wielki oddał sołectwa
  });

  it('okno 2015–2025 Opola nie daje faktu F4 o ludności', () => {
    for (const teryt of ['1661011', '1661', '1609032']) {
      expect(detectChange(ctx, ctx.units.get(teryt)!, population)).toEqual([]);
    }
    expect(all.filter((f) => f.type === 'F4' && ['1661011', '1661', '1609032'].includes(f.teryt) && f.indicatorId === 'population')).toEqual([]);
  });

  it('bez detektora (brak gęstości) to samo okno dałoby F4 – wykluczenie działa z powodu granic', () => {
    const { density: _d, ...noDensity } = input.values;
    const blind = createContext({ ...input, values: noDensity });
    const facts = detectChange(blind, blind.units.get('1609032')!, population);
    expect(facts.length).toBeGreaterThan(0);
  });
});

describe('F01 pliki public/data/facts', () => {
  const units = JSON.parse(readPublic('units.json')) as FactUnit[];
  const wojs = units.filter((u) => u.level === 'woj').map((u) => u.teryt);

  it('facts-start.json ma ≤ 5120 bajtów, 30 faktów dnia i 4 zestawienia po 5 pozycji z obu końców skali', () => {
    const raw = readPublic('facts-start.json');
    expect(Buffer.byteLength(raw, 'utf8')).toBeLessThanOrEqual(5120);
    const start = JSON.parse(raw);
    expect(start.daily).toHaveLength(30);
    expect(new Set(start.daily.map((d: { u: string }) => d.u)).size).toBe(30);
    for (const d of start.daily) expect(['F1', 'F4']).toContain(d.f[0]);
    expect(start.lists).toHaveLength(4);
    for (const l of start.lists) {
      expect(l.top).toHaveLength(5);
      expect(l.bottom).toHaveLength(5);
    }
  });

  it.each(wojs)('facts/%s.json ma wszystkie jednostki województwa, każdą z ≥ 3 faktami', (woj) => {
    const shard = JSON.parse(readPublic(`facts/${woj}.json`));
    const expected = units.filter((u) => u.teryt.startsWith(woj)).map((u) => u.teryt).sort();
    expect(Object.keys(shard.units).sort()).toEqual(expected);
    const ids = new Set(indicatorsConfig.map((i) => i.id));
    const entries = Object.entries(shard.units as Record<string, (string | number)[][]>);
    expect(entries.filter(([, facts]) => facts.length < 3).map(([teryt]) => teryt)).toEqual([]);
    for (const [teryt, facts] of entries) {
      for (const e of facts) expect(ids.has(decodeFact(teryt, e).indicatorId)).toBe(true);
    }
  });

  it('zapis zwarty odtwarza fakt bez strat', () => {
    for (const f of all.slice(0, 40)) expect(decodeFact(f.teryt, encodeFact(f))).toEqual(f);
  });
});
