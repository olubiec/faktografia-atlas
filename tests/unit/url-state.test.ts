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

    it('odczytuje parametry i oraz y z URL (CC8.2a-1)', () => {
      const state = readUrlState('?i=avg-wage&y=2023', index);
      expect(state.i).toBe('avg-wage');
      expect(state.y).toBe(2023);
    });

    it('pomija nieznane i oraz nieliczbowe y w URL (CC8.2a-1)', () => {
      const state = readUrlState('?i=non-existent-indicator&y=invalid', index);
      expect(state.i).toBeUndefined();
      expect(state.y).toBeUndefined();

      const state2 = readUrlState('?i=avg-wage&y=2023abc', index);
      expect(state2.i).toBe('avg-wage');
      expect(state2.y).toBeUndefined();
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

    it('zapisuje i oraz y i zachowuje inne parametry URL (CC8.2a-1)', () => {
      const replaceStateSpy = vi.fn<(data: any, unused: string, url?: string | URL | null) => void>();
      global.window = {
        location: new URL('http://localhost/?u=02&e2e=1'),
        history: { replaceState: replaceStateSpy },
      } as any;

      writeUrlState({ i: 'population', y: 2022 });

      expect(replaceStateSpy).toHaveBeenCalledWith(
        null,
        '',
        'http://localhost/?u=02&e2e=1&i=population&y=2022'
      );
    });

    it('usuwa i oraz y gdy są null/undefined (CC8.2a-1)', () => {
      const replaceStateSpy = vi.fn<(data: any, unused: string, url?: string | URL | null) => void>();
      global.window = {
        location: new URL('http://localhost/?u=02&i=population&y=2022&e2e=1'),
        history: { replaceState: replaceStateSpy },
      } as any;

      writeUrlState({ i: undefined, y: undefined });

      expect(replaceStateSpy).toHaveBeenCalledWith(
        null,
        '',
        'http://localhost/?u=02&e2e=1'
      );
    });
  });
});
