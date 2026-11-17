import { getUnit } from '../units/units';
import type { UnitIndex } from '../units/types';

/** Para porównywanych miejsc (kody TERYT jako string). */
export type ComparePair = { a: string | null; b: string | null };

const clean = (value: string | undefined, index?: UnitIndex): string | null => {
  const code = value?.trim();
  if (!code) return null;
  if (index && !getUnit(index, code)) return null;
  return code;
};

/** Odczyt `?c=a,b`: `?c=14` = tylko A, `?c=,14` = tylko B, nadmiar ignorowany. */
export function readComparePair(search: string, index?: UnitIndex): ComparePair {
  const raw = new URLSearchParams(search).get('c');
  if (!raw) return { a: null, b: null };
  const [pa, pb] = raw.split(',');
  const a = clean(pa, index);
  let b = clean(pb, index);
  if (a !== null && a === b) b = null;
  return { a, b };
}

/** Zapis pary do query stringa; `''`, gdy oba miejsca puste. */
export function writeCompareSearch(pair: ComparePair): string {
  if (pair.a === null && pair.b === null) return '';
  if (pair.b === null) return `?c=${pair.a}`;
  return `?c=${pair.a ?? ''},${pair.b}`;
}

/** Ustawia A; jeśli to miejsce jest już jako B, zamienia strony. */
export function setA(pair: ComparePair, teryt: string): ComparePair {
  return pair.b === teryt ? { a: teryt, b: pair.a } : { a: teryt, b: pair.b };
}

/** Ustawia B; jeśli to miejsce jest już jako A, zamienia strony. */
export function setB(pair: ComparePair, teryt: string): ComparePair {
  return pair.a === teryt ? { a: pair.b, b: teryt } : { a: pair.a, b: teryt };
}

/** Zamiana A↔B. */
export function swapPair(pair: ComparePair): ComparePair {
  return { a: pair.b, b: pair.a };
}

/** Czyści wskazane miejsce pary. */
export function clearSlot(pair: ComparePair, slot: 'a' | 'b'): ComparePair {
  return { ...pair, [slot]: null };
}

/** `true`, gdy oba miejsca są znane i mają różny poziom (dopisek „różne poziomy”). */
export function levelsDiffer(pair: ComparePair, index: UnitIndex): boolean {
  if (pair.a === null || pair.b === null) return false;
  const ua = getUnit(index, pair.a);
  const ub = getUnit(index, pair.b);
  return !!ua && !!ub && ua.level !== ub.level;
}
