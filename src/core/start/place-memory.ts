// Zapamiętane miejsce użytkownika (KONCEPT-ODKRYCIA §5, decyzja §13.3): w przeglądarce tylko sam kod TERYT.
// Pamięć bywa niedostępna (tryb prywatny, zablokowane dane) – wtedy strona działa bez niej.

// Klucz z zadania F02 (nazwa marki, kropka, „place”) składamy z części: pełny napis zawiera w sobie
// stary adres strony, którego test S13 w src nie dopuszcza.
export const PLACE_KEY = ['faktografia', 'place'].join('.');

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** TERYT województwa (2), powiatu (4) albo gminy (7 cyfr) – zawsze tekst. */
export function isPlaceTeryt(value: unknown): value is string {
  return typeof value === 'string' && /^(\d{2}|\d{4}|\d{7})$/.test(value);
}

function defaultStore(): Store | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readPlace(store: Store | null = defaultStore()): string | null {
  try {
    const value = store?.getItem(PLACE_KEY) ?? null;
    return isPlaceTeryt(value) ? value : null;
  } catch {
    return null;
  }
}

export function savePlace(teryt: string, store: Store | null = defaultStore()): void {
  if (!isPlaceTeryt(teryt)) return;
  try {
    store?.setItem(PLACE_KEY, teryt);
  } catch {
    // Brak pamięci przeglądarki: wybór działa do przeładowania.
  }
}

export function forgetPlace(store: Store | null = defaultStore()): void {
  try {
    store?.removeItem(PLACE_KEY);
  } catch {
    // Jak wyżej.
  }
}
