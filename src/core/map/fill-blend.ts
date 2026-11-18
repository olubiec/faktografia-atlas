// Czyste funkcje animacji koloru wypełnienia liczonej na CPU (bez przejść GPU atrybutów).

export type Rgba = [number, number, number, number];

const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);

/** Krzywa wyhamowania na końcu (0..1). */
export function easeOutCubic(t: number): number {
  const x = clamp01(t);
  return 1 - (1 - x) ** 3;
}

/** Liniowa mieszanka dwóch kolorów RGBA; t poza 0..1 jest obcinane. */
export function blendRgba(a: ArrayLike<number>, b: ArrayLike<number>, t: number): Rgba {
  const k = clamp01(t);
  const ch = (i: number) => Math.round((a[i] ?? 255) + ((b[i] ?? 255) - (a[i] ?? 255)) * k);
  return [ch(0), ch(1), ch(2), ch(3)];
}

/**
 * Alfa jednostki podczas wejścia: minAlpha przed `delay`, potem gładko do 255 w `duration` ms.
 * Przy ograniczonym ruchu zawsze pełna.
 */
export function unitAlpha(
  elapsedMs: number,
  delay: number,
  duration: number,
  minAlpha = 64,
  reducedMotion = false,
): number {
  if (reducedMotion) return 255;
  const t = duration <= 0 ? (elapsedMs >= delay ? 1 : 0) : clamp01((elapsedMs - delay) / duration);
  return Math.round(minAlpha + (255 - minAlpha) * easeOutCubic(t));
}

/** Pamięć kolorów docelowych z poprzedniego klucza danych (wskaźnik:rok:poziom), po TERYT. */
export type ColorMemory = {
  key: string | null;
  prev: Map<string, ArrayLike<number>>;
  cur: Map<string, ArrayLike<number>>;
};

export function createColorMemory(): ColorMemory {
  return { key: null, prev: new Map(), cur: new Map() };
}

/** Przy zmianie klucza obecne kolory stają się „poprzednimi”; ten sam klucz nic nie zmienia. */
export function advanceColorMemory(mem: ColorMemory, key: string): void {
  if (mem.key === key) return;
  mem.prev = mem.cur;
  mem.cur = new Map();
  mem.key = key;
}
