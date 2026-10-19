import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { useMapSelection } from '../../src/view/map/hooks/useMapSelection';
import { useMapViewState } from '../../src/view/map/hooks/useMapViewState';
import { useMapColors } from '../../src/view/map/hooks/useMapColors';
import unitsData from '../../public/data/units.json';
import { buildIndex } from '../../src/core/units/units';
import type { Unit } from '../../src/core/units/types';

if (typeof window === 'undefined') {
  let href = 'http://localhost/';
  let search = '';

  (globalThis as any).window = {
    get location() {
      return { href, search };
    },
    history: {
      replaceState: (_data: any, _title: string, url: string) => {
        const parsed = new URL(url, 'http://localhost/');
        href = parsed.href;
        search = parsed.search;
      },
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  };
  (globalThis as any).document = {
    documentElement: {
      getAttribute: () => null,
      classList: { contains: () => false },
    },
  };
  (globalThis as any).getComputedStyle = () => ({
    getPropertyValue: () => '',
  });
}

const unitIndex = buildIndex(unitsData as Unit[]);

function renderHookServer<T>(hookFn: () => T): T {
  let result!: T;
  function TestComponent() {
    result = hookFn();
    return null;
  }

  renderToString(<TestComponent />);
  return result;
}

describe('Map Hooks', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', 'http://localhost/');
  });

  describe('useMapSelection', () => {
    it('exports required hook functions and drillState', () => {
      const state = renderHookServer(() => useMapSelection(unitIndex));

      expect(state.selectedTeryt).toBeNull();
      expect(state.drillState).toBeDefined();
      expect(typeof state.selectUnit).toBe('function');
      expect(typeof state.selectBreadcrumb).toBe('function');
      expect(typeof state.goBack).toBe('function');
    });

    it('selectUnit("12") sets selectedTeryt and ?u=12 in URL, and goBack() returns to parent', () => {
      const state1 = renderHookServer(() => useMapSelection(unitIndex));
      expect(state1.selectedTeryt).toBeNull();

      // Test selectUnit('12')
      state1.selectUnit('12');
      expect(window.location.search).toBe('?u=12');

      const state2 = renderHookServer(() => useMapSelection(unitIndex));
      expect(state2.selectedTeryt).toBe('12');
      expect(state2.drillState.selected).toBe('12');

      // Test goBack()
      state2.goBack();
      expect(window.location.search).toBe('');

      const state3 = renderHookServer(() => useMapSelection(unitIndex));
      expect(state3.selectedTeryt).toBeNull();
      expect(state3.drillState.selected).toBeNull();
    });
  });

  describe('useMapViewState', () => {
    it('initializes view state and exposes limits and handlers', () => {
      const state = renderHookServer(() => useMapViewState());

      expect(state.currentViewState).toBeDefined();
      expect(state.limits).toBeDefined();
      expect(state.containerRef).toBeDefined();
      expect(typeof state.updateViewStateForBbox).toBe('function');
      expect(typeof state.handleKeyDown).toBe('function');
    });
  });

  describe('useMapColors', () => {
    it('returns colors and theme', () => {
      const state = renderHookServer(() => useMapColors());

      expect(state.theme).toBe('light');
      expect(state.colors).toBeDefined();
    });
  });
});
