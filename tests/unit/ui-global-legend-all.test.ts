import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { classCounts } from '../../src/core/map/calibrate';
import { legendBreaks } from '../../src/core/map/classes';

type Values = { years: number[]; values: Record<string, (number | null)[]> };
const DIR = 'public/data/values';
const LEVELS: Record<string, number> = { woj: 2, pow: 4, gmi: 7 };
const sig = (x: number) => Number(Math.abs(x).toPrecision(3)) === Math.abs(x);

// Wszystkie wskaźniki × poziomy × lata (co 4. rok + ostatni), z których mapa buduje legendę.
const cases: { id: string; level: string; year: number; values: number[] }[] = [];
for (const f of readdirSync(DIR).filter((n) => n.endsWith('.json'))) {
  const d = JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8')) as Values;
  for (const [level, len] of Object.entries(LEVELS)) {
    d.years.forEach((year, yi) => {
      if (yi % 4 !== 0 && yi !== d.years.length - 1) return;
      const values = Object.entries(d.values)
        .filter(([t]) => t.length === len)
        .map(([, a]) => a[yi])
        .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
      if (values.length >= 15 && new Set(values).size >= 6) cases.push({ id: f, level, year, values });
    });
  }
}

describe('UI-GLOBAL 1/2: progi legendy każdego wskaźnika, poziomu i roku', () => {
  test('katalog zawiera wskaźniki do sprawdzenia', () => {
    expect(new Set(cases.map((c) => c.id)).size).toBeGreaterThan(10);
  });

  test('progi: niepuste, ściśle rosnące, bez oderwanego ogona', () => {
    const bad: string[] = [];
    for (const c of cases) {
      const b = legendBreaks(c.values);
      const tag = `${c.id} ${c.level} ${c.year}: ${b.join(', ')}`;
      if (b.length === 0) bad.push(`puste ${tag}`);
      else if (!b.every((x, i) => i === 0 || x > b[i - 1])) bad.push(`nierosnące ${tag}`);
      else if (b.length >= 3 && b[b.length - 2] > 0 && b[b.length - 1] / b[b.length - 2] > 2.5) bad.push(`ogon ${tag}`);
    }
    expect(bad).toEqual([]);
  });

  test('powiaty i gminy: progi mają najwyżej 3 cyfry znaczące (okrągłe tam, gdzie sensowne)', () => {
    const bad = cases
      .filter((c) => c.values.length >= 100)
      .map((c) => ({ c, b: legendBreaks(c.values) }))
      .filter(({ b }) => !b.every(sig))
      .map(({ c, b }) => `${c.id} ${c.level} ${c.year}: ${b.join(', ')}`);
    expect(bad).toEqual([]);
  });

  test('województwa (16 jednostek): progi bez artefaktów zmiennoprzecinkowych, najwyżej 2 miejsca po przecinku', () => {
    const bad = cases
      .map((c) => ({ c, b: legendBreaks(c.values) }))
      .filter(({ b }) => !b.every((x) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6))
      .map(({ c, b }) => `${c.id} ${c.level} ${c.year}: ${b.join(', ')}`);
    expect(bad).toEqual([]);
  });

  test('żadna klasa legendy nie jest pusta', () => {
    const bad = cases
      .map((c) => ({ c, b: legendBreaks(c.values) }))
      .filter(({ c, b }) => classCounts(c.values, b).some((n) => n === 0))
      .map(({ c, b }) => `${c.id} ${c.level} ${c.year}: ${b.join(', ')}`);
    expect(bad).toEqual([]);
  });
});
