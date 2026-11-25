import { legendBreaks } from '../map/classes';
import { formatValue } from '../format/number';

export type Severity = 'error' | 'warning';

export interface Finding {
  rule: string;
  severity: Severity;
  message: string;
}

/** Jeden poziom jednego wskaźnika z biblioteki: lata i wiersze (kod jednostki → wartości po latach). */
export interface LevelData {
  years: number[];
  rows: Record<string, (number | null)[]>;
}

export interface CheckInput {
  varId: string;
  unit: string;
  level: string;
  data: LevelData;
}

const f = (rule: string, severity: Severity, message: string): Finding => ({ rule, severity, message });

/** Reguły spójności danych. Czyste funkcje: dane wejściowe → lista ustaleń. */
export function checkLevel({ unit, data }: CheckInput): Finding[] {
  const out: Finding[] = [];
  const { years, rows } = data;
  const codes = Object.keys(rows);
  if (years.length === 0 || codes.length === 0) {
    return [f('EMPTY_LEVEL', 'warning', 'brak lat lub jednostek')];
  }
  let badLen = 0;
  let nonFinite = 0;
  for (const c of codes) {
    const row = rows[c];
    if (row.length !== years.length) badLen++;
    for (const v of row) if (v !== null && !Number.isFinite(v)) nonFinite++;
  }
  if (badLen) out.push(f('ROW_LEN_NE_YEARS', 'error', `${badLen} wierszy ma długość inną niż liczba lat`));
  if (nonFinite) out.push(f('DATA_NONFINITE', 'error', `${nonFinite} wartości nie jest skończoną liczbą`));

  const last = years.length - 1;
  const lastValues = codes.map((c) => rows[c][last]).filter((v): v is number => v !== null && v !== undefined && Number.isFinite(v));
  if (lastValues.length === 0) {
    out.push(f('EMPTY_LAST_YEAR', 'warning', `brak wartości w ostatnim roku (${years[last]})`));
    return out;
  }
  // Te same progi co legenda na stronie; przy wartościach po obu stronach zera pełna legenda ma 4 klasy.
  const breaks = legendBreaks(lastValues);
  const fullClasses = breaks.includes(0) && lastValues.some((v) => v < 0) ? 3 : 4;
  if (breaks.length === 0) out.push(f('LEGEND_ONE_CLASS', 'warning', 'wszystkie wartości równe: mapa w jednym kolorze'));
  else if (breaks.length < fullClasses) out.push(f('LEGEND_FEW_CLASSES', 'warning', `legenda ma tylko ${breaks.length + 1} klasy`));

  const nonZero = lastValues.filter((v) => v !== 0);
  const fakeZero = nonZero.filter((v) => /^-?0([,.]0+)?( |$)/.test(formatValue(v, unit))).length;
  if (fakeZero) out.push(f('DISPLAY_NONZERO_AS_ZERO', 'warning', `${fakeZero} niezerowych wartości wyświetla się jak zero`));
  const negative = lastValues.filter((v) => v < 0).length;
  if (negative && /osob|szt|ob\.|gosp/i.test(unit)) out.push(f('NEGATIVE_COUNT', 'warning', `${negative} ujemnych liczności`));
  const over100 = lastValues.filter((v) => v > 100).length;
  if (unit.trim() === '%' && over100) out.push(f('PERCENT_OVER_100', 'warning', `${over100} wartości % powyżej 100 (sprawdź przypis)`));
  return out;
}
