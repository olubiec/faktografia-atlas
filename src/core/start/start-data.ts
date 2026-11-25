// Dane tła strony startowej: wartości czterech wskaźników (public/data/start.json) i ich klasy kolorów.
// Bez Reacta; sieć jest podawana z zewnątrz, żeby test mógł ją podmienić.
import { classColorToken, classify, legendBreaks } from '@/core/map/classes';

export const START_URL = '/data/start.json';
export const CLASS_COUNT = 5;

export type StartIndicator = {
  id: string;
  name: string;
  unit: string;
  year: number;
  /** Klucz = TERYT województwa (tekst, 2 cyfry). */
  values: Record<string, number>;
};
export type StartFile = { version: number; indicators: StartIndicator[] };

/** Pole mapy: województwo, jego wartość, klasa (0..4) i zmienna koloru. */
export type StartField = { teryt: string; name: string; value: number; cls: number; color: string };

// Nazwy województw są stałe (podział administracyjny), dzięki temu na `/` nie pobieramy units.json.
export const WOJ_NAMES: Record<string, string> = {
  '02': 'dolnośląskie',
  '04': 'kujawsko-pomorskie',
  '06': 'lubelskie',
  '08': 'lubuskie',
  '10': 'łódzkie',
  '12': 'małopolskie',
  '14': 'mazowieckie',
  '16': 'opolskie',
  '18': 'podkarpackie',
  '20': 'podlaskie',
  '22': 'pomorskie',
  '24': 'śląskie',
  '26': 'świętokrzyskie',
  '28': 'warmińsko-mazurskie',
  '30': 'wielkopolskie',
  '32': 'zachodniopomorskie',
};

// Krótkie nazwy do podpisu i opisu dla czytników ekranu.
const SHORT_LABELS: Record<string, string> = {
  population: 'Liczba ludności',
  'unemployment-rate': 'Stopa bezrobocia',
  'avg-wage': 'Przeciętne wynagrodzenie',
  density: 'Gęstość zaludnienia',
};

export function indicatorLabel(ind: StartIndicator): string {
  return SHORT_LABELS[ind.id] ?? ind.name;
}

/** 16 pól, każde w jednej z 5 klas (te same skalibrowane progi co legenda mapy), kolor jako `var(--seq-n)`. */
export function startFields(ind: StartIndicator): StartField[] {
  const breaks = legendBreaks(Object.values(ind.values), CLASS_COUNT);
  return Object.entries(ind.values).map(([teryt, value]) => {
    const cls = classify(value, breaks) as number;
    return {
      teryt,
      name: WOJ_NAMES[teryt] ?? teryt,
      value,
      cls,
      color: `var(${classColorToken(cls, breaks.length + 1, 'sequential', breaks)})`,
    };
  });
}

function formatValue(value: number, unit: string): string {
  const text = value.toLocaleString('pl-PL', { maximumFractionDigits: 1 });
  return unit === '%' ? `${text} %` : `${text} ${unit}`;
}

/** Podpis widoczny tylko, gdy animacja reaguje: „Stopa bezrobocia, 2025 · mazowieckie: 3,1 %”. */
export function captionFor(ind: StartIndicator, teryt: string): string | null {
  const value = ind.values[teryt];
  if (typeof value !== 'number') return null;
  const name = WOJ_NAMES[teryt] ?? teryt;
  return `${indicatorLabel(ind)}, ${ind.year} · ${name}: ${formatValue(value, ind.unit)}`;
}

/** Jedno żądanie: tylko start.json. */
export async function loadStart(fetchImpl: typeof fetch = (...a) => fetch(...a)): Promise<StartFile> {
  const res = await fetchImpl(START_URL);
  if (!res.ok) throw new Error(`Nie udało się wczytać ${START_URL}: HTTP ${res.status}`);
  return (await res.json()) as StartFile;
}
