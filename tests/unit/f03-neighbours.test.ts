import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import config from '../../config/facts.json';
import fixture from '../fixtures/facts/opolskie.json';
import topology from '../fixtures/facts/topology-arcs.json';
import { buildFacts, buildShards } from '../../src/core/facts/build';
import { decodeFact, decodeTwin, encodeFact } from '../../src/core/facts/codec';
import { adjacency, neighbourRings, ringsFromTopology, type TopologyLike } from '../../src/core/facts/neighbours';
import { sentenceFor } from '../../src/core/facts/report';
import { factTemplate } from '../../src/core/facts/sentences';
import type { FactIndicator, FactsConfig, FactsInput, FactUnit, IndicatorValues } from '../../src/core/facts/types';

// Wycinki prawdziwych danych: opolskie (fakty, opis w $opis) i indeksy łuków admin.topo.json (opis w $opis).
const topo = topology as unknown as TopologyLike;
const cfg = config as unknown as FactsConfig;
const base: FactsInput = {
  indicators: fixture.indicators as FactIndicator[],
  units: fixture.units as FactUnit[],
  values: fixture.values as unknown as Record<string, IndicatorValues>,
  config: cfg,
};
const rings = ringsFromTopology(topo, 4);
const build = buildFacts({ ...base, neighbours: rings });

const WALCZ_MIASTO = '3217011';
const WALCZ_GMINA = '3217052';

describe('F03 sąsiedztwo z topologii', () => {
  const gmi = adjacency(topo, 'gmi');

  it('obwarzanek: miasto Wałcz ma 1 sąsiada i dostaje sąsiadów drugiego rzędu', () => {
    expect([...gmi.get(WALCZ_MIASTO)!]).toEqual([WALCZ_GMINA]);
    const ring = rings[WALCZ_MIASTO];
    expect(ring.extended).toBe(true);
    expect(ring.ids).toContain(WALCZ_GMINA);
    // Gminy wokół obwarzanka = sąsiedzi gminy wiejskiej Wałcz (bez samego miasta).
    const second = [...gmi.get(WALCZ_GMINA)!].filter((t) => t !== WALCZ_MIASTO);
    expect(second.length).toBeGreaterThanOrEqual(4);
    for (const t of second) expect(ring.ids).toContain(t);
    expect(ring.ids).not.toContain(WALCZ_MIASTO);
    expect(ring.ids.length).toBeGreaterThanOrEqual(4);
  });

  it('sąsiedztwo jest symetryczne i bez samej jednostki (gminy i powiaty)', () => {
    for (const level of ['gmi', 'pow'] as const) {
      const adj = adjacency(topo, level);
      expect(adj.size).toBeGreaterThan(10);
      for (const [a, list] of adj) {
        expect(list.has(a)).toBe(false);
        for (const b of list) expect(adj.get(b)!.has(a), `${a} ↔ ${b}`).toBe(true);
      }
    }
  });

  it('jednostka z ≥ 4 sąsiadami ma tylko bezpośrednich (bez poszerzania)', () => {
    const opole = rings['1661011'];
    expect(opole.extended).toBe(false);
    expect(opole.ids.sort()).toEqual([...gmi.get('1661011')!].sort());
  });

  it('pierścień poszerza się tylko poniżej progu', () => {
    const adj = new Map([
      ['a', new Set(['b'])],
      ['b', new Set(['a', 'c', 'd'])],
      ['c', new Set(['b'])],
      ['d', new Set(['b'])],
    ]);
    const r = neighbourRings(adj, 2);
    expect(r.a).toEqual({ ids: ['b', 'c', 'd'], extended: true });
    expect(r.b).toEqual({ ids: ['a', 'c', 'd'], extended: false });
  });
});

describe('F03 fakt F3 „na tle sąsiadów”', () => {
  const f3 = [...build.byUnit.values()].flatMap((u) => u.selected).filter((f) => f.type === 'F3');

  it('wykryte fakty F3 leżą poza zakresem wszystkich sąsiadów (≥ 4)', () => {
    expect(f3.length).toBeGreaterThan(10);
    for (const f of f3) {
      if (f.compare.kind !== 'neighbours') throw new Error('zły rodzaj porównania');
      const idx = build.ctx.series(f.teryt, f.indicatorId)!.years.indexOf(f.year);
      const around = rings[f.teryt].ids
        .map((t) => build.ctx.series(t, f.indicatorId)?.values[idx])
        .filter((v): v is number => v != null);
      expect(around.length).toBe(f.compare.count);
      expect(around.length).toBeGreaterThanOrEqual(4);
      const outside = f.compare.dir === 1 ? f.value > Math.max(...around) : f.value < Math.min(...around);
      expect(outside).toBe(true);
    }
  });

  it('zdanie F3 ma liczbę, rok, liczbę sąsiadów i zakres; bez ocen', () => {
    for (const f of f3) {
      const s = sentenceFor(build.ctx, f)!;
      expect(s).toMatch(/\b20\d\d\b/);
      expect(s).toMatch(/(więcej|mniej) niż w każd(ej|ym) z \d+ (sąsiednich|okolicznych) (gmin|powiatów|województw) \(u nich od .+ do .+\)\.$/);
      expect(s.toLowerCase()).not.toMatch(/najlepsz|najgorsz|!/);
      expect(factTemplate(f)).toMatch(/^F3:(więcej|mniej)$/);
    }
  });

  it('F3 podnosi udział jednostek z 3 faktami bez typowości (F9)', () => {
    const strong = (b: typeof build) => [...b.byUnit.values()].filter((u) => u.selected.filter((f) => f.type !== 'F9').length >= 3).length;
    expect(strong(build)).toBeGreaterThan(strong(buildFacts(base)));
  });

  it('zapis zwarty F3 odtwarza fakt bez strat', () => {
    for (const f of f3) expect(decodeFact(f.teryt, encodeFact(f))).toEqual(f);
  });

  it('plik województwa ma pierścień sąsiadów (near) z TERYT-ami', () => {
    const shard = buildShards(build, '2026-11-17T00:00:00.000Z')['16'];
    expect(shard.near?.['1661011']).toEqual(rings['1661011'].ids);
  });
});

describe('F03 bliźniak F8', () => {
  // Drugie „województwo” 99 = kopia opolskiego: bliźniakiem każdej jednostki powinna być jej kopia.
  const clone = (t: string) => `99${t.slice(2)}`;
  const units = [...base.units, ...base.units.map((u) => ({ ...u, teryt: clone(u.teryt), parent: u.parent ? clone(u.parent) : null }))];
  const values = Object.fromEntries(
    Object.entries(base.values).map(([id, v]) => [
      id,
      { ...v, values: { ...v.values, ...Object.fromEntries(Object.entries(v.values).map(([t, s]) => [clone(t), s])) } },
    ]),
  );
  const twins = buildFacts({ ...base, units, values }).twins;

  it('bliźniak jest z innego województwa i różny od jednostki', () => {
    expect(twins.size).toBeGreaterThan(100);
    for (const [teryt, t] of twins) {
      expect(t.twin).not.toBe(teryt);
      expect(t.twin.slice(0, 2)).not.toBe(teryt.slice(0, 2));
      expect(t.twin.length).toBe(teryt.length);
    }
    expect(twins.get('1601011')?.twin).toBe('9901011');
    expect(twins.get('1601011')?.distance).toBe(0);
  });

  it('jedno województwo = brak bliźniaków (nie ma z kim porównać)', () => {
    expect(build.twins.size).toBe(0);
  });

  const root = path.resolve(__dirname, '../..');
  const readPublic = (rel: string) => JSON.parse(fs.readFileSync(path.join(root, 'public/data', rel), 'utf8'));

  it('pliki public/data/facts: bliźniak i sąsiedzi istnieją, ten sam poziom, bliźniak z innego województwa', () => {
    const all = readPublic('units.json') as FactUnit[];
    const level = new Map(all.map((u) => [u.teryt, u.level]));
    let withTwin = 0;
    for (const woj of all.filter((u) => u.level === 'woj').map((u) => u.teryt)) {
      const shard = readPublic(`facts/${woj}.json`);
      for (const [teryt, raw] of Object.entries(shard.twins as Record<string, (string | number)[]>)) {
        const t = decodeTwin(teryt, raw);
        expect(t.twin).not.toBe(teryt);
        expect(t.twin.slice(0, 2)).not.toBe(woj);
        expect(level.get(t.twin)).toBe(level.get(teryt));
        withTwin++;
      }
      for (const [teryt, ids] of Object.entries(shard.near as Record<string, string[]>)) {
        expect(ids).not.toContain(teryt);
        for (const n of ids) expect(level.get(n)).toBe(level.get(teryt));
      }
    }
    expect(withTwin).toBeGreaterThan(2700);
  });
});
