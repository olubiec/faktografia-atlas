import { capTail, guardTail, reshapeTail } from './tail';
import { calibrateBreaks, cleanBreaks, divergingBreaks, divergingToken } from './calibrate';

export { cleanBreaks } from './calibrate';

export type ClassificationMethod = 'quantile' | 'equal';
export type ClassificationScheme = 'sequential' | 'diverging';
export type ClassifyResult = number | 'no-data';

/**
 * Oblicza n - 1 progów podziału dla podanych wartości wskaźnika.
 * Wartości null oraz NaN są pomijane.
 * `nice` = progi do legendy: skalibrowane zaokrąglenie, a gdy są wartości ujemne
 * i dodatnie (kwantyle) – zero jako granica klas (patrz calibrate.ts).
 */
export function computeBreaks(
  values: (number | null | undefined)[],
  method: ClassificationMethod,
  n: number,
  options: { nice?: boolean } = {}
): number[] {
  if (options.nice && method === 'quantile' && n > 1) {
    const valid = values.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
    if (valid.some((v) => v < 0) && valid.some((v) => v > 0)) return divergingBreaks(valid);
  }
  const raw = computeRawBreaks(values, method, n);
  if (!options.nice) return raw;
  // Ogon rozkładu: rozciągniętą skrajną klasę kwantylową zastępują naturalne przerwy (tail.ts).
  const valid = values.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
  const nice = niceBreaks(method === 'quantile' ? capTail(valid, reshapeTail(valid, raw)) : raw, values);
  return method === 'quantile' ? guardTail(nice) : nice;
}

/** Progi legendy dla mapy i kart: kwantyle, 5 klas, skalibrowane (jeden automat dla całej strony). */
export function legendBreaks(values: (number | null | undefined)[], n = 5): number[] {
  return computeBreaks(values, 'quantile', n, { nice: true });
}

/**
 * Zaokrągla progi do czytelnej postaci (zwykle 2 cyfry znaczące: 46 206,8 → 46 000), a gdy
 * wszystkie wartości są całkowite – do liczb całkowitych. Gdy takie zaokrąglenie zlałoby klasy
 * lub przesunęło wiele jednostek (wąski rozrzut, np. 104–112), bierze kolejne cyfry.
 */
export function niceBreaks(breaks: number[], values: (number | null | undefined)[]): number[] {
  const valid = values.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
  return calibrateBreaks(breaks, valid);
}

function computeRawBreaks(
  values: (number | null | undefined)[],
  method: ClassificationMethod,
  n: number
): number[] {
  const validValues = values.filter(
    (v): v is number => typeof v === 'number' && !Number.isNaN(v)
  );

  if (validValues.length === 0 || n <= 1) {
    return [];
  }

  const sorted = [...validValues].sort((a, b) => a - b);
  const breaks: number[] = [];

  if (method === 'equal') {
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const step = (max - min) / n;

    for (let i = 1; i < n; i++) {
      breaks.push(min + i * step);
    }
  } else if (method === 'quantile') {
    const len = sorted.length;
    for (let i = 1; i < n; i++) {
      const p = i / n;
      const pos = (len - 1) * p;
      const base = Math.floor(pos);
      const rest = pos - base;

      if (base + 1 < len) {
        breaks.push(sorted[base] + rest * (sorted[base + 1] - sorted[base]));
      } else {
        breaks.push(sorted[base]);
      }
    }
  }

  const min = sorted[0];
  const cleaned = cleanBreaks(breaks, min);
  // Dużo wartości równych minimum (np. same zera): minimum dostaje własną klasę,
  // a pozostałe wartości dzielimy kwantylami na resztę klas.
  if (method === 'quantile' && cleaned.length < n - 1) {
    const rest = sorted.filter((v) => v > min);
    if (rest.length > 0) {
      const restBreaks = computeRawBreaks(rest, 'quantile', n - 1);
      return cleanBreaks([rest[0], ...restBreaks], min);
    }
  }
  return cleaned;
}

/**
 * Przypisuje wartość do klasy o indeksie 0...n-1 na podstawie wyznaczonych progów,
 * lub zwraca 'no-data' dla brakujących wartości (null / NaN).
 */
export function classify(
  value: number | null | undefined,
  breaks: number[]
): ClassifyResult {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'no-data';
  }

  let index = 0;
  while (index < breaks.length && value >= breaks[index]) {
    index++;
  }

  return index;
}

/**
 * Zwraca nazwę zmiennej CSS tokenu koloru (np. --seq-1, --div-3, --no-data)
 * dla podanego indeksu klasy i schematu kolorów. Przy schemacie rozbieżnym podaj
 * progi (`breaks`): klasy poniżej zera dostają ciepłe kolory, powyżej – chłodne.
 */
export function classColorToken(
  index: ClassifyResult,
  n: number,
  scheme: ClassificationScheme,
  breaks?: number[]
): string {
  if (index === 'no-data') {
    return '--no-data';
  }
  // Progi z zerem: kolor zależy od strony zera, nie od numeru klasy.
  if (scheme === 'diverging' && breaks) {
    const token = divergingToken(index, breaks);
    if (token) return token;
  }

  const maxClasses = Math.min(Math.max(n, 1), 5);
  const tokenIndex =
    maxClasses === 1
      ? 1
      : Math.min(5, Math.max(1, 1 + Math.round((index / (maxClasses - 1)) * 4)));

  const prefix = scheme === 'sequential' ? '--seq' : '--div';
  return `${prefix}-${tokenIndex}`;
}
