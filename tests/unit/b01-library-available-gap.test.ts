import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildAvailable, countGap, formatGapLine } from '../../scripts/data/library-available.mjs';

const fixtures = path.resolve(__dirname, '../fixtures/library');
const script = path.resolve(__dirname, '../../scripts/data/library-available.mjs');
const workflow = path.resolve(__dirname, '../../.github/workflows/fetch-library.yml');

type ValuesFile = { v: number | string; [k: string]: unknown };
async function fixture(name: string) {
  return JSON.parse(await readFile(path.join(fixtures, name), 'utf8'));
}

// Nagrane z gałęzi data/library (21.11.2026): 1290 i 1690 mają dane, 1291 i 1292 to puste pliki (bez danych na l5/l6).
// Te „puste” to nie luka w spisie: GUS nie zwrócił dla nich danych na poziomach, które pobieramy.
describe('B01: spis wyboru a pliki pobrane (przypadek 375)', () => {
  it('wszystkie pliki z jakąkolwiek daną trafiają do spisu: listed === fetched, missing puste', async () => {
    const index = await fixture('b01-gap-index.json');
    const files: ValuesFile[] = await fixture('b01-gap-values.json');
    const gap = countGap(index, files);
    expect(gap.fetched).toBe(2);
    expect(gap.listed).toBe(gap.fetched);
    expect(gap.missing).toEqual([]);
  });

  it('puste pliki są policzone osobno i nie wchodzą do spisu', async () => {
    const index = await fixture('b01-gap-index.json');
    const files: ValuesFile[] = await fixture('b01-gap-values.json');
    const gap = countGap(index, files);
    expect(gap.empty).toEqual(['1291', '1292']);
    const out = buildAvailable(index, files);
    expect(out.variables.map((v: { id: string }) => v.id)).toEqual(['1290', '1690']);
  });

  it('lv i y zgodne z danymi: 1290 tylko pow, 1690 tylko gmi', async () => {
    const index = await fixture('b01-gap-index.json');
    const files: ValuesFile[] = await fixture('b01-gap-values.json');
    const out = buildAvailable(index, files);
    const by = Object.fromEntries(out.variables.map((v: { id: string }) => [v.id, v]));
    expect(by['1290'].lv).toHaveLength(1);
    expect(by['1690'].lv).toHaveLength(1);
    for (const v of Object.values(by) as { y: number[] }[]) {
      expect(v.y.length).toBeGreaterThan(0);
      expect([...v.y].sort((a, b) => a - b)).toEqual(v.y);
    }
  });

  it('wskaźnik z danymi tylko na poziomie województw trafia do spisu z lv ["woj"] i y', async () => {
    const index = await fixture('b01-gap-index.json');
    const file = { v: 1291, l3: { y: [2023, 2022], d: { '02': [1, 2] } }, l5: { y: [], d: {} }, l6: { y: [], d: {} } };
    const out = buildAvailable(index, [file]);
    expect(out.variables).toHaveLength(1);
    expect(out.variables[0].id).toBe('1291');
    expect(out.variables[0].lv).toEqual(['woj']);
    expect(out.variables[0].y).toEqual([2022, 2023]);
    const gap = countGap(index, [file]);
    expect(gap).toMatchObject({ fetched: 1, listed: 1, missing: [] });
  });

  it('countGap zwraca id plików z danymi, których nie ma w spisie (brak w indeksie)', async () => {
    const index = await fixture('b01-gap-index.json');
    const files: ValuesFile[] = [
      ...(await fixture('b01-gap-values.json')),
      { v: 999999, l5: { y: [2024], d: { a: [1] } } },
    ];
    const gap = countGap(index, files);
    expect(gap.fetched).toBe(3);
    expect(gap.listed).toBe(2);
    expect(gap.missing).toEqual(['999999']);
  });

  it('formatGapLine daje linię do podsumowania w Actions', () => {
    expect(formatGapLine({ fetched: 2061, listed: 2061, empty: new Array(375).fill('x'), missing: [] })).toBe(
      'Pobrane: 2061 · w spisie wyboru: 2061 · puste (bez danych): 375 · brakuje: 0',
    );
  });
});

describe('B01: format wyjścia bez zmian', () => {
  it('version 1, klucze wpisu id,n,u,s,c,lv,y, sortowanie po id, JSON bez wcięć', async () => {
    const index = await fixture('b01-gap-index.json');
    const files: ValuesFile[] = await fixture('b01-gap-values.json');
    const out = buildAvailable(index, [...files].reverse(), '2026-11-21T00:00:00Z');
    expect(out.version).toBe(1);
    expect(Object.keys(out.variables[0])).toEqual(['id', 'n', 'u', 's', 'c', 'lv', 'y']);
    expect(out.variables.map((v: { id: string }) => Number(v.id))).toEqual([1290, 1690]);
    expect(/\n\s/.test(JSON.stringify(out))).toBe(false);
  });
});

describe('B01: CLI wypisuje linię kontrolną', () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), 'lib-b01-'));
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('na stdout jest „Pobrane … w spisie wyboru … puste … brakuje: 0”', async () => {
    await mkdir(path.join(dir, 'values'));
    await writeFile(path.join(dir, 'index.json'), await readFile(path.join(fixtures, 'b01-gap-index.json')));
    const files: ValuesFile[] = await fixture('b01-gap-values.json');
    for (const f of files) await writeFile(path.join(dir, 'values', `${f.v}.json`), JSON.stringify(f));
    const res = spawnSync('node', [script, dir], { encoding: 'utf8' });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('Pobrane: 2 · w spisie wyboru: 2 · puste (bez danych): 2 · brakuje: 0');
  });
});

describe('B01: workflow Fetch library bez zmian harmonogramu i budżetu', () => {
  it('cron dwa razy dziennie, LIBRARY_BUDGET 3000, linia kontrolna w Podsumowaniu', async () => {
    const text = await readFile(workflow, 'utf8');
    const crons = text.match(/- cron: '([^']+)'/g) ?? [];
    expect(crons).toHaveLength(1);
    expect(text).toContain("- cron: '40 4,16 * * *'");
    expect(text).toContain("LIBRARY_BUDGET: ${{ github.event.inputs.budget || '3000' }}");
    expect(text).toContain('library-gap.txt');
  });
});
