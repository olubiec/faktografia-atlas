import type { Feature } from 'geojson';
import { classColorToken, type ClassifyResult } from '@/core/map/classes';
import {
  advanceColorMemory,
  blendRgba,
  easeOutCubic,
  unitAlpha,
  type ColorMemory,
  type Rgba,
} from '@/core/map/fill-blend';
import type { ChoroplethData } from '../hooks/useChoropleth';
import { parseCssColor } from './admin';
import tokensJson from '../../../../config/tokens.json';

/**
 * Odczytuje kolor z aktualnych zmiennych CSS tokenu (np. --seq-1, --div-3, --no-data)
 * lub z pliku zapasowego config/tokens.json dla podanego motywu.
 */
export function resolveTokenColor(
  token: string,
  theme: 'light' | 'dark' = 'light'
): [number, number, number, number] {
  if (typeof window !== 'undefined') {
    const style = getComputedStyle(document.documentElement);
    const val = style.getPropertyValue(token)?.trim();
    if (val) {
      const parsed = parseCssColor(val);
      if (parsed) return parsed;
    }
  }

  const isDark = theme === 'dark';
  let hex: string | undefined;

  if (token === '--no-data') {
    hex = tokensJson.data.noData[isDark ? 'dark' : 'light'];
  } else if (token.startsWith('--seq-')) {
    const idx = parseInt(token.slice(6), 10) - 1;
    const seq = tokensJson.data.sequential[isDark ? 'dark' : 'light'];
    hex = seq[idx] ?? seq[0];
  } else if (token.startsWith('--div-')) {
    const idx = parseInt(token.slice(6), 10) - 1;
    const div = tokensJson.data.diverging[isDark ? 'dark' : 'light'];
    hex = div[idx] ?? div[0];
  }

  if (hex) {
    const parsed = parseCssColor(hex);
    if (parsed) return parsed;
  }

  const fallback = parseCssColor(tokensJson.color.light.arkusz);
  if (!fallback) {
    throw new Error('Nieprawidłowy token koloru arkusz w config/tokens.json');
  }
  return fallback;
}


/** Alfa jednostek poza aktywnym zakresem i przed wejściem w reveal. */
const MIN_ALPHA = 64;

export type FillColorInput = {
  choropleth: ChoroplethData;
  isInScope: (teryt: string | null | undefined) => boolean;
  memory: ColorMemory;
  reduced: boolean;
};

/**
 * Getter koloru wypełnienia liczony w całości na CPU (bez przejść GPU atrybutów):
 * - poza zakresem: kolor klasy z alfą 64,
 * - w zakresie w trakcie reveal: alfa rośnie gładko od 64 (unitAlpha),
 * - zmiana wskaźnika/roku na tym samym poziomie: jednolita mieszanka z poprzednim kolorem.
 */
export function makeFillColorGetter({ choropleth, isInScope, memory, reduced }: FillColorInput) {
  // Kolory klas liczymy raz na warstwę, a nie osobno dla każdej z tysięcy jednostek.
  const palette = new Map<string, Rgba>();
  const colorOf = (cls: ClassifyResult): Rgba => {
    const token = classColorToken(cls, choropleth.classes, choropleth.scheme, choropleth.breaks);
    let color = palette.get(token);
    if (!color) {
      color = resolveTokenColor(token);
      palette.set(token, color);
    }
    return color;
  };
  const lineColor = resolveTokenColor('--linia');

  advanceColorMemory(memory, `${choropleth.indicatorId}:${choropleth.year}:${choropleth.level}`);
  const { prev, cur } = memory;

  const reveal = choropleth.reveal;
  const revealing = !reduced && !!reveal?.running && reveal.progress < 1;
  const elapsed = (reveal?.progress ?? 1) * (tokensJson.motion.revealTotal ?? 900);
  const blending = !reduced && !!choropleth.blend?.running;
  const blendT = easeOutCubic(choropleth.blend?.progress ?? 1);

  return (f: Feature): Rgba => {
    const teryt = f.properties?.teryt as string | undefined;
    const cls = teryt ? choropleth.classByTeryt[teryt] ?? 'no-data' : 'no-data';
    const full = cls === 'no-data' ? lineColor : colorOf(cls);
    if (teryt) cur.set(teryt, full);

    const from = blending && teryt ? prev.get(teryt) : undefined;
    const base = from ? blendRgba(from, full, blendT) : full;

    // Reszta kraju (poza aktywnym zakresem): wyblakły kolor tła
    if (!isInScope(teryt)) return [base[0], base[1], base[2], MIN_ALPHA];

    // Jednostki w aktywnym zakresie: pojawianie się po kolei, gładko zamiast skoku
    const res = revealing && teryt ? choropleth.revealResults?.get(teryt) : undefined;
    if (res) {
      const alpha = unitAlpha(elapsed, res.delay, res.duration || tokensJson.motion.fast, MIN_ALPHA);
      return [base[0], base[1], base[2], alpha];
    }
    return base;
  };
}
