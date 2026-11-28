// Kształt pliku library/kalendarium-dni.json (zapisuje go robot scripts/data/calendar-board.mjs).
export type ItemState = 'downloaded' | 'waiting' | 'planned';

export interface DayItem {
  name: string;
  state: ItemState;
  /** Data pobrania (downloaded) albo od kiedy czeka (waiting). */
  on?: string;
  mapUrl?: string;
}

export interface DayPublication {
  title: string;
  gusUrl: string;
  counts: Record<ItemState, number>;
  items: DayItem[];
  /** Ile nazw zmiennych nie zmieściło się w pliku (limit rozmiaru). */
  more?: number;
}

export interface DayMedia {
  sentence: string;
  value: string;
  source: string;
  mapUrl: string;
}

export interface DayData {
  publications: DayPublication[];
  media: DayMedia[];
}

export interface KalendariumDni {
  updated: string;
  days: Record<string, DayData>;
}

/** Jedna komórka siatki miesiąca. */
export interface GridCell {
  iso: string;
  day: number;
  inMonth: boolean;
}
