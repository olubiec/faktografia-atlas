import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { classCounts } from '../../src/core/map/calibrate';
import { classify, legendBreaks } from '../../src/core/map/classes';
import { buildLegend, legendCaption } from '../../src/core/legend/legend';

type Values = { years: number[]; values: Record<string, (number | null)[]> };
const pop = JSON.parse(readFileSync('public/data/values/population.json', 'utf8')) as Values;
const at = (len: number) =>
  Object.entries(pop.values)
    .filter(([t]) => t.length === len)
    .map(([, a]) => a[pop.years.length - 1])
    .filter((v): v is number => typeof v === 'number');
const powiaty = at(4);
const gminy = at(7);

describe('UI-FIX 1: okrągłe progi legendy', () => {
  test('powiaty: ludność – progi o 1–2 cyfrach znaczących (46 000 / 60 000 / 80 000)', () => {
    const b = legendBreaks(powiaty);
    expect(b.slice(0, 3)).toEqual([46000, 60000, 80000]);
    for (const x of b) expect(Number(x.toPrecision(2))).toBe(x);
  });

  test('gminy: ludność – 4 000 / 6 000 / 9 000', () => {
    expect(legendBreaks(gminy).slice(0, 3)).toEqual([4000, 6000, 9000]);
  });

  test('okrąglenie nie opróżnia żadnej klasy', () => {
    for (const v of [powiaty, gminy]) {
      expect(classCounts(v, legendBreaks(v)).every((c) => c > 0)).toBe(true);
    }
  });

  test('wąski rozrzut nadal bierze dokładniejsze progi', () => {
    const v = Array.from({ length: 380 }, (_, i) => Math.round((104.1 + ((i * 7919) % 380) * (8.2 / 379)) * 10) / 10);
    const b = legendBreaks(v);
    expect(b).toHaveLength(4);
    const counts = classCounts(v, b);
    expect(Math.max(...counts) / v.length).toBeLessThan(0.3);
  });
});

describe('UI-FIX 2/5: ogon legendy nie jest oderwany od reszty', () => {
  for (const [name, v] of [['powiaty', powiaty], ['gminy', gminy]] as const) {
    test(`${name}: ostatni próg nie jest rekordem kraju ani o rząd wielkości dalej niż reszta`, () => {
      const b = legendBreaks(v);
      expect(b[b.length - 1] / b[b.length - 2]).toBeLessThanOrEqual(5);
      expect(b[b.length - 1]).toBeLessThan(Math.max(...v) / 4);
    });

    test(`${name}: górna klasa „powyżej X” ma sensowną liczbę jednostek, a opis jest prawdziwy`, () => {
      const b = legendBreaks(v);
      const counts = classCounts(v, b);
      const top = counts[counts.length - 1];
      expect(top).toBeGreaterThanOrEqual(Math.ceil(v.length * 0.01));
      const labels = buildLegend({ breaks: b, scheme: 'sequential' }).map((i) => i.label);
      expect(labels[labels.length - 2]).toMatch(/^powyżej /);
      const classByTeryt = Object.fromEntries(v.map((x, i) => [`u${i}`, classify(x, b)]));
      const caption = legendCaption('sequential', classByTeryt, b.length + 1);
      // Górna grupa jest znacznie mniejsza od równolicznej, więc opis mówi o niej wprost i podaje prawdziwą liczbę.
      expect(top).toBeLessThan((v.length / 5) * 0.6);
      expect(caption).toContain(`tylko ${top} z ${v.length}`);
    });
  }
});
