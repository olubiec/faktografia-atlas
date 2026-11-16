import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { buildSearchIndex, search } from '../../src/core/search';
import { getTierRank, getUnitLabel } from '../../src/core/search/unit-meta';
import type { Unit } from '../../src/core/units/types';

const root = path.resolve(__dirname, '../..');
const units: Unit[] = JSON.parse(fs.readFileSync(path.join(root, 'public/data/units.json'), 'utf-8'));
const unitsMap = new Map(units.map((u) => [u.teryt, u]));
const lines = (f: string) => fs.readFileSync(path.join(root, f), 'utf-8').split('\n').length - 1;
const get = (teryt: string) => unitsMap.get(teryt) as Unit;
const rows = (q: string) =>
  search(buildSearchIndex(units), q)
    .slice(0, 5)
    .map((r) => [r.teryt, r.name, r.label, r.context]);

describe('podział src/core/search/index.ts', () => {
  it('oba pliki mają najwyżej 220 linii', () => {
    expect(lines('src/core/search/index.ts')).toBeLessThanOrEqual(220);
    expect(lines('src/core/search/unit-meta.ts')).toBeLessThanOrEqual(220);
  });

  it('index.ts eksportuje te same nazwy co przed podziałem', async () => {
    const keys = Object.keys(await import('../../src/core/search'));
    expect(keys).toEqual(expect.arrayContaining(['buildSearchIndex', 'search', 'normalize']));
  });

  it('unit-meta.ts nie importuje z index.ts (brak cyklu)', () => {
    const src = fs.readFileSync(path.join(root, 'src/core/search/unit-meta.ts'), 'utf-8');
    expect(src).not.toMatch(/from '\.\/index'|from '\.\/'|from '\.'/);
  });

  // Poniższe trzy testy to zapis zachowania zmierzonego przed podziałem.
  it('zapytanie bez polskich znaków: krakow', () => {
    expect(rows('krakow')).toEqual([
      ['1261011', 'Kraków', 'gmina miejska', 'powiat Kraków, małopolskie'],
      ['1261', 'powiat Kraków', 'miasto na prawach powiatu', 'małopolskie'],
      ['1206', 'powiat krakowski', 'powiat', 'małopolskie'],
      ['2604162', 'Raków', 'gmina wiejska', 'powiat kielecki, świętokrzyskie'],
    ]);
  });

  it('nazwa z łącznikiem: kozle', () => {
    expect(rows('kozle')).toEqual([
      ['1603011', 'Kędzierzyn-Koźle', 'gmina miejska', 'powiat kędzierzyńsko-kozielski, opolskie'],
    ]);
  });

  it('prefiks 3 liter (w tym gmina miejsko-wiejska): war', () => {
    expect(rows('war')).toEqual([
      ['28', 'warmińsko-mazurskie', 'województwo', ''],
      ['1465011', 'Warszawa', 'gmina miejska', 'powiat Warszawa, mazowieckie'],
      ['1465', 'powiat Warszawa', 'miasto na prawach powiatu', 'mazowieckie'],
      ['1432', 'powiat warszawski zachodni', 'powiat', 'mazowieckie'],
      ['1406113', 'Warka', 'gmina miejsko-wiejska', 'powiat grójecki, mazowieckie'],
    ]);
  });

  it('getUnitLabel i getTierRank: województwo, powiat, gmina', () => {
    expect(getUnitLabel(get('28'))).toBe('województwo');
    expect(getTierRank(get('28'), unitsMap)).toBe(1);
    expect(getUnitLabel(get('1206'))).toBe('powiat');
    expect(getTierRank(get('1206'), unitsMap)).toBe(3);
    expect(getUnitLabel(get('1406113'))).toBe('gmina miejsko-wiejska');
    expect(getTierRank(get('1406113'), unitsMap)).toBe(4);
  });
});
