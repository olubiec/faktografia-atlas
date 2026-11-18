import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile, access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildAvailable } from '../../scripts/data/library-available.mjs';

const fixtures = path.resolve(__dirname, '../fixtures/library');
const script = path.resolve(__dirname, '../../scripts/data/library-available.mjs');

async function fixture(name: string) {
  return JSON.parse(await readFile(path.join(fixtures, name), 'utf8'));
}
// Pliki wartości pozostałych zmiennych z index.json (nagrany jest tylko 101) – w tej samej postaci co robot.
const years = [2022, 2023, 2024];
const extra = [
  { v: '102', l6: { y: years, d: { '0302101010': [1, 2, 3] } } },
  { v: '201', l5: { y: years, d: { '030210101000': [1, 2, 3] } } },
  { v: '202', l5: { y: years, d: { a: [1, 2, 3] } }, l6: { y: [2023], d: { b: [4] } } },
  { v: '301', l5: { y: [2022, 2023], d: { a: [1, 2] } } },
];

describe('Spis pobranych wskaźników: buildAvailable', () => {
  it('zawiera wyłącznie zmienne z plikiem wartości, liczba = liczba plików', async () => {
    const index = await fixture('index.json');
    const sample = await fixture('values-sample.json');
    const out = buildAvailable(index, [sample, ...extra], '2026-11-17T00:00:00Z');
    expect(out.variables).toHaveLength(5);
    expect(out.variables.map((v: { id: string }) => v.id)).toEqual(['101', '102', '201', '202', '301']);
    expect(buildAvailable(index, [sample]).variables).toHaveLength(1);
  });

  it('wynik zgodny z fixture available.json (format docelowy)', async () => {
    const index = await fixture('index.json');
    const sample = await fixture('values-sample.json');
    const out = buildAvailable(index, [sample, ...extra], '2026-11-17T00:00:00Z');
    expect(out).toEqual(await fixture('available.json'));
  });

  it('lv i y zgodne z zawartością pliku (101: pow, 2022–2024)', async () => {
    const index = await fixture('index.json');
    const [v] = buildAvailable(index, [await fixture('values-sample.json')]).variables;
    expect(v.lv).toEqual(['pow']);
    expect(v.y).toEqual([2022, 2023, 2024]);
  });

  it('lv w kolejności woj/pow/gmi, y to suma lat bez duplikatów, rosnąco', async () => {
    const index = await fixture('index.json');
    const file = {
      v: '202',
      l6: { y: [2024, 2022], d: { b: [1, 2] } },
      l3: { y: [2023, 2022], d: { c: [1, 2] } },
      l5: { y: ['2023'], d: { a: [1] } },
    };
    const [v] = buildAvailable(index, [file]).variables;
    expect(v.lv).toEqual(['woj', 'pow', 'gmi']);
    expect(v.y).toEqual([2022, 2023, 2024]);
  });

  it('u to tekst jednostki, c to ścieżka z nazw, s to dział', async () => {
    const index = await fixture('index.json');
    const [v] = buildAvailable(index, [await fixture('values-sample.json')]).variables;
    expect(v.u).toBe('osoba');
    expect(v.c).toBe('Ludność > Struktura ludności');
    expect(v.s).toBe('11');
    expect(v.n).toBe('Liczba ludności ogółem');
  });

  it('pomija zmienną bez danych (puste d) i nieznaną w indeksie', async () => {
    const index = await fixture('index.json');
    const empty = { v: '201', l5: { y: years, d: {} } };
    const unknown = { v: '999999', l5: { y: years, d: { a: [1, 2, 3] } } };
    const half = { v: '202', l5: { y: years, d: {} }, l6: { y: [2024], d: { a: [1] } } };
    const out = buildAvailable(index, [empty, unknown, half]);
    expect(out.variables.map((v: { id: string }) => v.id)).toEqual(['202']);
    expect(out.variables[0].lv).toEqual(['gmi']);
    expect(out.variables[0].y).toEqual([2024]);
  });

  it('101 syntetycznych wpisów mieści się w 50 KB, bez wcięć', () => {
    const index = {
      version: 1,
      categories: { '1': { n: 'Ludność', p: null }, '11': { n: 'Struktura ludności', p: '1' } },
      units: ['osoba'],
      variables: Array.from({ length: 101 }, (_, i) => ({
        id: String(1000 + i), s: '11', n: `Wskaźnik testowy numer ${i} – ogółem`, l: 6, u: 0, has: 1,
      })),
    };
    const files = index.variables.map((v) => ({ v: v.id, l5: { y: years, d: { a: [1, 2, 3] } }, l6: { y: years, d: { b: [1, 2, 3] } } }));
    const out = buildAvailable(index, files);
    const text = JSON.stringify(out);
    expect(out.variables).toHaveLength(101);
    expect(text.length).toBeLessThan(50_000);
    expect(/\n\s/.test(text)).toBe(false);
  });

  it('schemat: version 1, każdy wpis ma id, n, lv.length ≥ 1', async () => {
    const index = await fixture('index.json');
    const out = buildAvailable(index, [await fixture('values-sample.json'), ...extra]);
    expect(out.version).toBe(1);
    expect(typeof out.generatedAt).toBe('string');
    for (const v of out.variables) {
      expect(v.id).toBeTruthy();
      expect(v.n).toBeTruthy();
      expect(v.lv.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('Spis pobranych wskaźników: uruchomienie z CLI', () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), 'lib-avail-'));
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  const run = (target: string) => spawnSync('node', [script, target], { encoding: 'utf8' });

  it('zapisuje library/available.json bez wcięć dla katalogu z indeksem i values/', async () => {
    await mkdir(path.join(dir, 'values'));
    await writeFile(path.join(dir, 'index.json'), await readFile(path.join(fixtures, 'index.json')));
    await writeFile(path.join(dir, 'values', '101.json'), await readFile(path.join(fixtures, 'values-sample.json')));
    const res = run(dir);
    expect(res.status).toBe(0);
    const text = await readFile(path.join(dir, 'available.json'), 'utf8');
    expect(/\n\s/.test(text)).toBe(false);
    const parsed = JSON.parse(text);
    expect(parsed.variables.map((v: { id: string }) => v.id)).toEqual(['101']);
    expect(parsed.variables[0].y).toEqual([2022, 2023, 2024]);
  });

  it('brak katalogu → błąd, kod ≠ 0, nic nie zapisuje', async () => {
    const missing = path.join(dir, 'nie-ma');
    const res = run(missing);
    expect(res.status).not.toBe(0);
    expect(res.stderr).toMatch(/index\.json|katalog/i);
    await expect(access(path.join(missing, 'available.json'))).rejects.toThrow(/ENOENT/);
  });

  it('brak index.json w katalogu → błąd, kod ≠ 0, nie zapisuje pustego spisu', async () => {
    await mkdir(path.join(dir, 'values'));
    const res = run(dir);
    expect(res.status).not.toBe(0);
    await expect(access(path.join(dir, 'available.json'))).rejects.toThrow(/ENOENT/);
  });

  it('brak argumentu → błąd użycia, kod ≠ 0', () => {
    const res = spawnSync('node', [script], { encoding: 'utf8' });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toMatch(/Użycie/);
  });
});
