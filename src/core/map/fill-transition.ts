// Decyzja o przejściu koloru wypełnienia mapy.
// deck.gl paruje wierzchołki starych i nowych danych po indeksie, więc przy zmianie zestawu
// wielokątów (inny poziom) interpolacja dawałaby promieniste gradienty. Wtedy przejście = 0.

let lastKey: string | null = null;
let lastMs = 0;

/** Zwraca czas przejścia: 0 przy pierwszym wywołaniu i zmianie klucza, inaczej baseMs. */
export function resolveFillTransition(dataKey: string, baseMs: number): { ms: number; changed: boolean } {
  const changed = lastKey !== dataKey;
  lastKey = dataKey;
  lastMs = changed ? 0 : baseMs;
  return { ms: lastMs, changed };
}

/** Ostatnia decyzja (szew testowy). */
export function getFillTransitionState(): { ms: number; dataKey: string } {
  return { ms: lastMs, dataKey: lastKey ?? '' };
}

/** Zeruje pamięć modułu (testy). */
export function resetFillTransition(): void {
  lastKey = null;
  lastMs = 0;
}
