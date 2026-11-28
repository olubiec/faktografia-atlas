// Typy silnika faktów (W26-F01, docs/KONCEPT-ODKRYCIA.md §3–§4).
// Fakt to rekord danych, nie tekst: zdanie składa się w kodzie ze stałego szablonu (sentences.ts).

export type Level = 'woj' | 'pow' | 'gmi';

/** F1 kraj · F2 województwo · F3 sąsiedzi · F4 zmiana 10 lat · F5 rekord względny · F9 typowość. */
export type FactType = 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F9';

/** Rama porównania – wynika z typu, ale jest w rekordzie, bo od niej zależy waga. */
export type Frame = 'kraj' | 'wojewodztwo' | 'sasiedzi' | 'zmiana' | 'rekord' | 'typowosc';

export const FRAME_BY_TYPE: Record<FactType, Frame> = {
  F1: 'kraj',
  F2: 'wojewodztwo',
  F3: 'sasiedzi',
  F4: 'zmiana',
  F5: 'rekord',
  F9: 'typowosc',
};

/** Kierunek: 1 – najwyżej, −1 – najniżej. */
export type Direction = 1 | -1;

/** Miejsce w rankingu (F1, F2): „3. najwyższa wartość z N”. */
export interface RankCompare {
  kind: 'rank';
  dir: Direction;
  rank: number;
  total: number;
  /** Remis na tym miejscu („ex aequo”). */
  tie: boolean;
}

/** Zmiana 10 lat (F4): wartość z początku okna i miejsce zmiany wśród jednostek poziomu. */
export interface ChangeCompare {
  kind: 'change';
  dir: Direction;
  rank: number;
  total: number;
  fromYear: number;
  fromValue: number;
}

/** Rekord względny (F5): najdalej od mediany kraju od początku serii. */
export interface RecordCompare {
  kind: 'record';
  dir: Direction;
  median: number;
  sinceYear: number;
}

/** Na tle sąsiadów (F3): wartość poza zakresem wszystkich sąsiadów (W26-F03). */
export interface NeighboursCompare {
  kind: 'neighbours';
  dir: Direction;
  /** Ilu sąsiadów ma wartość w tym roku. */
  count: number;
  min: number;
  max: number;
  /** Pierścień poszerzony o sąsiadów sąsiadów (jednostka miała < 4 sąsiadów, np. miasto w obwarzanku). */
  extended: boolean;
}

/** Typowość (F9): mediana poziomu i percentyl jednostki (0–100). */
export interface TypicalCompare {
  kind: 'typical';
  median: number;
  percentile: number;
}

export type FactCompare = RankCompare | ChangeCompare | NeighboursCompare | RecordCompare | TypicalCompare;

export interface Fact {
  type: FactType;
  teryt: string;
  indicatorId: string;
  /** Ostatni rok faktu (przy średniej 3-letniej – ostatni rok średniej). */
  year: number;
  value: number;
  frame: Frame;
  compare: FactCompare;
  strength: number;
  /** Ile lat uśredniono (małe gminy, wskaźniki „na 1000”); brak = jeden rok. */
  span?: number;
}

/** Wskaźnik – podzbiór config/indicators.json potrzebny silnikowi. */
export interface FactIndicator {
  id: string;
  name: string;
  unit: string;
  group: string;
  minLevel: Level;
}

/** Plik public/data/values/<id>.json (podzbiór). */
export interface IndicatorValues {
  /** Kiedy robot pobrał plik (ISO); brak w danych testowych. */
  fetchedAt?: string;
  years: number[];
  values: Record<string, (number | null)[]>;
}

export interface FactUnit {
  teryt: string;
  name: string;
  level: Level;
  parent: string | null;
}

/** config/facts.json */
export interface FactsConfig {
  frameWeights: Record<Frame, number>;
  indicatorWeights: Record<string, number>;
  defaultIndicatorWeight: number;
  freshness: { latest: number; older: number };
  thresholds: {
    nationalShare: number;
    voivodeshipTop: number;
    voivodeshipMinUnits: number;
    changeYears: number;
    changeShare: number;
    recordDeviation: number;
    recordMinYears: number;
    boundaryJump: number;
    smallPopulation: number;
    smallAverageYears: number;
    typicalBand: number;
  };
  rateUnits: string[];
  relativeChangeUnits: string[];
  absoluteIndicators: string[];
  changeExcluded: string[];
  recordExcluded: string[];
  selection: { count: number; perIndicator: number; perGroup: number };
  /** Miesiąc (1–12) → grupa tematu albo lista grup (W26-F05: właściciel może dopisać temat). */
  calendar: Record<string, string | string[]>;
  calendarBoost: number;
  /** Coroczne szczyty zainteresowania (W26-F05, calendar.ts): „MM-DD”, grupa, opis. */
  calendarPeaks?: { date: string; group: string; label: string }[];
  /** Strony „Nowe dane GUS” (W26-F05, news.ts): pozycje w tabelach i próg zmiany granic rok do roku. */
  news?: { rows: number; boundaryJump: number };
  trendBoost: Record<string, number>;
  /** Świeże dane (W27-D02, fresh.ts): ile dni wskaźnik jest świeży, mnożniki siły i dni Odkrycia dnia dla świeżych faktów. */
  fresh?: FreshConfig;
  start: {
    dailyCount: number;
    lists: { indicatorId: string; level: Level; dir: Direction }[];
    /** Dalsze slajdy karuzeli zestawień (facts-lists.json): poziom wynika z danych (gminy, a gdy ich brak, powiaty). */
    carousel?: { indicatorId: string; dir: Direction }[];
  };
  /** F3: najmniej sąsiadów z wartością; mniej bezpośrednich sąsiadów = pierścień z sąsiadami sąsiadów. */
  neighbours?: { min: number };
  /** W31-O01: reguły percentyli (zeroGuard: mediana 0 albo wartość 0 = brak stosunku do mediany). */
  percentiles?: { zeroGuard: boolean; bins: number; minUnits: number };
  /** F8: wskaźniki wektora podobieństwa (standaryzowane), te w skali logarytmicznej i minimalny udział wspólnych. */
  twin?: { indicators: string[]; log: string[]; minShare: number };
}

export interface FreshConfig {
  days: number;
  boost: number;
  extremeBoost: number;
  dailySlots: number;
}

/** Pierścień sąsiadów jednostki (ten sam poziom). */
export interface NeighbourRing {
  ids: string[];
  extended: boolean;
}

/** F8 – bliźniak: najbliższa jednostka tego samego poziomu w innym województwie. Relacja, nie ranking. */
export interface TwinFact {
  type: 'F8';
  teryt: string;
  twin: string;
  /** Najczęstszy rok danych w wektorze. */
  year: number;
  /** Ile wskaźników porównano. */
  dims: number;
  /** Odległość (średnia kwadratowa różnic odchyleń standardowych). */
  distance: number;
}

export interface FactsInput {
  indicators: FactIndicator[];
  values: Record<string, IndicatorValues>;
  units: FactUnit[];
  config: FactsConfig;
  /** Pierścienie sąsiadów z topologii (W26-F03); brak = bez faktów F3. */
  neighbours?: Record<string, NeighbourRing>;
  /** Świeże wskaźniki (W27-D02): id → ostatni rok z danymi; brak = nic nie jest świeże. */
  fresh?: Record<string, number>;
}
