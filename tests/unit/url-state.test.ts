import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import unitsData from '../../public/data/units.json';
import { buildIndex } from '../../src/core/units/units';
import { readUrlState, writeUrlState, type UrlState } from '../../src/core/url/state';
import type { Unit, UnitIndex } from '../../src/core/units/types';

describe('URL State Module (CC4.R)', () => {
  let index: UnitIndex;

  beforeEach(() => {
    index = buildIndex(unitsData as Unit[]);
  });

  describe('readUrlState', () => {
    it('odczytuje poprawny TERYT z ?u=', () => {
      const state = readUrlState('?u=02&e2e=1', index);
      expect(state.u).toBe('02');
    });

    it('ignoruje nieznany TERYT w ?u=', () => {
      const stateInvalid = readUrlState('?u=invalid', index);
      expect(stateInvalid.u).toBeUndefined();

      const stateUnknown = readUrlState('?u=9999999', index);
      expect(stateUnknown.u).toBeUndefined();
    });

    it('zwraca stan bez u, gdy brak parametru ?u=', () => {
      expect(readUrlState('', index).u).toBeUndefined();
      expect(readUrlState('?e2e=1', index).u).toBeUndefined();
      expect(readUrlState('?u=', index).u).toBeUndefined();
    });

    it('akceptuje opcjonalne pola i, y, c w typie UrlState', () => {
      const sampleState: UrlState = {
        u: '0201',
        i: 'mieszkania',
        y: 2023,
        c: 'jenks',
      };
      expect(sampleState.i).toBe('mieszkania');
      expect(sampleState.y).toBe(2023);
      expect(sampleState.c).toBe('jenks');
    });
  });

  describe('writeUrlState', () => {
    const originalWindow = global.window;

    afterEach(() => {
      if (originalWindow !== undefined) {
        global.window = originalWindow;
      } else {
        delete (global as any).window;
      }
    });

    it('zapisuje parametr u i zachowuje inne parametry URL (np. e2e, tune)', () => {
      const replaceStateSpy = vi.fn<(data: any, unused: string, url?: string | URL | null) => void>();
      global.window = {
        location: new URL('http://localhost/?e2e=1&tune=panel'),
        history: { replaceState: replaceStateSpy },
      } as any;

      writeUrlState({ u: '02' });

      expect(replaceStateSpy).toHaveBeenCalledWith(
        null,
        '',
        'http://localhost/?e2e=1&tune=panel&u=02'
      );
    });

    it('usuwa parametr u, gdy jest null lub undefined, zachowując inne parametry', () => {
      const replaceStateSpy = vi.fn<(data: any, unused: string, url?: string | URL | null) => void>();
      global.window = {
        location: new URL('http://localhost/?u=02&e2e=1'),
        history: { replaceState: replaceStateSpy },
      } as any;

      writeUrlState({ u: null });

      expect(replaceStateSpy).toHaveBeenCalledWith(
        null,
        '',
        'http://localhost/?e2e=1'
      );
    });
  });
});
