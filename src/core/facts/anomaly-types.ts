// Typy pliku anomalii (panel „na tle Polski” z całej biblioteki GUS). Zapis zwarty, osobno ze względu na limit linii.
import type { DistEntry } from './percentile-types';

/** Wskaźnik użyty w pliku województwa: [id, nazwa, jednostka, rok, kierunek („u” wyższy lepszy, „d” niższy lepszy, „” brak), liczony z liczby mieszkańców (0/1), rozkład w kraju]. */
export type AnomalyMeta = [id: string, name: string, unit: string, year: number, valence: 'u' | 'd' | '', derived: 0 | 1, dist: DistEntry];

/**
 * `u[teryt]` – 4 liczby na wpis: [indeks w `m`, wartość, percentyl kraju, stosunek do mediany (0 = brak)]; najbardziej odstające pierwsze.
 * `c[teryt]` – 5 liczb: [indeks, wartość sprzed okna, wartość teraz, rok początku, percentyl zmiany].
 * `n[teryt]` – [TERYT sąsiada, indeks, wartość sąsiada, percentyl sąsiada, …] dla tych samych wskaźników, które wyróżniają gminę.
 */
export interface AnomalyShard {
  m: AnomalyMeta[];
  u: Record<string, number[]>;
  c: Record<string, number[]>;
  n: Record<string, (string | number)[]>;
}
