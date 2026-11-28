// Pytanie przed wynikiem (W34-O09, docs/KONCEPT-ODKRYCIA-V2.md §3): trzy odpowiedzi, jedna poprawna na stabilnej pozycji.
// Bez punktów, odznak i zapisu: stan żyje tylko w komponencie.

export interface GuessInput {
  teryt: string;
  /** Podmiot pytania w mianowniku, np. „Czytelnicy bibliotek publicznych”. */
  subject: string;
  /** „Gmina Maszewo”, „gminie Maszewo” – gotowy człon do zdania („w gminie Maszewo”). */
  placePhrase: string;
  value: number;
  unit: string;
}

export interface GuessOption {
  label: string;
  correct: boolean;
}

export interface Guess {
  question: string;
  options: GuessOption[];
}

const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);

/** Zaokrągla do „ładnej” liczby (1 cyfra znacząca, a dla ≥ 20 – 2 cyfry nie, np. 31 zostaje 31 tylko dla prawdziwej wartości). */
const nice = (n: number) => {
  const p = 10 ** Math.floor(Math.log10(Math.max(n, 1)));
  return Math.max(1, Math.round(n / p) * p);
};

const base = (unit: string) => (/na 10 tys/.test(unit) ? 10000 : /na 1000/.test(unit) ? 1000 : null);

/** Trzy odpowiedzi „1 na N” albo procenty; null, gdy skala nie pasuje (karta bez pytania). */
export function buildGuess(i: GuessInput): Guess | null {
  const seed = hash(i.teryt);
  let labels: string[];
  let correct: string;
  const b = base(i.unit);
  if (b !== null && i.value > 0 && i.value / b < 0.5) {
    const n = Math.round(b / i.value);
    correct = `1 na ${n}`;
    const wrong = [...new Set([nice(n / 3), nice(n * 3), nice(n / 10), nice(n * 10)])].filter((x) => x !== n && x >= 1);
    if (wrong.length < 2) return null;
    // Dwa zniekształcenia o różnym kierunku, jeśli się da: bliższe i dalsze.
    const near = wrong.sort((x, y) => Math.abs(Math.log(x / n)) - Math.abs(Math.log(y / n)));
    labels = [correct, `1 na ${near[0]}`, `1 na ${near[near.length > 2 ? 2 : 1]}`];
  } else if (i.unit === '%' && i.value > 5 && i.value < 95) {
    const v = Math.round(i.value);
    correct = `${v}%`;
    const up = Math.min(95, v + 25);
    const down = Math.max(5, v - 25);
    const alt = [...new Set([down, up, Math.round(v / 2), Math.min(95, v * 2)])].filter((x) => Math.abs(x - v) >= 10);
    if (alt.length < 2) return null;
    labels = [correct, `${alt[0]}%`, `${alt[alt.length - 1]}%`];
  } else {
    return null;
  }
  // Stabilna pozycja poprawnej odpowiedzi (z ziarna = TERYT) i stały porządek pozostałych.
  const pos = seed % 3;
  const rest = labels.slice(1);
  const ordered = [...rest.slice(0, pos), correct, ...rest.slice(pos)];
  const q = i.unit === '%' ? 'jaki to procent?' : 'jaka to część mieszkańców?';
  const lower = i.subject.charAt(0).toLowerCase() + i.subject.slice(1);
  return {
    question: `Zanim zobaczysz wynik: ${lower} w ${i.placePhrase} – ${q}`,
    options: ordered.map((label) => ({ label, correct: label === correct })),
  };
}

export type GuessState = { picked: number | null; shown: boolean };
export const guessStart: GuessState = { picked: null, shown: false };

/** Wybór odpowiedzi od razu odsłania wynik. */
export const pick = (_s: GuessState, index: number): GuessState => ({ picked: index, shown: true });
/** „Pokaż wynik” bez zgadywania. */
export const reveal = (s: GuessState): GuessState => ({ ...s, shown: true });
