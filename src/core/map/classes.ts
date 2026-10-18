export type ClassificationMethod = 'quantile' | 'equal';
export type ClassificationScheme = 'sequential' | 'diverging';
export type ClassifyResult = number | 'no-data';

/**
 * Oblicza n - 1 progów podziału dla podanych wartości wskaźnika.
 * Wartości null oraz NaN są pomijane.
 */
export function computeBreaks(
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

  return breaks;
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
 * dla podanego indeksu klasy i schematu kolorów.
 */
export function classColorToken(
  index: ClassifyResult,
  n: number,
  scheme: ClassificationScheme
): string {
  if (index === 'no-data') {
    return '--no-data';
  }

  const maxClasses = Math.min(Math.max(n, 1), 5);
  const tokenIndex =
    maxClasses === 1
      ? 1
      : Math.min(5, Math.max(1, 1 + Math.round((index / (maxClasses - 1)) * 4)));

  const prefix = scheme === 'sequential' ? '--seq' : '--div';
  return `${prefix}-${tokenIndex}`;
}
