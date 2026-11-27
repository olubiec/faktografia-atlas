// Rejestr wskaźników budowany raz na wczytany spis, nie przy każdym renderze: z biblioteką (tysiące pozycji, sortowanie
// po polsku, normalizacja nazw) jedno zbudowanie trwa setki milisekund, a panel startowy pytał o nie dziesiątki razy.
import type { Indicator } from '../profile/profile';
import { buildRegistry, type AvailableFile, type Registry } from './registry';

let lastMain: Indicator[] | null = null;
let lastAvailable: AvailableFile | null = null;
let last: Registry | null = null;

/** Rejestr dla danych wskaźników głównych i spisu; ten sam wynik, dopóki oba wejścia są te same obiekty. */
export function sharedRegistry(main: Indicator[], available: AvailableFile | null): Registry {
  if (last && lastMain === main && lastAvailable === available) return last;
  last = buildRegistry(main, available);
  lastMain = main;
  lastAvailable = available;
  return last;
}
