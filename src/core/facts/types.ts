// Typy silnika faktów (W26-F01, docs/KONCEPT-ODKRYCIA.md §3–§4).
// Fakt to rekord danych, nie tekst: zdanie składa się w kodzie ze stałego szablonu (sentences.ts).

export type Level = 'woj' | 'pow' | 'gmi';

/** F1 kraj · F2 województwo · F4 zmiana 10 lat · F5 rekord względny · F9 typowość. */
export type FactType = 'F1' | 'F2' | 'F4' | 'F5' | 'F9';

/** Rama porównania – wynika z typu, ale jest w rekordzie, bo od niej zależy waga. */
export type Frame = 'kraj' | 'wojewodztwo' | 'zmiana' | 'rekord' | 'typowosc';

export const FRAME_BY_TYPE: Record<FactType, Frame> = {
  F1: 'kraj',
  F2: 'wojewodztwo',
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

/** Typowość (F9): mediana poziomu i percentyl jednostki (0–100). */
export interface TypicalCompare {
  kind: 'typical';
  median: number;
  percentile: number;
}

export type FactCompare = RankCompare | ChangeCompare | RecordCompare | TypicalCompare;

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
  calendar: Record<string, string>;
  calendarBoost: number;
  trendBoost: Record<string, number>;
  start: {
    dailyCount: number;
    lists: { indicatorId: string; level: Level; dir: Direction }[];
  };
}

export interface FactsInput {
  indicators: FactIndicator[];
  values: Record<string, IndicatorValues>;
  units: FactUnit[];
  config: FactsConfig;
}
