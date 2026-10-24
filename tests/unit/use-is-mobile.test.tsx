import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { useIsMobile } from '../../src/view/hooks/useIsMobile';
import tokensJson from '../../config/tokens.json';

type ChangeListener = (e: MediaQueryListEvent) => void;

interface MockMediaQueryList {
  matches: boolean;
  media: string;
  onchange: null | ChangeListener;
  addListener: () => void;
  removeListener: () => void;
  addEventListener: (type: string, listener: ChangeListener) => void;
  removeEventListener: (type: string, listener: ChangeListener) => void;
  dispatchEvent: (event: Event) => boolean;
}

// Zapewnienie globalnego obiektu window dla środowiska node/vitest
if (typeof window === 'undefined') {
  (globalThis as any).window = {};
}

/**
 * Komponent testowy do sprawdzania wartości zwrotnej useIsMobile
 */
function TestComponent({ onValue }: { onValue: (val: boolean) => void }) {
  const isMobile = useIsMobile();
  onValue(isMobile);
  return <div data-testid="result">{isMobile ? 'mobile' : 'desktop'}</div>;
}

describe('useIsMobile', () => {
  let listeners: Set<ChangeListener>;
  let currentWidth: number;

  function createMockMatchMedia(initialWidth: number) {
    currentWidth = initialWidth;
    listeners = new Set<ChangeListener>();

    return (query: string): MockMediaQueryList => {
      const breakpoint = tokensJson.breakpoints.tablet;
      const expectedQuery = `(max-width: ${breakpoint - 1}px)`;

      // Weryfikacja czy zapytanie używa progu z config/tokens.json (767px dla tablet=768)
      expect(query).toBe(expectedQuery);

      return {
        get matches() {
          return currentWidth < breakpoint;
        },
        media: query,
        onchange: null,
        addListener: vi.fn<() => void>(),
        removeListener: vi.fn<() => void>(),
        addEventListener: (_type: string, listener: ChangeListener) => {
          listeners.add(listener);
        },
        removeEventListener: (_type: string, listener: ChangeListener) => {
          listeners.delete(listener);
        },
        dispatchEvent: (event: Event) => {
          listeners.forEach((l) => l(event as MediaQueryListEvent));
          return true;
        },
      };
    };
  }

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('zwraca true dla szerokości 390 (mobile)', () => {
    window.matchMedia = createMockMatchMedia(390) as any;

    let currentValue = false;
    renderToString(<TestComponent onValue={(val) => { currentValue = val; }} />);

    expect(currentValue).toBe(true);
  });

  it('zwraca false dla szerokości 1024 (desktop)', () => {
    window.matchMedia = createMockMatchMedia(1024) as any;

    let currentValue = true;
    renderToString(<TestComponent onValue={(val) => { currentValue = val; }} />);

    expect(currentValue).toBe(false);

  });

  it('zmiana zdarzenia change przełącza wynik', () => {
    window.matchMedia = createMockMatchMedia(390) as any;

    let currentValue = false;
    renderToString(<TestComponent onValue={(val) => { currentValue = val; }} />);
    expect(currentValue).toBe(true);

    // Wywołanie zdarzenia change na zarejestrowanych słuchaczach
    currentWidth = 1024;
    listeners.forEach((listener) => {
      listener({ matches: false } as MediaQueryListEvent);
    });

    renderToString(<TestComponent onValue={(val) => { currentValue = val; }} />);
    expect(currentValue).toBe(false);

    // Zmiana z powrotem na mobile (390px)
    currentWidth = 390;
    listeners.forEach((listener) => {
      listener({ matches: true } as MediaQueryListEvent);
    });

    renderToString(<TestComponent onValue={(val) => { currentValue = val; }} />);
    expect(currentValue).toBe(true);
  });

  it('zwraca false w środowisku bez window / matchMedia (SSR)', () => {
    const originalMatchMedia = window.matchMedia;
    delete (window as any).matchMedia;

    let currentValue = true;
    renderToString(<TestComponent onValue={(val) => { currentValue = val; }} />);

    expect(currentValue).toBe(false);

    window.matchMedia = originalMatchMedia;
  });
});
