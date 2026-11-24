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
  n: number,
  options: { nice?: boolean } = {}
): number[] {
  const raw = computeRawBreaks(values, method, n);
  return options.nice ? niceBreaks(raw, values) : raw;
}

/**
 * Zaokrągla progi do 2 cyfr znaczących (46 206,8 → 46 000), a gdy wszystkie wartości są
 * całkowite – do liczb całkowitych. Legenda czyta się wtedy jak ludzka, bez „od 3,7 do 12,2”
 * dla liczb sztuk. Powtórzone i nie większe od minimum progi są usuwane.
 */
export function niceBreaks(breaks: number[], values: (number | null | undefined)[]): number[] {
  const valid = values.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
  if (valid.length === 0 || breaks.length === 0) return breaks;
  const min = Math.min(...valid);
  const integers = valid.every((v) => Number.isInteger(v));
  const rounded = breaks.map((b) => {
    if (b === 0) return 0;
    const digits = 1 - Math.floor(Math.log10(Math.abs(b)));
    const factor = 10 ** digits;
    const r = Math.round(b * factor) / factor;
    return integers ? Math.round(r) : r;
  });
  return cleanBreaks(rounded, min);
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
 * Usuwa powtórzone progi i progi nie większe od minimum danych (pusta klasa
 * „poniżej minimum”). Liczba klas = progi + 1, więc legenda nie ma pustych ani
 * zdublowanych przedziałów.
 */
export function cleanBreaks(breaks: number[], min: number): number[] {
  const out: number[] = [];
  for (const b of breaks) {
    if (b > min && (out.length === 0 || b > out[out.length - 1])) out.push(b);
  }
  return out;
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
