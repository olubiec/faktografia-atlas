// Kalibracja progów legendy: czytelne zaokrąglenie, które nie psuje podziału,
// oraz osobne klasy po obu stronach zera dla wskaźników, które bywają ujemne.
// Czysta logika, bez zależności od reszty map/classes (unikamy cyklu importów).
import { jenksBreaks, TAIL_MIN_SHARE, TAIL_SPAN } from './tail';

/** Maks. odsetek jednostek, które mogą zmienić klasę przez zaokrąglenie progów. */
export const MAX_SHIFT_SHARE = 0.2;

/** Najdokładniejsze zaokrąglenie, które jeszcze próbujemy (cyfry znaczące). */
const MAX_DIGITS = 7;

/** Od takiego odsetka dokładnych zer zero dostaje własną, neutralną klasę (schemat rozbieżny). */
export const ZERO_CLASS_SHARE = 0.1;

/** Górna granica klasy „dokładnie 0”: [0, ZERO_EDGE) mieści tylko zero. */
export const ZERO_EDGE = Number.MIN_VALUE;

/** Usuwa powtórzone progi i progi nie większe od minimum danych. */
export function cleanBreaks(breaks: number[], min: number): number[] {
  const out: number[] = [];
  for (const b of breaks) {
    if (b > min && (out.length === 0 || b > out[out.length - 1])) out.push(b);
  }
  return out;
}

/** Zaokrąglenie do `digits` cyfr znaczących (bez śmieci zmiennoprzecinkowych). */
export function roundSignificant(b: number, digits: number): number {
  if (b === 0 || !Number.isFinite(b)) return b;
  const decimals = digits - 1 - Math.floor(Math.log10(Math.abs(b)));
  const factor = 10 ** decimals;
  const r = Math.round(b * factor) / factor;
  return decimals > 0 ? Number(r.toFixed(Math.min(decimals, 20))) : r;
}

/** Liczba wartości w każdej klasie (klasa = liczba progów ≤ wartość). */
export function classCounts(values: number[], breaks: number[]): number[] {
  const counts = new Array<number>(breaks.length + 1).fill(0);
  for (const v of values) {
    let i = 0;
    while (i < breaks.length && v >= breaks[i]) i++;
    counts[i]++;
  }
  return counts;
}

const emptyClasses = (counts: number[]) => counts.filter((c) => c === 0).length;

/**
 * Zaokrągla progi możliwie krótko (od 2 cyfr znaczących w górę), ale tylko tak,
 * żeby legenda nadal mówiła prawdę: tyle samo klas co przed zaokrągleniem, żadnej
 * nowej pustej klasy i co najwyżej MAX_SHIFT_SHARE jednostek w innej klasie.
 * Gdy wszystkie wartości są całkowite, progi też są całkowite.
 */
export function calibrateBreaks(raw: number[], valid: number[]): number[] {
  if (valid.length === 0 || raw.length === 0) return raw;
  return roundestBreaks(raw, valid, safeCalibrate(raw, valid));
}

/** Dodatkowy zapas przesunięcia jednostek (ułamek), za który wolno uzyskać okrąglejszy próg. */
export const ROUNDER_SHIFT_SHARE = 0.04;

/** Największa względna zmiana progu przy okrąglaniu (46 207 → 46 000 tak, → 50 000 nie). */
export const ROUNDER_MAX_REL = 0.05;

/**
 * Każdy próg po kolei zastępuje najokrąglejszą liczbą (1, potem 2 cyfry znaczące), jeśli klasy nadal
 * są rosnące i niepuste, a do przesunięcia jednostek dochodzi co najwyżej ROUNDER_SHIFT_SHARE.
 * Wąski rozrzut, w którym okrągły próg zlałby klasy, zostaje przy dokładniejszych liczbach.
 */
function roundestBreaks(raw: number[], valid: number[], start: number[]): number[] {
  const min = Math.min(...valid);
  const integers = valid.every((v) => Number.isInteger(v));
  const base = cleanBreaks(raw, min);
  if (start.length !== base.length) return start;
  const baseCounts = classCounts(valid, base);
  const shiftOf = (counts: number[]) => counts.reduce((s, c, i) => s + Math.abs(c - baseCounts[i]), 0) / 2;
  const out = [...start];
  let shifted = shiftOf(classCounts(valid, out));
  const limit = Math.max(shifted, 0) + valid.length * ROUNDER_SHIFT_SHARE;
  for (let i = 0; i < out.length; i++) {
    // Kandydaci tylko z surowego progu (jak dotąd): najpierw 1 cyfra znacząca, potem 2.
    for (let digits = 1; digits <= 2; digits++) {
      const r = roundSignificant(base[i], digits);
      const cand = integers ? Math.round(r) : r;
      if (cand === out[i]) break;
      // Okrąglenie nie może odjechać od surowego progu o więcej niż ROUNDER_MAX_REL.
      if (Math.abs(cand - base[i]) > Math.abs(base[i]) * ROUNDER_MAX_REL) continue;
      const trial = [...out];
      trial[i] = cand;
      if (!trial.every((b, j) => (j === 0 ? b > min : b > trial[j - 1]))) continue;
      const current = classCounts(valid, out);
      const counts = classCounts(valid, trial);
      if (emptyClasses(counts) > emptyClasses(baseCounts)) continue;
      const s = shiftOf(counts);
      // Jeden krok może przesunąć tylko garstkę jednostek (przy małych zbiorach: żadnej).
      const step = counts.reduce((t, c, j) => t + Math.abs(c - current[j]), 0) / 2;
      if (s > limit || step > Math.floor(valid.length * ROUNDER_SHIFT_SHARE)) continue;
      out[i] = cand;
      shifted = s;
      break;
    }
  }
  return out;
}

function safeCalibrate(raw: number[], valid: number[]): number[] {
  const min = Math.min(...valid);
  const integers = valid.every((v) => Number.isInteger(v));
  const base = cleanBreaks(raw, min);
  const baseCounts = classCounts(valid, base);
  // Gdy żadne zaokrąglenie nie spełnia progu przesunięcia, bierzemy to, które przesuwa najmniej.
  let best: { breaks: number[]; shifted: number } | null = null;
  for (let digits = 2; digits <= MAX_DIGITS; digits++) {
    const rounded = cleanBreaks(
      raw.map((b) => (integers ? Math.round(roundSignificant(b, digits)) : roundSignificant(b, digits))),
      min
    );
    if (rounded.length !== base.length) continue;
    const counts = classCounts(valid, rounded);
    if (emptyClasses(counts) > emptyClasses(baseCounts)) continue;
    const shifted = counts.reduce((s, c, i) => s + Math.abs(c - baseCounts[i]), 0) / 2;
    if (shifted <= valid.length * MAX_SHIFT_SHARE) return rounded;
    if (!best || shifted < best.shifted) best = { breaks: rounded, shifted };
  }
  return best?.breaks ?? base;
}

/** Mediana posortowanej rosnąco tablicy (interpolowana jak kwantyl). */
function median(sorted: number[]): number {
  const pos = (sorted.length - 1) / 2;
  const lo = Math.floor(pos);
  return lo + 1 < sorted.length ? sorted[lo] + (pos - lo) * (sorted[lo + 1] - sorted[lo]) : sorted[lo];
}

/** Jeden próg dzielący stronę na „mocniej” i „słabiej”, albo nic, gdy się nie da. */
function sideBreak(side: number[]): number[] {
  const sorted = [...side].sort((a, b) => a - b);
  if (sorted[0] === sorted[sorted.length - 1]) return [];
  // Jak w kwantylach: wartości równe minimum (np. zera) nie powinny same tworzyć klasy.
  const m = median(sorted);
  let raw = m > sorted[0] ? m : sorted.find((v) => v > sorted[0])!;
  // Ogon po tej stronie zera (kilka skrajnych wartości): próg w naturalnej przerwie zamiast mediany.
  const range = sorted[sorted.length - 1] - sorted[0];
  const stretched = (sorted[sorted.length - 1] - raw) / range > TAIL_SPAN || (raw - sorted[0]) / range > TAIL_SPAN;
  if (stretched) {
    const natural = jenksBreaks(sorted, 2, Math.max(1, Math.floor(sorted.length * TAIL_MIN_SHARE)));
    if (natural.length === 1 && natural[0] > sorted[0]) raw = natural[0];
  }
  return calibrateBreaks([raw], sorted);
}

/**
 * Progi dla wskaźnika z wartościami ujemnymi i dodatnimi (np. saldo migracji):
 * zero jest zawsze granicą klas, po każdej stronie 1–2 klasy (podział medianą).
 * Wynik: [próg ujemny?, 0, próg dodatni?]. Zero trafia do klasy „od 0”, a gdy dokładnych
 * zer jest dużo (np. saldo migracji zagranicznych w małych gminach) – do własnej klasy „0”.
 */
export function divergingBreaks(valid: number[]): number[] {
  const negative = valid.filter((v) => v < 0);
  const positive = valid.filter((v) => v > 0);
  const zeros = valid.length - negative.length - positive.length;
  const zeroClass = zeros >= valid.length * ZERO_CLASS_SHARE ? [ZERO_EDGE] : [];
  return [...sideBreak(negative), 0, ...zeroClass, ...sideBreak(positive)];
}

/** Czy klasa o indeksie `index` to klasa „dokładnie 0”. */
export function isZeroClass(index: number, breaks: number[]): boolean {
  return breaks[index - 1] === 0 && breaks[index] === ZERO_EDGE;
}

/**
 * Kolory schematu rozbieżnego: ujemne – ciepłe (div-1, div-2), dodatnie – chłodne (div-4, div-5),
 * klasa „dokładnie 0” – neutralna (div-3).
 */
export function divergingToken(index: number, breaks: number[]): string | null {
  const zero = breaks.indexOf(0);
  if (zero < 0) return null;
  if (isZeroClass(index, breaks)) return '--div-3';
  const negClasses = zero + 1;
  const firstPos = breaks[zero + 1] === ZERO_EDGE ? negClasses + 1 : negClasses;
  const posClasses = breaks.length + 1 - firstPos;
  if (index < negClasses) {
    const fromZero = negClasses - 1 - index;
    return negClasses === 1 || fromZero > 0 ? '--div-1' : '--div-2';
  }
  const fromZero = index - firstPos;
  return posClasses === 1 || fromZero > 0 ? '--div-5' : '--div-4';
}
