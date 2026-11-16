import { describe, expect, it } from 'vitest';
import indicators from '../../config/indicators.json';
import { parseIntent } from '../../src/core/search/intent';
import type { Unit } from '../../src/core/units/types';

const mk = (teryt: string, name: string, level: Unit['level']): Unit => ({
  teryt, bdlId: null, name, level, parent: null, bbox: [0, 0, 0, 0], centroid: [0, 0],
});
const units: Unit[] = [
  mk('1261000', 'Kraków', 'pow'),
  mk('0264000', 'Łódź', 'pow'),
  mk('2262000', 'Żywiec', 'pow'),
];
const ctx = { units, indicators };

describe('parseIntent – brzegi', () => {
  it('pusty tekst, spacje i same znaki specjalne → null', () => {
    for (const t of ['', '   ', '\n\t', '!!!???', '...']) expect(parseIntent(t, ctx)).toBeNull();
  });
  it('puste dane (brak jednostek / wskaźników) nie rzucają', () => {
    expect(parseIntent('bezrobocie', { units: [], indicators })).toMatchObject({ i: 'unemployment-rate' });
    expect(parseIntent('bezrobocie', { units, indicators: [] })).toBeNull();
    expect(parseIntent('bezrobocie', { units: [], indicators: [] })).toBeNull();
  });
  it('null/undefined jako tekst nie wywala procesu w sposób nieobsłużony', () => {
    expect(() => parseIntent(null as unknown as string, ctx)).not.toThrow();
    expect(() => parseIntent(undefined as unknown as string, ctx)).not.toThrow();
  });
  it('polskie znaki: Łódź i Żywiec rozpoznane bez diakrytyków i w kapitalikach', () => {
    expect(parseIntent('bezrobocie lodz', ctx)?.u).toBe('0264000');
    expect(parseIntent('BEZROBOCIE ŻYWIEC', ctx)?.u).toBe('2262000');
  });
  it('rok poza zakresem i zlepiony z tekstem jest ignorowany', () => {
    expect(parseIntent('bezrobocie 1800', ctx)?.y).toBeUndefined();
    expect(parseIntent('bezrobocie 9999', ctx)?.y).toBeUndefined();
    expect(parseIntent('bezrobocie 2020abc', ctx)?.y).toBeUndefined();
    expect(parseIntent('bezrobocie 20201', ctx)?.y).toBeUndefined();
  });
  it('bardzo długie wejście (100 tys. znaków) kończy się szybko', () => {
    const t0 = Date.now();
    const r = parseIntent('bezrobocie ' + 'a '.repeat(50000) + 'Kraków', ctx);
    expect(r?.u).toBe('1261000');
    expect(Date.now() - t0).toBeLessThan(3000);
  });
  it('długi ciąg bez spacji i powtórzone frazy', () => {
    expect(parseIntent('x'.repeat(100000), ctx)).toBeNull();
    expect(parseIntent('bezrobocie '.repeat(1000), ctx)).toMatchObject({ i: 'unemployment-rate' });
  });
  it('złośliwe wejście: HTML, regex, __proto__ nie wpływa na wynik', () => {
    const r = parseIntent('<script>alert(1)</script> bezrobocie', ctx);
    expect(r?.i).toBe('unemployment-rate');
    expect(parseIntent('constructor', ctx)).toBeNull();
    expect(parseIntent('__proto__', ctx)).toBeNull();
    expect(parseIntent('toString hasOwnProperty', ctx)).toBeNull();
    expect(parseIntent('bezrobocie (.*[', ctx)?.i).toBe('unemployment-rate');
  });
  it('jednostka o pustej nazwie nie pasuje do wszystkiego', () => {
    const r = parseIntent('bezrobocie', { units: [mk('1', '', 'pow')], indicators });
    expect(r?.u).toBeUndefined();
  });
  it('wynik zawsze ma tablicę notes', () => {
    expect(Array.isArray(parseIntent('bezrobocie', ctx)?.notes)).toBe(true);
  });
});
