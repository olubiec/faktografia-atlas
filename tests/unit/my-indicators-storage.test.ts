import { describe, expect, it } from 'vitest';
import { BASIC_INDICATORS } from '../../src/core/my-indicators/my-indicators';
import { MY_INDICATORS_KEY, loadMyIndicators, saveMyIndicators } from '../../src/core/my-indicators/storage';

function fakeStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
  };
}

describe('zapis „Moje wskaźniki” (FIX3)', () => {
  it('klucz zgadza się z polityką prywatności', () => {
    expect(MY_INDICATORS_KEY).toBe('faktografia-my-indicators');
  });
  it('brak wpisu = lista podstawowa', () => {
    expect(loadMyIndicators(fakeStorage())).toEqual(BASIC_INDICATORS);
  });
  it('zapisuje i odczytuje listę', () => {
    const st = fakeStorage();
    saveMyIndicators(['density', 'avg-wage'], st);
    expect(loadMyIndicators(st)).toEqual(['density', 'avg-wage']);
  });
  it('pusta lista jest poprawna', () => {
    const st = fakeStorage();
    saveMyIndicators([], st);
    expect(loadMyIndicators(st)).toEqual([]);
  });
  it('zły format wraca do podstawowej', () => {
    expect(loadMyIndicators(fakeStorage({ [MY_INDICATORS_KEY]: '{oops' }))).toEqual(BASIC_INDICATORS);
    expect(loadMyIndicators(fakeStorage({ [MY_INDICATORS_KEY]: '[1,2]' }))).toEqual(BASIC_INDICATORS);
  });
  it('wyjątek przy odczycie i zapisie nie psuje działania', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(loadMyIndicators(broken)).toEqual(BASIC_INDICATORS);
    expect(() => saveMyIndicators(['density'], broken)).not.toThrow();
  });
  it('brak pamięci (null) też jest obsłużony', () => {
    expect(loadMyIndicators(null)).toEqual(BASIC_INDICATORS);
    expect(() => saveMyIndicators(['density'], null)).not.toThrow();
  });
});
