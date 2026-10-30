export function getX(
  year: number,
  minYear: number,
  maxYear: number,
  paddingLeft: number,
  plotWidth: number
): number {
  if (minYear === maxYear) return paddingLeft + plotWidth / 2;
  return paddingLeft + ((year - minYear) / (maxYear - minYear)) * plotWidth;
}

export function getY(
  val: number,
  domainMinY: number,
  domainMaxY: number,
  paddingTop: number,
  plotHeight: number
): number {
  if (domainMaxY === domainMinY) return paddingTop + plotHeight / 2;
  return (
    paddingTop +
    plotHeight -
    ((val - domainMinY) / (domainMaxY - domainMinY)) * plotHeight
  );
}

export function getXAxisYears(years: number[]): number[] {
  if (years.length === 0) return [];
  if (years.length <= 6) {
    return years;
  }
  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const intermediate: number[] = [];
  const count = 4; // najwyżej 4 etykiety pomiędzy
  const step = (years.length - 1) / (count + 1);
  for (let i = 1; i <= count; i++) {
    const idx = Math.round(i * step);
    if (idx > 0 && idx < years.length - 1) {
      intermediate.push(years[idx]);
    }
  }
  // Unikalne posortowane lata
  return Array.from(new Set([minYear, ...intermediate, maxYear])).sort(
    (a, b) => a - b
  );
}

export interface SegmentPoint {
  year: number;
  value: number;
}

export function buildSegments(
  sData: { year: number; value: number | null }[]
): SegmentPoint[][] {
  const segments: SegmentPoint[][] = [];
  let current: SegmentPoint[] = [];

  for (const item of sData) {
    if (item.value !== null) {
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
