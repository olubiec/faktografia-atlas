import { describe, expect, test } from 'vitest';
import { classColorToken, classify, computeBreaks, legendBreaks } from '../../src/core/map/classes';
import { calibrateBreaks, classCounts, MAX_SHIFT_SHARE } from '../../src/core/map/calibrate';
import { buildLegend } from '../../src/core/legend/legend';
import { checkLevel } from '../../src/core/validate/consistency';

// Deterministyczny „losowy” rozrzut, żeby test nie zależał od Math.random.
const spread = (n: number, from: number, to: number) =>
  Array.from({ length: n }, (_, i) => from + ((i * 7919) % n) * ((to - from) / (n - 1)));

describe('kalibracja progów – wąski rozrzut', () => {
  test('feminizacja 104–112: 5 klas zamiast zlanych 100/110', () => {
    const values = spread(380, 104.1, 112.3).map((v) => Math.round(v * 10) / 10);
    const b = legendBreaks(values);
    expect(b).toHaveLength(4);
    const counts = classCounts(values, b);
    expect(Math.max(...counts) / values.length).toBeLessThan(0.3);
  });

  test('16 województw, odsetek 16,8–19,9: żadnej pustej klasy', () => {
    const values = [16.8, 17.0, 17.2, 17.4, 17.6, 17.9, 18.0, 18.1, 18.3, 18.5, 18.6, 18.9, 19.1, 19.3, 19.6, 19.9];
    const b = legendBreaks(values);
    expect(b).toHaveLength(4);
    expect(classCounts(values, b).every((c) => c > 0)).toBe(true);
  });

  test('szeroki rozrzut nadal daje krótkie, okrągłe progi (2 cyfry znaczące)', () => {
    const values = Array.from({ length: 100 }, (_, i) => 40000 + i * 217.3);
    for (const x of legendBreaks(values)) expect(Number(x.toPrecision(2))).toBe(x);
  });

  test('zaokrąglenie przesuwa co najwyżej 20% jednostek do innej klasy', () => {
    const values = spread(500, 98.1, 99.9).map((v) => Math.round(v * 100) / 100);
    const raw = computeBreaks(values, 'quantile', 5);
    const nice = calibrateBreaks(raw, values);
    const before = classCounts(values, raw);
    const after = classCounts(values, nice);
    const moved = after.reduce((s, c, i) => s + Math.abs(c - before[i]), 0) / 2;
    expect(nice).toHaveLength(raw.length);
    expect(moved).toBeLessThanOrEqual(values.length * MAX_SHIFT_SHARE);
  });

  test('liczby całkowite: progi całkowite', () => {
    const values = [0, 0, 1, 1, 2, 2, 3, 4, 5, 7, 9, 12, 15, 40];
    for (const x of legendBreaks(values)) expect(Number.isInteger(x)).toBe(true);
  });
});

describe('kalibracja progów – wartości ujemne i dodatnie', () => {
  const migration = [...spread(300, -5.5, -0.1), ...spread(80, 0.1, 12)].map((v) => Math.round(v * 10) / 10);

  test('zero jest granicą klas; ujemne i dodatnie nigdy w jednej klasie', () => {
    const b = legendBreaks(migration);
    expect(b).toContain(0);
    expect(b).toHaveLength(3);
    for (const v of migration) {
      const cls = classify(v, b) as number;
      const zeroClass = b.indexOf(0) + 1;
      expect(v < 0 ? cls < zeroClass : cls >= zeroClass).toBe(true);
    }
  });

  test('kolory: ujemne ciepłe (div-1, div-2), dodatnie chłodne (div-4, div-5), bez neutralnego', () => {
    const b = legendBreaks(migration);
    const tokens = [0, 1, 2, 3].map((i) => classColorToken(i, 4, 'diverging', b));
    expect(tokens).toEqual(['--div-1', '--div-2', '--div-4', '--div-5']);
  });

  test('przewaga ujemnych (przyrost naturalny): kilka dodatnich nadal ma własny kolor', () => {
    const values = [...spread(370, -600, -1), 12, 40, 85];
    const b = legendBreaks(values);
    const n = b.length + 1;
    expect(classColorToken(classify(40, b), n, 'diverging', b)).toMatch(/--div-[45]/);
    expect(classColorToken(classify(-3, b), n, 'diverging', b)).toMatch(/--div-[12]/);
  });

  test('jedna wartość dodatnia: jedna klasa „od 0” w najmocniejszym chłodnym kolorze', () => {
    const values = [-9, -7, -5, -3, -1, 4];
    const b = legendBreaks(values);
    expect(b[b.length - 1]).toBe(0);
    expect(classColorToken(b.length, b.length + 1, 'diverging', b)).toBe('--div-5');
  });

  test('legenda: „poniżej …”, „od … do 0”, „od 0 do …”, „powyżej …”', () => {
    const b = legendBreaks(migration);
    const labels = buildLegend({ breaks: b, scheme: 'diverging' }).map((i) => i.label);
    expect(labels[1]).toMatch(/do 0$/);
    expect(labels[2]).toMatch(/^od 0 do/);
  });

  test('walidator robota nie zgłasza „za mało klas” dla legendy z zerem', () => {
    const codes = migration.map((_, i) => `c${i}`);
    const rows = Object.fromEntries(codes.map((c, i) => [c, [migration[i]]]));
    const out = checkLevel({ varId: '1', unit: 'osoba', level: 'gmi', data: { years: [2024], rows } });
    expect(out.map((f) => f.rule)).not.toContain('LEGEND_FEW_CLASSES');
  });

  test('dużo dokładnych zer (saldo migracji zagranicznych): zero ma własną, neutralną klasę „0”', () => {
    const values = [...spread(400, -3, -0.1), ...Array(2000).fill(0), ...spread(1000, 0.1, 4)].map((v) => Math.round(v * 10) / 10);
    const b = legendBreaks(values);
    const zeroCls = classify(0, b) as number;
    const n = b.length + 1;
    expect(classColorToken(zeroCls, n, 'diverging', b)).toBe('--div-3');
    expect(classify(0.1, b)).not.toBe(zeroCls);
    expect(classify(-0.1, b)).not.toBe(zeroCls);
    expect(classColorToken(classify(0.1, b), n, 'diverging', b)).toMatch(/--div-[45]/);
    const legend = buildLegend({ breaks: b, scheme: 'diverging' });
    expect(legend[zeroCls].label).toBe('0');
    expect(legend[zeroCls + 1].label).toMatch(/^od 0 do/);
  });
});
