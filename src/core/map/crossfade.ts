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
  /** Przezroczystość starej warstwy 0..1: gaśnie, gdy nowa wjeżdża (symetrycznie w dół i w górę). */
  outgoing: number;
  next: CrossfadeState;
};

export const initialCrossfade: CrossfadeState = { key: null, waiting: false };

/** Łagodne przyspieszenie i hamowanie (easeInOutCubic). */
export function easeInOut(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * @param progress postęp animacji odsłaniania 0..1 (z useChoropleth)
 * @param speedup ile razy przenikanie jest szybsze od odsłaniania (np. 900 ms / 300 ms = 3)
 */
export function stepCrossfade(
  state: CrossfadeState,
  key: string,
  progress: number,
  reducedMotion: boolean,
  speedup = 1
): CrossfadeFrame {
  if (state.key === null || reducedMotion) {
    return { incoming: 1, showOutgoing: false, outgoing: 0, next: { key, waiting: false } };
  }

  let waiting = state.waiting;
  if (state.key !== key) waiting = true;
  // Postęp spadł poniżej 1 = animacja ruszyła, od teraz wierzymy postępowi.
  if (waiting && progress < 1) waiting = false;

  if (waiting) {
    return { incoming: 0, showOutgoing: true, outgoing: 1, next: { key, waiting: true } };
  }
  // Oczekiwanie kończy surowy postęp (< 1), a przenikanie biegnie szybciej od odsłaniania.
  const fade = Math.min(1, Math.max(0, progress * Math.max(1, speedup)));
  const incoming = easeInOut(fade);
  const showOutgoing = fade < 1;
  return {
    incoming,
    showOutgoing,
    outgoing: showOutgoing ? 1 - incoming : 0,
    next: { key, waiting: false },
  };
}

/**
 * Czy wolno przenikać dwie warstwy naraz. Na ekranach dotykowych (pointer: coarse) rysujemy
 * jedną warstwę: telefony (Safari, iPhone) łamały shadery przy dwóch warstwach i przejściach.
 */
export function crossfadeEnabled(opts: {
  reducedMotion: boolean;
  coarsePointer: boolean;
  testMode: boolean;
}): boolean {
  return !opts.reducedMotion && !opts.coarsePointer && !opts.testMode;
}

export type CrossfadeLayerSpec = {
  id: string;
  role: 'outgoing' | 'incoming';
  opacity: number;
  pickable: boolean;
};

/** Lista warstw do narysowania (stara pod spodem, nowa na wierzchu); id zawsze unikalne. */
export function crossfadeLayers(baseId: string, frame: CrossfadeFrame, hasOutgoing: boolean): CrossfadeLayerSpec[] {
  const top: CrossfadeLayerSpec = { id: baseId, role: 'incoming', opacity: frame.incoming, pickable: true };
  if (!hasOutgoing || !frame.showOutgoing) return [{ ...top, opacity: hasOutgoing ? frame.incoming : 1 }];
  return [{ id: `${baseId}-out`, role: 'outgoing', opacity: frame.outgoing, pickable: false }, top];
}
