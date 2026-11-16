import { afterEach, describe, expect, it, vi } from 'vitest';
import tokens from '../../config/tokens.json';
import { getMapColorsFromCss } from '@/view/map/layers/admin';

type Variant = 'dark' | 'light';

// Podstawia window/document/getComputedStyle tak, by zmienne CSS zwracały tokeny wariantu.
function stubTheme(variant: Variant, overrides: Record<string, string> = {}) {
  const t = tokens.color[variant] as Record<string, string>;
  const vars: Record<string, string> = {
    '--kalka': t.kalka,
    '--arkusz': t.arkusz,
    '--tusz': t.tusz,
    '--ochra': t.ochra,
    '--korekta': t.korekta,
    '--olowek': t.olowek,
    ...overrides,
  };
  vi.stubGlobal('window', {});
  vi.stubGlobal('document', { documentElement: {} });
  vi.stubGlobal('getComputedStyle', () => ({
    getPropertyValue: (name: string) => vars[name] ?? '',
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('granica jednostek: zapas przy złym --olowek', () => {
  it('ciemny + pusty --olowek: granica = kalka', () => {
    stubTheme('dark', { '--olowek': '' });
    const colors = getMapColorsFromCss();
    expect(colors?.granica).toEqual(colors?.kalka);
  });

  it('ciemny + same spacje: granica = kalka', () => {
    stubTheme('dark', { '--olowek': '   ' });
    const colors = getMapColorsFromCss();
    expect(colors?.granica).toEqual(colors?.kalka);
  });

  it('ciemny + niepoprawna wartość: granica = kalka', () => {
    stubTheme('dark', { '--olowek': 'nonsens' });
    const colors = getMapColorsFromCss();
    expect(colors?.granica).toEqual(colors?.kalka);
  });

  it('jasny + pusty --olowek: granica = kalka', () => {
    stubTheme('light', { '--olowek': '' });
    const colors = getMapColorsFromCss();
    expect(colors?.granica).toEqual(colors?.kalka);
  });

  it('ciemny + poprawny token: alfa 140 i RGB z tokenu', () => {
    stubTheme('dark');
    const h = tokens.color.dark.olowek;
    const rgb = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const colors = getMapColorsFromCss();
    expect(colors?.granica).toEqual([...rgb, 140]);
  });
});
