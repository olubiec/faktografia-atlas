// Zwarty zapis faktu w plikach public/data/facts/<WW>.json (krotka zamiast obiektu – mniejszy plik).
// [typ, wskaźnik, rok, wartość, siła, …porównanie, span?] – porównanie zależy od typu:
//   F1/F2: kierunek, miejsce, z ilu, remis(0/1) · F4: kierunek, miejsce, z ilu, rok początku, wartość początku
//   F5: kierunek, mediana, rok początku serii · F9: mediana, percentyl
import { FRAME_BY_TYPE, type Direction, type Fact, type FactCompare, type FactType } from './types';

export type EncodedFact = (string | number)[];

const round2 = (n: number) => Math.round(n * 100) / 100;

const COMPARE_LENGTH: Record<FactType, number> = { F1: 4, F2: 4, F4: 5, F5: 3, F9: 2 };

function encodeCompare(c: FactCompare): number[] {
  switch (c.kind) {
    case 'rank':
      return [c.dir, c.rank, c.total, c.tie ? 1 : 0];
    case 'change':
      return [c.dir, c.rank, c.total, c.fromYear, round2(c.fromValue)];
    case 'record':
      return [c.dir, round2(c.median), c.sinceYear];
    case 'typical':
      return [round2(c.median), c.percentile];
  }
}

function decodeCompare(type: FactType, x: number[]): FactCompare {
  if (type === 'F1' || type === 'F2') return { kind: 'rank', dir: x[0] as Direction, rank: x[1], total: x[2], tie: x[3] === 1 };
  if (type === 'F4') return { kind: 'change', dir: x[0] as Direction, rank: x[1], total: x[2], fromYear: x[3], fromValue: x[4] };
  if (type === 'F5') return { kind: 'record', dir: x[0] as Direction, median: x[1], sinceYear: x[2] };
  return { kind: 'typical', median: x[0], percentile: x[1] };
}

export function encodeFact(f: Fact): EncodedFact {
  const out: EncodedFact = [f.type, f.indicatorId, f.year, round2(f.value), f.strength, ...encodeCompare(f.compare)];
  if (f.span && f.span > 1) out.push(f.span);
  return out;
}

export function decodeFact(teryt: string, e: readonly (string | number)[]): Fact {
  const type = e[0] as FactType;
  const n = COMPARE_LENGTH[type];
  const compareRaw = e.slice(5, 5 + n) as number[];
  const span = e[5 + n] as number | undefined;
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
  };
}
