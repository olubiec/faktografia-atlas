import { afterEach, describe, expect, it, vi } from 'vitest';
import tokens from '../../config/tokens.json';
import { getMapColorsFromCss } from '@/view/map/layers/admin';

type Rgb = [number, number, number];
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

function hex(h: string): Rgb {
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
}

// Luminancja względna wg WCAG 2.x (sRGB -> liniowe).
function luminance([r, g, b]: Rgb): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

// Kontrast wg WCAG 2.x: (L1 + 0.05) / (L2 + 0.05), jaśniejszy przez ciemniejszy.
function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Alfa-blending sRGB: kolor z kanałem alfa położony na nieprzezroczyste tło.
function blend([r, g, b, a]: number[], bg: Rgb): Rgb {
  const k = a / 255;
  return [r, g, b].map((c, i) => c * k + bg[i] * (1 - k)) as Rgb;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('kontrast granic jednostek (WCAG 1.4.11)', () => {
  it('ciemny motyw: granica ma alfę < 255 i kontrast >= 3:1 z kalką i arkuszem', () => {
    stubTheme('dark');
    const colors = getMapColorsFromCss();
    expect(colors?.granica).toBeDefined();
    const granica = colors!.granica!;
    expect(granica[3]).toBeLessThan(255);
    expect(contrast(blend(granica, hex(tokens.color.dark.kalka)), hex(tokens.color.dark.kalka))).toBeGreaterThanOrEqual(3);
    expect(contrast(blend(granica, hex(tokens.color.dark.arkusz)), hex(tokens.color.dark.arkusz))).toBeGreaterThanOrEqual(3);
  });

  it('jasny motyw: granica równa kalce', () => {
    stubTheme('light');
    const colors = getMapColorsFromCss();
    expect(colors?.granica).toEqual(colors?.kalka);
  });

  // Przypadek kontrolny (pusty --olowek -> granica = kalka) odłożony: admin.ts zamiast tego
  // sięga po jasny token olowek (granica = [77,91,114,140]); wymaga decyzji, nie zmieniam admin.ts.
});
