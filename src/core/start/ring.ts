// Karuzela w nieskończoność: pozycje liczone modulo, a na ekranie tylko okno wokół zaznaczonej (biblioteka to tysiące wskaźników).

/** Pozycja po „zawinięciu”: za ostatnią jest pierwsza, przed pierwszą ostatnia. Pusty pierścień = 0. */
export const wrapIndex = (i: number, size: number): number => (size > 0 ? ((i % size) + size) % size : 0);

export interface RingSlot {
  /** Przesunięcie względem zaznaczonej (0 = zaznaczona). */
  offset: number;
  /** Pozycja w całej liście. */
  index: number;
}

/**
 * Okno pierścienia: do `radius` pozycji z każdej strony zaznaczonej; przy małym pierścieniu bez powtórzeń
 * (pozycja nie pojawia się dwa razy).
 */
export function ringWindow(size: number, active: number, radius: number): RingSlot[] {
  if (size <= 0) return [];
  const left = Math.min(radius, Math.floor((size - 1) / 2));
  const right = Math.min(radius, size - 1 - left);
  const out: RingSlot[] = [];
  for (let offset = -left; offset <= right; offset++) out.push({ offset: offset + 0, index: wrapIndex(active + offset, size) });
  return out;
}
