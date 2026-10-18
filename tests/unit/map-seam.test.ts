import { describe, it, expect } from 'vitest';
import { installAtlasSeam } from '../../src/core/map/test-seam';
import type { AtlasState, WindowWithAtlas } from '../../src/core/map/test-seam';

describe('Atlas Test Seam (src/core/map/test-seam.ts)', () => {
  const sampleState: AtlasState = {
    ready: true,
    layers: ['woj-layer', 'pow-layer'],
    selected: '1217',
    viewState: {
      longitude: 19.9,
      latitude: 50.0,
      zoom: 7.5,
    },
    theme: 'light',
  };

  it('does not define window.__atlas when URL does not contain ?e2e', () => {
    const mockWin: WindowWithAtlas = {
      location: { search: '?u=1217011' },
    };

    const result = installAtlasSeam(mockWin, () => sampleState);

    expect(result).toBeUndefined();
    expect(mockWin.__atlas).toBeUndefined();
  });

  it('does not define window.__atlas when URL parameter name is e2e, e.g. ?name=e2e', () => {
    const mockWin: WindowWithAtlas = {
      location: { search: '?name=e2e' },
    };

    const result = installAtlasSeam(mockWin, () => sampleState);

    expect(result).toBeUndefined();
    expect(mockWin.__atlas).toBeUndefined();
  });

  it('defines window.__atlas when URL contains ?e2e', () => {
    const mockWin: WindowWithAtlas = {
      location: { search: '?u=1217011&e2e' },
    };

    const result = installAtlasSeam(mockWin, () => sampleState);

    expect(result).toBeUndefined();
    expect(mockWin.__atlas).toBeDefined();
    expect(mockWin.__atlas?.ready).toBe(true);
    expect(mockWin.__atlas?.layers).toEqual(['woj-layer', 'pow-layer']);
    expect(mockWin.__atlas?.selected).toBe('1217');
    expect(mockWin.__atlas?.viewState).toEqual({
      longitude: 19.9,
      latitude: 50.0,
      zoom: 7.5,
    });
    expect(mockWin.__atlas?.theme).toBe('light');
  });

  it('makes window.__atlas read-only (modifications fail or do not change state)', () => {
    let currentState: AtlasState = { ...sampleState };
    const mockWin: WindowWithAtlas = {
      location: { search: '?e2e' },
    };

    installAtlasSeam(mockWin, () => currentState);

    expect(mockWin.__atlas?.ready).toBe(true);

    // Attempting property modification on __atlas
    try {
      (mockWin.__atlas as any).ready = false;
    } catch {
      // Ignore strict mode write error
    }
    expect(mockWin.__atlas?.ready).toBe(true);

    // Attempting overwrite of __atlas object on window
    try {
      (mockWin as any).__atlas = null;
    } catch {
      // Ignore strict mode write error
    }
    expect(mockWin.__atlas).toBeDefined();
    expect(mockWin.__atlas?.ready).toBe(true);

    // Verify dynamic state updates through getState getter
    currentState = {
      ...currentState,
      selected: '1401',
      theme: 'dark',
    };
    expect(mockWin.__atlas?.selected).toBe('1401');
    expect(mockWin.__atlas?.theme).toBe('dark');
  });
});
