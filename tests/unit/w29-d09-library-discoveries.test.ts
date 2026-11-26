import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import config from '../../config/facts.json';
import fixture from '../fixtures/facts/opolskie.json';
import available from '../fixtures/library/d09-available.json';
import calendar from '../fixtures/library/d09-calendar.json';
import { factsFromValues } from '../../scripts/data/premieres.mjs';
import { buildFacts, buildShards } from '../../src/core/facts/build';
import { decodeFact } from '../../src/core/facts/codec';
import { buildLibraryFacts, freshLibraryIds, isSupportedUnit, prepareLibraryFresh } from '../../src/core/facts/library-fresh';
import { buildStart, dailyIndex } from '../../src/core/facts/start';
import { mapHref } from '../../src/core/start/discoveries';
import type { AvailableVariable } from '../../src/core/indicators/registry';
import type { LibraryValues } from '../../src/core/library/load-library';
import type { Unit } from '../../src/core/units/types';
import type { FactIndicator, FactsConfig, FactsInput, FactUnit, IndicatorValues } from '../../src/core/facts/types';

const cfg = config as unknown as FactsConfig;
const FRESH_DAYS = config.fresh.days;
const GEN = '2026-11-17T10:00:00.000Z';
const DAY = 86_400_000;
const YEARS = [2022, 2023, 2024, 2025];
const bdl = (teryt: string) => `B${teryt}`;
const units = fixture.units as FactUnit[];
const gminas = units.filter((u) => u.level === 'gmi');
const unitList = units.map((u) => ({ ...u, bdlId: bdl(u.teryt), bbox: [0, 0, 0, 0], centroid: [0, 0] })) as unknown as Unit[];
const base: FactsInput = {
  indicators: fixture.indicators as FactIndicator[],
  units,
  values: fixture.values as unknown as Record<string, IndicatorValues>,
  config: cfg,
};

/** Wartości zmiennej na poziomie gmin: 71 prawdziwych gmin + (opcjonalnie) wypełniacz do ≥ 95% z 2477 gmin kraju. */
function rawValues(varId: string, { filler }: { filler: boolean }): LibraryValues {
  const d: Record<string, number[]> = {};
  gminas.forEach((u, i) => {
    d[bdl(u.teryt)] = YEARS.map((_, k) => 5 + ((i * 37) % 71) + k * 0.5 + i * 0.001);
  });
  if (filler) for (let i = 0; i < 2400; i++) d[`FILL${i}`] = YEARS.map(() => 1);
  return { v: varId, fetchedAt: GEN, l6: { y: YEARS, d } };
}
const RAW: Record<string, LibraryValues> = {
  '9001': rawValues('9001', { filler: true }),
  '9002': rawValues('9002', { filler: false }),
  '9003': rawValues('9003', { filler: true }),
  '9004': rawValues('9004', { filler: true }),
};
const avail = available as unknown as { variables: AvailableVariable[] };
const prepare = (generatedAt = GEN, overrides: Partial<Parameters<typeof prepareLibraryFresh>[0]> = {}) =>
  prepareLibraryFresh({
    calendar,
    available: avail,
    readValues: (id) => RAW[id] ?? null,
    units: unitList,
    generatedAt,
    config: cfg,
    isNiche: (_id, raw, v) => factsFromValues(raw, { unit: v.u, name: v.n }).niche,
    ...overrides,
  });

describe('W29-D09 wybór świeżych zmiennych biblioteki', () => {
  it('bierze pobrane w ciągu fresh.days, najnowsze pierwsze, najwyżej libraryMax; waiting i rejected pomija', () => {
    const opts = { days: FRESH_DAYS, max: 10 };
    expect(freshLibraryIds(calendar, GEN, opts)).toEqual(['9002', '9004', '9001']);
    expect(freshLibraryIds(calendar, GEN, { ...opts, max: 1 })).toEqual(['9002']);
    expect(config.fresh.libraryMax).toBe(3);
  });

  it('po okresie świeżości zmienna wypada (zostaje w bibliotece, ale nie w Odkryciach)', () => {
    const later = new Date(Date.parse('2026-11-16') + (FRESH_DAYS + 1) * DAY).toISOString();
    expect(freshLibraryIds(calendar, later, { days: FRESH_DAYS, max: 10 })).toEqual([]);
    expect(prepare(later).indicators).toEqual([]);
  });

  it('brak księgi, dostępnych albo wartości = pusty wynik bez wyjątku', () => {
    expect(prepare(GEN, { calendar: null }).indicators).toEqual([]);
    expect(prepare(GEN, { available: null }).indicators).toEqual([]);
    expect(prepare(GEN, { readValues: () => null }).indicators).toEqual([]);
    expect(buildLibraryFacts(base, prepare(GEN, { calendar: null }))).toBeNull();
  });
});

describe('W29-D09 zasada „nie niszowe” i jednostki', () => {
  const lib = prepare();

  it('świeża, nieniszowa zmienna wchodzi jako b<varId> z nazwą, jednostką i grupą z available.json', () => {
    expect(lib.indicators.map((i) => i.id)).toEqual(['b9001']);
    expect(lib.indicators[0]).toMatchObject({ unit: 'na 1000', group: 'Ludność', minLevel: 'gmi' });
    expect(lib.fresh).toEqual({ b9001: 2025 });
  });

  it('zmienna niszowa (za mało gmin) i nieświeża nie wchodzą', () => {
    expect(lib.indicators.map((i) => i.id)).not.toContain('b9002');
    expect(lib.indicators.map((i) => i.id)).not.toContain('b9003');
  });

  it('jednostka bez poprawnego zdania („km”, „szt.”) wypada i trafia na listę do PR', () => {
    expect(lib.droppedUnits).toEqual([{ id: 'b9004', unit: 'km' }]);
    expect(['szt.', 'km', 'ha'].some(isSupportedUnit)).toBe(false);
    expect(['%', 'zł', 'na 1000', 'na 10 tys.', 'na 1000 ludności'].every(isSupportedUnit)).toBe(true);
  });
});

describe('W29-D09 fakty biblioteki w Odkryciach', () => {
  const lib = prepare();
  const libBuild = buildLibraryFacts(base, lib)!;
  const libFacts = [...libBuild.byUnit.values()].flatMap((u) => u.selected);
  const main = buildFacts(base);
  const start = buildStart(main, GEN, undefined, libBuild);

  it('są tylko krajowe (1. miejsce bez remisu, rekord serii), z najnowszego roku i z id b<varId>', () => {
    expect(libFacts.length).toBeGreaterThan(0);
    for (const f of libFacts) {
      expect(f.indicatorId).toBe('b9001');
      expect(f.year).toBe(2025);
      expect(['F1', 'F5']).toContain(f.type);
    }
    for (const f of libFacts.filter((x) => x.type === 'F1')) expect(f.compare).toMatchObject({ kind: 'rank', rank: 1, tie: false });
  });

  it('świeża nieniszowa zmienna z premierą daje fakt w Odkryciu dnia (facts-start.json), niszowa i nieświeża nie', () => {
    const ids = start.daily.map((d) => decodeFact(d.u, d.f).indicatorId);
    const slots = Math.min(cfg.fresh!.dailySlots, new Set(libFacts.filter((f) => f.type === 'F1').map((f) => f.teryt)).size);
    expect(slots).toBeGreaterThan(0);
    for (let k = 0; k < slots; k++) {
      const entry = start.daily[dailyIndex(new Date(Date.parse(GEN) + k * DAY), start.daily.length)];
      expect(decodeFact(entry.u, entry.f).indicatorId).toBe('b9001');
    }
    expect(ids).not.toContain('b9002');
    expect(ids).not.toContain('b9003');
    expect(ids).not.toContain('b9004');
    expect(new Set(start.daily.map((d) => d.u)).size).toBe(start.daily.length);
  });

  it('link karty ma i=b<varId>, a wpis niesie nazwę i jednostkę zmiennej', () => {
    const entry = start.daily.find((d) => decodeFact(d.u, d.f).indicatorId === 'b9001')!;
    const fact = decodeFact(entry.u, entry.f);
    expect(mapHref({ indicatorId: fact.indicatorId, year: fact.year, teryt: fact.teryt })).toMatch(/^\/mapa\?i=b9001&y=2025&u=\d+$/);
    expect(entry.i).toEqual([lib.indicators[0].name, 'na 1000']);
  });

  it('zestawienie świeżej zmiennej jest pierwsze, bez małych gmin; facts-start.json ≤ 4 KB', () => {
    expect(start.lists[0]).toMatchObject({ indicatorId: 'b9001', level: 'gmi', dir: 1 });
    expect(start.lists[0].i).toEqual([lib.indicators[0].name, 'na 1000']);
    const pop = base.values.population.values;
    for (const [teryt] of start.lists[0].top) {
      const last = [...pop[teryt]].reverse().find((v) => v != null) as number;
      expect(last).toBeGreaterThanOrEqual(cfg.thresholds.smallPopulation);
    }
    expect(start.lists).toHaveLength(buildStart(main, GEN).lists.length);
    expect(JSON.stringify(start).length).toBeLessThanOrEqual(4096);
  });

  it('pliki województw są identyczne z wynikiem bez zmiennych biblioteki', () => {
    const without = JSON.stringify(buildShards(buildFacts(base), GEN));
    expect(JSON.stringify(buildShards(main, GEN))).toBe(without);
    expect(without).not.toContain('b9001');
  });

  it('bez zmiennych biblioteki (brak gałęzi lub księgi) wynik jest identyczny jak dziś', () => {
    const plain = JSON.stringify(buildStart(main, GEN));
    expect(JSON.stringify(buildStart(main, GEN, undefined, null))).toBe(plain);
    expect(JSON.stringify(buildStart(main, GEN, undefined, buildLibraryFacts(base, prepare(GEN, { calendar: null }))))).toBe(plain);
    expect(plain).not.toContain('"i":[');
  });
});

describe('W29-D09 podłączenie robota', () => {
  it('robot czyta księgę z gałęzi data/library przez git show, a workflow ją pobiera', () => {
    expect(readFileSync('scripts/data/build-facts.mjs', 'utf8')).toContain("'show'");
    expect(readFileSync('.github/workflows/fetch-data.yml', 'utf8')).toContain('git fetch --depth 1 origin data/library');
  });
});
