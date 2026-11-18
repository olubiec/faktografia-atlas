// Stan diagnostyczny koloru wypełnienia (szew testowy). Przejść GPU atrybutów nie ma:
// animację liczy getter koloru na CPU (fill-blend.ts), więc czas przejścia warstwy to zawsze 0.

let lastKey = '';
let layerTransitions: Array<{ id: string; transitionMs: number }> = [];

/** Zapamiętuje klucz danych warstwy (poziom) i największy czas przejścia GPU jej atrybutów. */
export function noteFillLayer(id: string, dataKey: string, transitions: Record<string, unknown> | undefined): void {
  lastKey = dataKey;
  const ms = Math.max(0, ...Object.values(transitions ?? {}).map((v) => (typeof v === 'number' ? v : 0)));
  layerTransitions = [...layerTransitions.filter((l) => l.id !== id), { id, transitionMs: ms }];
}

/** Ostatni stan (szew testowy): `ms` jest zawsze 0. */
export function getFillTransitionState(): { ms: number; dataKey: string } {
  return { ms: 0, dataKey: lastKey };
}

export function getLayerTransitions(): Array<{ id: string; transitionMs: number }> {
  return layerTransitions;
}

/** Zeruje pamięć modułu (testy). */
export function resetFillTransition(): void {
  lastKey = '';
  layerTransitions = [];
}
