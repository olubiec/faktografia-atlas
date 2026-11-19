// Strażnik: „na start tylko podstawowe dane”. Jeśli ktoś zmieni listę podstawową
// albo domyślne ładowanie, ten test pęka zanim zobaczy to użytkownik.
import { describe, it, expect } from 'vitest';
import { BASIC_INDICATORS, defaultMyIndicators, isBasic } from '../../src/core/my-indicators/my-indicators';
import { loadMyIndicators } from '../../src/core/my-indicators/storage';
import { PAGE_DATA_RULES, seedIndicators } from '../../src/core/share/deck-page-data';
import { INDICATORS } from '../../src/view/map/hooks/useMainView';

const emptyStorage = { getItem: () => null, setItem: () => undefined };
const brokenStorage = {
  getItem: () => {
    throw new Error('zablokowane');
  },
  setItem: () => undefined,
};

describe('podstawowe na start – strażnik', () => {
  it('lista podstawowa ma dokładnie 7 wskaźników bez powtórzeń', () => {
    expect(BASIC_INDICATORS).toHaveLength(7);
    expect(new Set(BASIC_INDICATORS).size).toBe(7);
  });

  it('każdy podstawowy wskaźnik istnieje w katalogu', () => {
    const ids = new Set(INDICATORS.map((i) => i.id));
    for (const id of BASIC_INDICATORS) expect(ids.has(id)).toBe(true);
  });

  it('czysty magazyn i zablokowany magazyn dają listę podstawową', () => {
    expect(loadMyIndicators(emptyStorage)).toEqual(BASIC_INDICATORS);
    expect(loadMyIndicators(brokenStorage)).toEqual(BASIC_INDICATORS);
    expect(loadMyIndicators(null)).toEqual(BASIC_INDICATORS);
    expect(isBasic(defaultMyIndicators())).toBe(true);
  });

  it('nowa strona udostępniania z czystą listą nie dostaje więcej niż podstawowe', () => {
    const mine = loadMyIndicators(emptyStorage);
    for (const kind of Object.keys(PAGE_DATA_RULES) as (keyof typeof PAGE_DATA_RULES)[]) {
      const seeded = seedIndicators(kind, mine, null);
      expect(seeded.length).toBeLessThanOrEqual(BASIC_INDICATORS.length);
      for (const id of seeded) expect(BASIC_INDICATORS).toContain(id);
    }
  });
});
