import { describe, expect, it } from 'vitest';
import { coverageDropFlag, mergeCoverage, pickSample, readRotation, type Coverage } from '../../src/core/seo/gsc-sample';

const urls = Array.from({ length: 396 }, (_, i) => `https://x.pl/s/${String(i).padStart(4, '0')}`);
const shuffled = [...urls].reverse();
const cov = (n: number, indexed: number, prefix = 'u'): Coverage =>
  Object.fromEntries(Array.from({ length: n }, (_, i) => [`${prefix}${i}`, i < indexed ? 'i' : 'n'])) as Coverage;

describe('pickSample @S15', () => {
  it('3 wywołania po 150 na 396 adresach obejmują wszystkie bez powtórzeń do zawinięcia', () => {
    const a = pickSample(shuffled, 0, 150);
    const b = pickSample(shuffled, a.cursor, 150);
    const c = pickSample(shuffled, b.cursor, 150);
    const firstTwo = [...a.sample, ...b.sample];
    expect(new Set(firstTwo).size).toBe(300);
    expect(new Set([...firstTwo, ...c.sample.slice(0, 96)]).size).toBe(396);
    expect(c.sample.slice(0, 96)).toEqual(urls.slice(300));
  });

  it('po zawinięciu zaczyna od początku', () => {
    const c = pickSample(urls, 300, 150);
    expect(c.sample.slice(96)).toEqual(urls.slice(0, 54));
    expect(c.cursor).toBe(54);
    expect(pickSample(urls, 396, 150).sample[0]).toBe(urls[0]);
  });

  it('brak poprzedniego kursora = start od zera; pusta lista nie wywala', () => {
    expect(pickSample(urls, null, 150)).toEqual({ sample: urls.slice(0, 150), cursor: 150 });
    expect(pickSample([], 5, 150)).toEqual({ sample: [], cursor: 0 });
    expect(readRotation(null)).toEqual({ cursor: 0, coverage: null });
  });
});

describe('mergeCoverage @S15', () => {
  it('zachowuje adresy spoza próbki i nadpisuje te z próbki', () => {
    const m = mergeCoverage({ a: 'i', b: 'i', c: 'n' }, { b: 'n', d: 'i' });
    expect(m.coverage).toEqual({ a: 'i', b: 'n', c: 'n', d: 'i' });
    expect(m.known).toBe(4);
    expect(m.indexedShare).toBeCloseTo(0.5);
  });
});

describe('coverageDropFlag @S15', () => {
  const prev = cov(200, 160);
  it('spadek o > 20 pp przy ≥ 100 adresach daje flagę', () => {
    const merged = mergeCoverage(prev, cov(200, 100));
    expect(coverageDropFlag(prev, merged)).toMatch(/Spadek zaindeksowanych/);
  });
  it('spadek o 10 pp nie daje flagi', () => {
    expect(coverageDropFlag(prev, mergeCoverage(prev, cov(200, 140)))).toBeNull();
  });
  it('próbka < 100 adresów nie daje flagi', () => {
    const small = cov(60, 60);
    expect(coverageDropFlag(small, mergeCoverage(small, cov(60, 0)))).toBeNull();
  });
  it('brak poprzedniego stanu = brak flagi', () => {
    expect(coverageDropFlag(null, mergeCoverage(null, cov(200, 0)))).toBeNull();
  });
});
