import { describe, expect, it } from 'vitest';
import { findLibraryTwins } from '@/core/facts/anomaly-twins';
import type { AnomalySource } from '@/core/facts/anomaly-sources';

// 40 gmin w 2 województwach; gmina i w woj. 02 ma odpowiednik o tych samych wartościach w woj. 04.
const gminas = [...Array.from({ length: 20 }, (_, i) => `02${String(i + 1).padStart(2, '0')}011`), ...Array.from({ length: 20 }, (_, i) => `04${String(i + 1).padStart(2, '0')}011`)];
const make = (id: string, f: (i: number) => number): AnomalySource => ({
  id,
  name: id,
  unit: '%',
  topic: id,
  years: [2022],
  values: Object.fromEntries(gminas.map((t, i) => [t, [f(i % 20)]])),
  derived: false,
});

describe('bliźniak z całej biblioteki', () => {
  const sources = Array.from({ length: 40 }, (_, k) => make(`b${k}`, (i) => (k % 2 ? i : 19 - i) + k * 0.001 * i));
  const population = Object.fromEntries(gminas.map((t, i) => [t, 1000 * ((i % 20) + 1)]));
  it('wybiera gminę z innego województwa o tym samym wektorze wskaźników', () => {
    const twins = findLibraryTwins({ sources, gminas, population, minUnits: 10 });
    expect(twins.get('0205011')?.twin).toBe('0405011');
    expect(twins.get('0405011')?.twin).toBe('0205011');
  });
  it('liczy wszystkie wskaźniki biblioteki, nie kilkanaście', () => {
    const t = findLibraryTwins({ sources, gminas, population, minUnits: 10 }).get('0205011');
    expect(t?.dims).toBe(41);
    expect(t?.year).toBe(2022);
  });
  it('pomija gminy bez wystarczającej liczby wskaźników', () => {
    const few = sources.map((s, k) => (k === 0 ? s : { ...s, values: {} }));
    expect(findLibraryTwins({ sources: few, gminas, population, minUnits: 10 }).size).toBe(0);
  });
});
