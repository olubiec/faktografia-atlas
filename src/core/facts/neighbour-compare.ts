// „Na tle sąsiada” (W32-O05, docs/KONCEPT-ODKRYCIA-V2.md §3): w ilu wskaźnikach z kierunkiem gmina wypada lepiej.
// Porównanie po percentylach kraju (jedna skala dla wszystkich wskaźników), bez słownictwa meczowego i bez odmiany nazw.
import { decodePercentiles, type UnitPercentile } from './percentiles';
import type { PercentileShard } from './percentile-types';
import { subjectOf } from './roles';
import { valenceOf } from './valence';

export interface NeighbourProfile {
  teryt: string;
  name: string;
  /** Liczba ludności (do wyboru sąsiada o podobnej wielkości); brak = nie bierze udziału w wyborze. */
  population: number | null;
  /** Percentyl kraju po wskaźniku (0–100). */
  pct: Record<string, number>;
}

export interface NeighbourComparison {
  neighbour: NeighbourProfile;
  /** Ile wskaźników z kierunkiem porównano (mianownik). */
  total: number;
  better: string[];
  worse: string[];
  sentence: string;
  betterLine: string;
  worseLine: string;
  /** Link „Pełne porównanie”: istniejące `?u=A&c=A,B`. */
  link: string;
}

/** Profil gminy z pliku województwa; gmina bez percentyli daje null. */
export function profileFromShard(pct: PercentileShard | undefined, teryt: string, name: string): NeighbourProfile | null {
  const rows: UnitPercentile[] = decodePercentiles(pct, teryt);
  if (!rows.length) return null;
  return {
    teryt,
    name,
    population: rows.find((r) => r.indicatorId === 'population')?.value ?? null,
    pct: Object.fromEntries(rows.map((r) => [r.indicatorId, r.percentile])),
  };
}

/** Najbliższy pod względem liczby ludności; remis → niższy TERYT. `others` = pozostali w tej samej kolejności. */
export function chooseNeighbour(me: NeighbourProfile, candidates: NeighbourProfile[]): { main: NeighbourProfile | null; others: NeighbourProfile[] } {
  const dist = (c: NeighbourProfile) => (me.population !== null && c.population !== null ? Math.abs(c.population - me.population) : Infinity);
  const sorted = candidates.filter((c) => c.teryt !== me.teryt).sort((a, b) => dist(a) - dist(b) || a.teryt.localeCompare(b.teryt));
  return { main: sorted[0] ?? null, others: sorted.slice(1) };
}

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function names(ids: string[]): string {
  const list = ids.slice(0, 3).map((id) => lowerFirst(subjectOf(id)));
  const rest = ids.length - list.length;
  return rest > 0 ? `${list.join(', ')} i ${rest} ${rest === 1 ? 'inny' : 'innych'}` : list.join(', ');
}

export function compareWithNeighbour(me: NeighbourProfile, neighbour: NeighbourProfile): NeighbourComparison {
  const better: string[] = [];
  const worse: string[] = [];
  let total = 0;
  for (const id of Object.keys(me.pct).sort()) {
    const dir = valenceOf(id);
    const a = me.pct[id];
    const b = neighbour.pct[id];
    if (dir === null || a === undefined || b === undefined) continue;
    total++;
    // Percentyl rośnie z wartością; przy kierunku „niższy lepszy” odwracamy.
    const [x, y] = dir === 'up' ? [a, b] : [b, a];
    if (x > y) better.push(id);
    else if (x < y) worse.push(id);
  }
  const link = `?u=${me.teryt}&c=${me.teryt},${neighbour.teryt}`;
  return {
    neighbour,
    total,
    better,
    worse,
    sentence: total
      ? `Na tle gminy ${neighbour.name} ${me.name} wypada lepiej w ${better.length} z ${total} wskaźników.`
      : `Dla gminy ${neighbour.name} brakuje wspólnych wskaźników do porównania.`,
    betterLine: better.length ? `Lepiej: ${names(better)}.` : '',
    worseLine: worse.length ? `Gorzej: ${names(worse)}.` : '',
    link,
  };
}
