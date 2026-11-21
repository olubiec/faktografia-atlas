import { execFileSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildOutline } from '../../scripts/geo/start-outline.mjs';
import { buildStart } from '../../scripts/data/start.mjs';

// B04: dwa małe pliki dla strony startowej (obrys 16 województw i wartości czterech wskaźników).
const root = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
const fixture = JSON.parse(read('tests/fixtures/start/values-sample.json'));
const IDS = ['population', 'unemployment-rate', 'avg-wage', 'density'];
const GENERATED = '2026-01-01T00:00:00.000Z';

describe('B04 budżety rozmiaru', () => {
  it('start-outline.json ma ≤ 25 KB surowo i ≤ 10 KB po gzip', () => {
    const raw = fs.readFileSync(path.join(root, 'public/geo/start-outline.json'));
    expect(raw.length).toBeLessThanOrEqual(25 * 1024);
    expect(gzipSync(raw).length).toBeLessThanOrEqual(10 * 1024);
  });

  it('start.json ma ≤ 5 KB', () => {
    expect(fs.statSync(path.join(root, 'public/data/start.json')).size).toBeLessThanOrEqual(5 * 1024);
  });
});

describe('B04 obrys', () => {
  const outline = JSON.parse(read('public/geo/start-outline.json'));

  it('ma 16 niepustych ścieżek z kodami TERYT jako tekst (2 cyfry) i dodatni viewBox', () => {
    expect(outline.version).toBe(1);
    expect(outline.paths).toHaveLength(16);
    for (const p of outline.paths) {
      expect(typeof p.teryt).toBe('string');
      expect(p.teryt).toMatch(/^\d{2}$/);
      expect(p.d).toMatch(/^M[\d.\- LMZ]+Z$/);
      expect(p.d.length).toBeGreaterThan(20);
    }
    expect(new Set(outline.paths.map((p: { teryt: string }) => p.teryt)).size).toBe(16);
    expect(outline.viewBox).toHaveLength(2);
    expect(outline.viewBox[0]).toBeGreaterThan(0);
    expect(outline.viewBox[1]).toBeGreaterThan(0);
  });

  it('plik jest bez wcięć (jedna linia)', () => {
    expect(read('public/geo/start-outline.json').trim().split('\n')).toHaveLength(1);
  });

  it('plik w repo jest zgodny z wynikiem skryptu na admin.topo.json', () => {
    const topo = JSON.parse(read('public/geo/admin.topo.json'));
    expect(JSON.stringify(buildOutline(topo))).toBe(read('public/geo/start-outline.json').trim());
  });
});

describe('B04 start.json na fixture', () => {
  const start = buildStart(fixture.indicators, fixture.values, GENERATED);

  it('ma 4 wskaźniki, pierwszy to population, po 16 wartości bez NaN', () => {
    expect(start.version).toBe(1);
    expect(start.generatedAt).toBe(GENERATED);
    expect(start.indicators.map((i: { id: string }) => i.id)).toEqual(IDS);
    for (const ind of start.indicators) {
      const vals = Object.values(ind.values) as number[];
      expect(vals).toHaveLength(16);
      for (const k of Object.keys(ind.values)) expect(k).toMatch(/^\d{2}$/);
      for (const v of vals) expect(Number.isFinite(v)).toBe(true);
      expect(typeof ind.name).toBe('string');
      expect(typeof ind.unit).toBe('string');
    }
  });

  it('rok = najnowszy rok z fixture, a wartości równe wartościom z values', () => {
    for (const ind of start.indicators) {
      const src = fixture.values[ind.id];
      expect(ind.year).toBe(src.years[src.years.length - 1]);
      for (const [t, v] of Object.entries(ind.values)) {
        expect(v).toBe(src.values[t][src.years.length - 1]);
      }
    }
  });

  it('gdy najnowszy rok nie ma kompletu województw, bierze najnowszy kompletny', () => {
    const copy = structuredClone(fixture);
    const pop = copy.values.population;
    pop.values['02'][pop.years.length - 1] = null;
    const s = buildStart(copy.indicators, copy.values, GENERATED);
    expect(s.indicators[0].year).toBe(pop.years[pop.years.length - 2]);
    expect(s.indicators[0].values['02']).toBe(pop.values['02'][pop.years.length - 2]);
  });

  it('rzuca błąd, gdy brakuje wskaźnika', () => {
    const copy = structuredClone(fixture);
    delete copy.values.density;
    expect(() => buildStart(copy.indicators, copy.values, GENERATED)).toThrow(/density/);
  });

  it('plik w repo zgadza się z public/data/values', () => {
    const file = JSON.parse(read('public/data/start.json'));
    expect(file.indicators.map((i: { id: string }) => i.id)).toEqual(IDS);
    for (const ind of file.indicators) {
      const src = JSON.parse(read(`public/data/values/${ind.id}.json`));
      const idx = src.years.indexOf(ind.year);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(Object.keys(ind.values)).toHaveLength(16);
      for (const [t, v] of Object.entries(ind.values)) expect(v).toBe(src.values[t][idx]);
    }
  });
});

describe('B04 skrypty', () => {
  it('są deterministyczne i nie czytają sieci', { timeout: 30000 }, () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'b04-'));
    try {
      for (const [script, name] of [
        ['scripts/geo/start-outline.mjs', 'o.json'],
        ['scripts/data/start.mjs', 's.json'],
      ]) {
        const outs = ['1', '2'].map((n) => {
          const out = path.join(tmp, `${n}-${name}`);
          execFileSync('node', [script, '--out', out], { cwd: root });
          return fs.readFileSync(out, 'utf8');
        });
        expect(outs[0]).toBe(outs[1]);
        expect(outs[0].length).toBeGreaterThan(100);
      }
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
    for (const f of ['scripts/geo/start-outline.mjs', 'scripts/data/start.mjs']) {
      expect(read(f)).not.toMatch(/\bfetch\(|https?:\/\/|node:https?|from 'https?'/);
    }
  });
});

describe('B04 workflow fetch-data.yml', () => {
  const yml = read('.github/workflows/fetch-data.yml');

  it('krok start.mjs występuje po kroku wartości, a cron się nie zmienił', () => {
    const iStart = yml.indexOf('node scripts/data/start.mjs');
    const iValues = yml.indexOf('node scripts/data/fetch-values.mjs');
    expect(iValues).toBeGreaterThan(-1);
    expect(iStart).toBeGreaterThan(iValues);
    expect(yml).toContain("cron: '10 1 * * *'");
    expect(yml.match(/cron:/g)).toHaveLength(1);
  });

  it('plik start.json trafia do commitu danych', () => {
    expect(yml).toMatch(/git add [^\n]*public\/data\/start\.json/);
  });
});
