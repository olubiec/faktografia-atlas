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
      let state: ReturnType<typeof useMapSelection>;

      function TestComponent() {
        state = useMapSelection(unitIndex);
        return null;
      }

      renderToString(<TestComponent />);

      expect(state!.selectedTeryt).toBeNull();
      expect(state!.drillState).toBeDefined();
      expect(typeof state!.selectUnit).toBe('function');
      expect(typeof state!.selectBreadcrumb).toBe('function');
      expect(typeof state!.goBack).toBe('function');
    });

    it('selectUnit("12") sets selectedTeryt and ?u=12 in URL, and goBack() returns to parent', () => {
      let state: ReturnType<typeof useMapSelection> | null = null;

      function TestComponent() {
        state = useMapSelection(unitIndex);
        return null;
      }

      renderToString(<TestComponent />);
      expect(state!.selectedTeryt).toBeNull();
      expect(state!.drillState.selected).toBeNull();

      // Test selectUnit('12')
      state!.selectUnit('12');
      expect(window.location.search).toBe('?u=12');

      renderToString(<TestComponent />);
      expect(state!.selectedTeryt).toBe('12');
      expect(state!.drillState.selected).toBe('12');

      // Test goBack()
      state!.goBack();
      expect(window.location.search).toBe('');

      renderToString(<TestComponent />);
      expect(state!.selectedTeryt).toBeNull();
      expect(state!.drillState.selected).toBeNull();
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
