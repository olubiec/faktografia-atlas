// Zapis listy „Moje wskaźniki” w pamięci przeglądarki. Każdy dostęp w try/catch:
// tryb prywatny lub zablokowane dane strony nie mogą psuć ekranu (wtedy lista jest podstawowa).
import { defaultMyIndicators, type MyIndicators } from './my-indicators';

export const MY_INDICATORS_KEY = 'faktografia-my-indicators';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function browserStorage(): StorageLike | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/** Czyta listę; brak wpisu, błąd odczytu lub zły format = lista podstawowa. */
export function loadMyIndicators(storage: StorageLike | null = browserStorage()): MyIndicators {
  try {
    const raw = storage?.getItem(MY_INDICATORS_KEY);
    if (!raw) return defaultMyIndicators();
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) {
      return [...new Set(parsed as string[])];
    }
  } catch {
    // zły JSON lub brak dostępu – wracamy do podstawowej
  }
  return defaultMyIndicators();
}

/** Zapisuje listę (tylko identyfikatory); błąd zapisu jest ignorowany. */
export function saveMyIndicators(list: MyIndicators, storage: StorageLike | null = browserStorage()): void {
  try {
    storage?.setItem(MY_INDICATORS_KEY, JSON.stringify(list));
  } catch {
    // brak miejsca lub zablokowany zapis – zmiana działa do końca wizyty
  }
}
