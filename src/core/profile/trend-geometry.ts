/**
 * Logika geometryczna i skalowanie dla wykresu trendu (TrendChart).
 */

export interface TrendDataPoint {
  year: number;
  value: number | null;
}

export interface ValidTrendPoint {
  year: number;
  value: number;
}

export interface ChartDimensions {
  height: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
}

export const DEFAULT_DIMENSIONS: ChartDimensions = {
  height: 180,
  paddingLeft: 70,
  paddingRight: 20,
  paddingTop: 24,
  paddingBottom: 32,
};

/**
 * Zwraca punkty serii z niepustą wartością.
 */
export function getValidPoints(series: TrendDataPoint[]): ValidTrendPoint[] {
  return series.filter(
    (d): d is ValidTrendPoint => d.value !== null && d.value !== undefined
  );
}

/**
 * Sprawdza, czy seria główna ma wystarczającą liczbę punktów do narysowania wykresu (min. 2).
 */
export function hasEnoughData(series: TrendDataPoint[]): boolean {
  return getValidPoints(series).length >= 2;
}

/**
 * Zwraca posortowaną listę lat z serii.
 */
export function getSortedYears(series: TrendDataPoint[]): number[] {
  return series.map((s) => s.year).sort((a, b) => a - b);
}

/**
 * Oblicza zakres osi Y z 10% marginesem na dole i na górze.
 * Obsługuje brak danych, równe wartości, wartości ujemne.
 */
export function calculateYDomain(
  mainPoints: ValidTrendPoint[],
  comparePoints?: ValidTrendPoint[]
): {
  minY: number;
  maxY: number;
  domainMinY: number;
  domainMaxY: number;
} {
  const allValues = [
    ...mainPoints.map((p) => p.value),
    ...(comparePoints ? comparePoints.map((p) => p.value) : []),
  ];

  if (allValues.length === 0) {
    return { minY: 0, maxY: 0, domainMinY: -1, domainMaxY: 1 };
  }

  let minY = Math.min(...allValues);
  let maxY = Math.max(...allValues);

  if (minY === maxY) {
    minY = minY - 1;
    maxY = maxY + 1;
  }

  // Dodatkowy margines Y (10%)
  const yMargin = (maxY - minY) * 0.1 || 1;
  const domainMinY = minY - yMargin;
  const domainMaxY = maxY + yMargin;

  return { minY, maxY, domainMinY, domainMaxY };
}

/**
 * Funkcja odwzorowania wartości na współrzędną X.
 */
export function calculateX(
  year: number,
  minYear: number,
  maxYear: number,
  paddingLeft: number,
  plotWidth: number
): number {
  if (minYear === maxYear) {
    return paddingLeft + plotWidth / 2;
  }
  return paddingLeft + ((year - minYear) / (maxYear - minYear)) * plotWidth;
}

/**
 * Funkcja odwzorowania wartości na współrzędną Y.
 */
export function calculateY(
  val: number,
  domainMinY: number,
  domainMaxY: number,
  paddingTop: number,
  plotHeight: number
): number {
  if (domainMaxY === domainMinY) {
    return paddingTop + plotHeight / 2;
  }
  return (
    paddingTop +
    plotHeight -
    ((val - domainMinY) / (domainMaxY - domainMinY)) * plotHeight
  );
}

/**
 * Zwraca etykiety osi X (pierwszy rok, ostatni rok oraz do 4 lat pośrednich).
 */
export function getXAxisYears(years: number[]): number[] {
  if (years.length === 0) return [];
  if (years.length <= 6) return [...years];

  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const intermediate: number[] = [];
  const count = 4;
  const step = (years.length - 1) / (count + 1);

  for (let i = 1; i <= count; i++) {
    const idx = Math.round(i * step);
    if (idx > 0 && idx < years.length - 1) {
      intermediate.push(years[idx]);
    }
  }

  return Array.from(new Set([minYear, ...intermediate, maxYear])).sort(
    (a, b) => a - b
  );
}

/**
 * Dzieli serię na ciągłe segmenty (null oznacza przerwę w linii).
 */
export function buildSegments(series: TrendDataPoint[]): ValidTrendPoint[][] {
  const segments: ValidTrendPoint[][] = [];
  let current: ValidTrendPoint[] = [];

  for (const item of series) {
    if (item.value !== null && item.value !== undefined) {
      current.push({ year: item.year, value: item.value });
    } else {
      if (current.length > 0) {
        segments.push(current);
        current = [];
      }
    }
  }
  if (current.length > 0) {
    segments.push(current);
  }
  return segments;
}

/**
 * Generuje ścieżkę SVG (d attribute) dla segmentu punktów.
 */
export function buildPathD(
  points: ValidTrendPoint[],
  getX: (year: number) => number,
  getY: (val: number) => number
): string {
  return points
    .map(
      (p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.year)} ${getY(p.value)}`
    )
    .join(' ');
}
