/**
 * Mapa tokenów z config/tokens.json na nazwy zmiennych CSS w src/styles/tokens.css.
 */
export const tokensMap = {
  color: {
    light: {
      kalka: '--kalka',
      arkusz: '--arkusz',
      linia: '--linia',
      tusz: '--tusz',
      olowek: '--olowek',
      korekta: '--korekta',
      korektaTekst: '--korekta-tekst',
      ochra: '--ochra',
      ochraTekst: '--ochra-tekst',
    },
    dark: {
      kalka: '--kalka',
      arkusz: '--arkusz',
      linia: '--linia',
      tusz: '--tusz',
      olowek: '--olowek',
      korekta: '--korekta',
      korektaTekst: '--korekta-tekst',
      ochra: '--ochra',
      ochraTekst: '--ochra-tekst',
    },
  },
  data: {
    sequential: {
      light: ['--seq-1', '--seq-2', '--seq-3', '--seq-4', '--seq-5'],
      dark: ['--seq-1', '--seq-2', '--seq-3', '--seq-4', '--seq-5'],
    },
    diverging: {
      light: ['--div-1', '--div-2', '--div-3', '--div-4', '--div-5'],
      dark: ['--div-1', '--div-2', '--div-3', '--div-4', '--div-5'],
    },
    noData: {
      light: '--no-data',
      dark: '--no-data',
    },
    highlight: '--highlight',
  },
  font: {
    sans: '--font-sans',
    mono: '--font-mono',
    scale: {
      xs: '--text-xs',
      sm: '--text-sm',
      md: '--text-md',
      lg: '--text-lg',
      xl: '--text-xl',
      '2xl': '--text-2xl',
      '3xl': '--text-3xl',
      '4xl': '--text-4xl',
      '5xl': '--text-5xl',
    },
  },
  radius: {
    default: '--radius',
  },
  motion: {
    fast: '--motion-fast',
    base: '--motion-base',
    slow: '--motion-slow',
    easing: '--easing',
  },
} as const;

/**
 * Oblicza różnicę między oryginalnymi a bieżącymi tokenami.
 * Zwraca obiekt zawierający tylko zmienione wartości z zachowaniem oryginalnej struktury zagnieżdżeń.
 */
export function diffTokens<T extends Record<string, unknown>>(
  original: T,
  current: T,
): Partial<T> {
  if (original === current) {
    return {};
  }

  if (
    typeof original !== 'object' ||
    original === null ||
    typeof current !== 'object' ||
    current === null
  ) {
    return {};
  }

  const result: Record<string, unknown> = {};

  for (const key of Object.keys(current)) {
    const origVal = (original as Record<string, unknown>)[key];
    const currVal = (current as Record<string, unknown>)[key];

    if (currVal === origVal) {
      continue;
    }

    if (
      typeof origVal === 'object' &&
      origVal !== null &&
      typeof currVal === 'object' &&
      currVal !== null &&
      !Array.isArray(origVal) &&
      !Array.isArray(currVal)
    ) {
      const nestedDiff = diffTokens(
        origVal as Record<string, unknown>,
        currVal as Record<string, unknown>,
      );
      if (Object.keys(nestedDiff).length > 0) {
        result[key] = nestedDiff;
      }
    } else if (Array.isArray(origVal) && Array.isArray(currVal)) {
      const isArrayEqual =
        origVal.length === currVal.length &&
        origVal.every((val, index) => val === currVal[index]);
      if (!isArrayEqual) {
        result[key] = currVal;
      }
    } else {
      result[key] = currVal;
    }
  }

  return result as Partial<T>;
}
