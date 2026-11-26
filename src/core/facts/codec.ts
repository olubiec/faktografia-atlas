// Zwarty zapis faktu w plikach public/data/facts/<WW>.json (krotka zamiast obiektu – mniejszy plik).
// [typ, wskaźnik, rok, wartość, siła, …porównanie, span?] – porównanie zależy od typu:
//   F1/F2: kierunek, miejsce, z ilu, remis(0/1) · F4: kierunek, miejsce, z ilu, rok początku, wartość początku
//   F3: kierunek, ilu sąsiadów, minimum, maksimum, pierścień poszerzony(0/1)
//   F5: kierunek, mediana, rok początku serii · F9: mediana, percentyl
// Opcjonalny ostatni element (W28-D06): 1 = fakt z najnowszego roku świeżego wskaźnika („Nowość”). Stare pliki go nie mają;
// gdy flaga jest, a span nie, w miejscu span stoi 0. Zapis: [..., porównanie, span|0, 1].
// Bliźniak (F8) to osobny rekord: ['F8', TERYT bliźniaka, rok, ile wskaźników, odległość].
import { FRAME_BY_TYPE, type Direction, type Fact, type FactCompare, type FactType, type TwinFact } from './types';

export type EncodedFact = (string | number)[];

/** Fakt z opcjonalną flagą nowości. */
export type FlaggedFact = Fact & { isNew?: boolean };

const round2 = (n: number) => Math.round(n * 100) / 100;

const COMPARE_LENGTH: Record<FactType, number> = { F1: 4, F2: 4, F3: 5, F4: 5, F5: 3, F9: 2 };

function encodeCompare(c: FactCompare): number[] {
  switch (c.kind) {
    case 'rank':
      return [c.dir, c.rank, c.total, c.tie ? 1 : 0];
    case 'change':
      return [c.dir, c.rank, c.total, c.fromYear, round2(c.fromValue)];
    case 'neighbours':
      return [c.dir, c.count, round2(c.min), round2(c.max), c.extended ? 1 : 0];
    case 'record':
      return [c.dir, round2(c.median), c.sinceYear];
    case 'typical':
      return [round2(c.median), c.percentile];
  }
}

function decodeCompare(type: FactType, x: number[]): FactCompare {
  if (type === 'F1' || type === 'F2') return { kind: 'rank', dir: x[0] as Direction, rank: x[1], total: x[2], tie: x[3] === 1 };
  if (type === 'F3') return { kind: 'neighbours', dir: x[0] as Direction, count: x[1], min: x[2], max: x[3], extended: x[4] === 1 };
  if (type === 'F4') return { kind: 'change', dir: x[0] as Direction, rank: x[1], total: x[2], fromYear: x[3], fromValue: x[4] };
  if (type === 'F5') return { kind: 'record', dir: x[0] as Direction, median: x[1], sinceYear: x[2] };
  return { kind: 'typical', median: x[0], percentile: x[1] };
}

export function encodeFact(f: FlaggedFact): EncodedFact {
  const out: EncodedFact = [f.type, f.indicatorId, f.year, round2(f.value), f.strength, ...encodeCompare(f.compare)];
  const span = f.span && f.span > 1 ? f.span : 0;
  if (span || f.isNew) out.push(span);
  if (f.isNew) out.push(1);
  return out;
}

export function decodeFact(teryt: string, e: readonly (string | number)[]): FlaggedFact {
  const type = e[0] as FactType;
  const n = COMPARE_LENGTH[type];
  const compareRaw = e.slice(5, 5 + n) as number[];
  const span = e[5 + n] as number | undefined;
  const isNew = e[6 + n] === 1;
  return {
    type,
    teryt,
    indicatorId: String(e[1]),
    year: Number(e[2]),
    value: Number(e[3]),
    strength: Number(e[4]),
    frame: FRAME_BY_TYPE[type],
    compare: decodeCompare(type, compareRaw),
    ...(span ? { span } : {}),
    ...(isNew ? { isNew: true } : {}),
  };
}

export type EncodedTwin = [string, string, number, number, number];

export const encodeTwin = (t: TwinFact): EncodedTwin => ['F8', t.twin, t.year, t.dims, round2(t.distance)];

export function decodeTwin(teryt: string, e: readonly (string | number)[]): TwinFact {
  return { type: 'F8', teryt, twin: String(e[1]), year: Number(e[2]), dims: Number(e[3]), distance: Number(e[4]) };
}
