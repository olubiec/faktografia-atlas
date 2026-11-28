// Typy pliku percentyli (W31-O01), osobno ze względu na limit linii types.ts.

/**
 * W31-O01: percentyle gmin w pliku województwa (zwarty zapis).
 * `u[teryt]` – jeden znak na wskaźnik (kolejność `ind`): kod 0x100 + percentyl; spacja = brak wartości.
 * `r[teryt]` – [indeks wskaźnika, stosunek do mediany, …] tylko dwa najdalsze od mediany, i tylko gdy stosunek ≥ 2 albo ≤ 0,5 (reszta „typowa”; zeroGuard: brak).
 */
export interface PercentileShard {
  ind: string[];
  /** Rok danych użyty dla wskaźnika (kolejność jak `ind`). */
  y: number[];
  u: Record<string, string>;
  r?: Record<string, number[]>;
  /** [indeks wskaźnika, wartość, …] – tylko kandydaci do kart ról (potrzebne do zdania w ludzkiej skali). */
  v?: Record<string, number[]>;
  /** Największe zmiany w oknie (10 lat): 3 × [indeks wskaźnika, wartość z początku okna, zmiana względna, percentyl zmiany]. */
  c?: Record<string, number[]>;
}

/** Histogram rozkładu wskaźnika wśród gmin kraju: równe przedziały między 1. a 99. percentylem. */
export interface DistEntry {
  m: number;
  lo: number;
  hi: number;
  b: number[];
}
