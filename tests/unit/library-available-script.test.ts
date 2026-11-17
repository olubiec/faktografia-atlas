import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildAvailable } from '../../scripts/data/library-available.mjs';

const fixtures = path.resolve('tests/fixtures/library');
const script = path.resolve('scripts/data/library-available.mjs');
let dir: string;
let index: any;

beforeAll(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), 'lib-avail-'));
  await mkdir(path.join(dir, 'values'));
  await cp(path.join(fixtures, 'index.json'), path.join(dir, 'index.json'));
  await cp(path.join(fixtures, 'values-sample.json'), path.join(dir, 'values', '101.json'));
  // Zmienna 202: powiaty i gminy z danymi; 203: puste dane (ma być pominięta).
  await writeFile(path.join(dir, 'values', '202.json'), JSON.stringify({
    v: '202',
    l5: { y: [2023, 2022], d: { '030210101000': [1, 2] } },
    l6: { y: [2024, 2022], d: { '0302101011': [3, 4] } },
  }));
  await writeFile(path.join(dir, 'values', '203.json'), JSON.stringify({ v: '203', l5: { y: [2022], d: {} } }));
  index = JSON.parse(await readFile(path.join(fixtures, 'index.json'), 'utf8'));
});
afterAll(() => rm(dir, { recursive: true, force: true }));

describe('Spis pobranych wskaźników (library-available)', () => {
  it('zawiera tylko zmienne z plikiem wartości i danymi (puste d pominięte)', async () => {
    execFileSync('node', [script, dir]);
    const out = JSON.parse(await readFile(path.join(dir, 'available.json'), 'utf8'));
    expect(out.variables.map((v: any) => v.id)).toEqual(['101', '202']);
  });

  it('poziomy lv i lata y zgodne z plikiem wartości', async () => {
    const out = JSON.parse(await readFile(path.join(dir, 'available.json'), 'utf8'));
    expect(out.variables[0]).toMatchObject({ id: '101', lv: ['pow'], y: [2022, 2023, 2024] });
    expect(out.variables[1]).toMatchObject({ lv: ['pow', 'gmi'], y: [2022, 2023, 2024] });
  });

  it('u to tekst jednostki, a c to ścieżka z nazw działów', async () => {
    const out = JSON.parse(await readFile(path.join(dir, 'available.json'), 'utf8'));
    expect(out.variables[0]).toMatchObject({ u: 'osoba', s: '11', c: 'Ludność > Struktura ludności' });
  });

  it('mieści się w 50 KB dla 101 wskaźników', () => {
    const values: Record<string, unknown> = {};
    const variables = Array.from({ length: 101 }, (_, i) => {
      values[String(1000 + i)] = { l5: { y: [2020, 2021, 2022, 2023, 2024], d: { a: [1] } } };
      return { id: String(1000 + i), s: '11', n: `Wskaźnik testowy numer ${i} o dość długiej nazwie`, l: 5, u: 0, has: 1 };
    });
    const out = buildAvailable({ ...index, variables }, values);
    expect(out.variables).toHaveLength(101);
    expect(JSON.stringify(out).length).toBeLessThan(50_000);
  });

  it('plik jest zapisany bez wcięć', async () => {
    const text = await readFile(path.join(dir, 'available.json'), 'utf8');
    expect(/\n\s/.test(text)).toBe(false);
  });

  it('brak katalogu lub index.json → błąd i brak pliku', async () => {
    const missing = path.join(dir, 'nie-ma');
    const res = spawnSync('node', [script, missing], { encoding: 'utf8' });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toMatch(/index\.json/);
    expect(existsSync(path.join(missing, 'available.json'))).toBe(false);
  });

  it('spełnia schemat: version 1, id, n, lv ≥ 1', async () => {
    const out = JSON.parse(await readFile(path.join(dir, 'available.json'), 'utf8'));
    expect(out.version).toBe(1);
    for (const v of out.variables) {
      expect(typeof v.id).toBe('string');
      expect(v.n.length).toBeGreaterThan(0);
      expect(v.lv.length).toBeGreaterThanOrEqual(1);
    }
  });
});
