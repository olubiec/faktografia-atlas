// Płynne przejście między poziomami (województwa → powiaty → gminy i z powrotem).
// Nowa warstwa wjeżdża przezroczystością nad starą, a stara znika dopiero po końcu animacji,
// więc mapa nigdy nie ma „dziury” ani skoku. Czyste funkcje, bez Reacta.

export type CrossfadeState = {
  /** Klucz zakresu (poziom + aktywne województwo + powiat) ostatnio narysowany. */
  key: string | null;
  /** Zakres zmienił się, ale animacja jeszcze nie ruszyła (postęp wciąż 1 z poprzedniej). */
  waiting: boolean;
};

export type CrossfadeFrame = {
  /** Przezroczystość nowej warstwy 0..1. */
  incoming: number;
  /** Czy rysować jeszcze starą warstwę pod spodem. */
  showOutgoing: boolean;
  next: CrossfadeState;
};

export const initialCrossfade: CrossfadeState = { key: null, waiting: false };

/** Łagodne przyspieszenie i hamowanie (easeInOutCubic). */
export function easeInOut(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function stepCrossfade(
  state: CrossfadeState,
  key: string,
  progress: number,
  reducedMotion: boolean
): CrossfadeFrame {
  if (state.key === null || reducedMotion) {
    return { incoming: 1, showOutgoing: false, next: { key, waiting: false } };
  }

  let waiting = state.waiting;
  if (state.key !== key) waiting = true;
  // Postęp spadł poniżej 1 = animacja ruszyła, od teraz wierzymy postępowi.
  if (waiting && progress < 1) waiting = false;

  if (waiting) {
    return { incoming: 0, showOutgoing: true, next: { key, waiting: true } };
  }
  return {
    incoming: easeInOut(progress),
    showOutgoing: progress < 1,
    next: { key, waiting: false },
  };
}
