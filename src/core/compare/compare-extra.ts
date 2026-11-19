import type { Indicator, IndicatorValues } from '../profile/profile';
import type { Unit, UnitLevel } from '../units/types';
import { wordDiff } from './compare';
import type { CompareRow } from './compare';

// Długość kodu TERYT określa poziom jednostki (woj 2, pow 4, gmi 7).
const TERYT_LENGTH: Record<UnitLevel, number> = { woj: 2, pow: 4, gmi: 7 };

type Pick = { year: number | null; value: number | null; rank: number | null };

function valueAt(values: IndicatorValues, teryt: string, i: number): number | null {
  return values.values[teryt]?.[i] ?? null;
}

/** Miejsce wśród jednostek tego samego poziomu (remisy dzielą miejsce). */
function rankAt(values: IndicatorValues, unit: Unit, i: number, value: number, hib: boolean | null): number {
  const len = TERYT_LENGTH[unit.level];
  let better = 0;
  for (const [teryt, row] of Object.entries(values.values)) {
    if (teryt.length !== len) continue;
    const v = row[i];
    if (v === null || v === undefined || Number.isNaN(v)) continue;
    if (hib === false ? v < value : v > value) better++;
  }
  return 1 + better;
}

function pickAt(values: IndicatorValues, unit: Unit, i: number, hib: boolean | null): Pick {
  const value = i >= 0 ? valueAt(values, unit.teryt, i) : null;
  if (i < 0 || value === null) return { year: null, value: null, rank: null };
  return { year: values.years[i], value, rank: rankAt(values, unit, i, value, hib) };
}

function latestIndex(values: IndicatorValues, teryt: string): number {
  for (let i = values.years.length - 1; i >= 0; i--) {
    if (valueAt(values, teryt, i) !== null) return i;
  }
  return -1;
}

/**
 * Wiersz porównania dla wskaźnika z biblioteki (spoza profilu).
 * Rok: `year` albo najnowszy wspólny; bez wspólnego – najnowszy każdego miejsca osobno.
 * Brak wartości po obu stronach zwraca null.
 */
export function compareExtraRow(
  indicator: Indicator,
  values: IndicatorValues,
  a: Unit,
  b: Unit,
  year?: number | null,
): CompareRow | null {
  const hib = indicator.higherIsBetter;
  let ia: number;
  let ib: number;
  let sameYear = true;

  if (year !== null && year !== undefined) {
    ia = ib = values.years.indexOf(year);
  } else {
    let common = -1;
    for (let i = values.years.length - 1; i >= 0; i--) {
      if (valueAt(values, a.teryt, i) !== null && valueAt(values, b.teryt, i) !== null) {
        common = i;
        break;
      }
    }
    if (common >= 0) {
      ia = ib = common;
    } else {
      ia = latestIndex(values, a.teryt);
      ib = latestIndex(values, b.teryt);
      sameYear = ia === ib;
    }
  }

  const pa = pickAt(values, a, ia, hib);
  const pb = pickAt(values, b, ib, hib);
  if (pa.value === null && pb.value === null) return null;

  const diffText =
    pa.value !== null && pb.value !== null && !sameYear
      ? 'brak porównania (różne lata)'
      : wordDiff(pa.value, pb.value, indicator.unit);

  return {
    indicatorId: indicator.id,
    a: pa.value,
    b: pb.value,
    diffText,
    yearA: pa.year,
    yearB: pb.year,
    rankA: pa.rank,
    rankB: pb.rank,
  };
}

/** Wiersze dla wielu wskaźników z biblioteki; pomija te bez danych u obu stron. */
export function compareExtraRows(
  entries: { indicator: Indicator; values: IndicatorValues }[],
  a: Unit,
  b: Unit,
  year?: number | null,
): CompareRow[] {
  const rows: CompareRow[] = [];
  for (const e of entries) {
    const row = compareExtraRow(e.indicator, e.values, a, b, year);
    if (row) rows.push(row);
  }
  return rows;
}
