// Karty ról panelu „{Gmina} na tle Polski” (W32-O04, docs/KONCEPT-ODKRYCIA-V2.md §3).
// Czysta logika: z pliku województwa (percentyle, wartości kandydatów, zmiany) wybiera karty dla jednej gminy.
import indicators from '../../../config/indicators.json';
import config from '../../../config/roles.json';
import { decodePercentiles, type UnitPercentile } from './percentiles';
import { humanScale } from './human-scale';
import type { DistEntry, PercentileShard } from './percentile-types';
import { valenceOf } from './valence';

export type RoleId = 'unusual' | 'extreme' | 'strong' | 'weak' | 'change';

export interface RoleCard {
  role: RoleId;
  /** Brak karty z uczciwym komunikatem zamiast wypełniacza. */
  none?: boolean;
  indicatorId?: string;
  main: string;
  reference: string;
  source: string;
  percentile?: number;
  value?: number;
  year?: number;
  /** Jednostka i rozkład z pliku anomalii (karta nie szuka ich w configu); brak linku do rankingu, gdy wartość jest przeliczona. */
  unit?: string;
  dist?: DistEntry;
  noRanking?: boolean;
}

/** Podzbiór pliku województwa potrzebny do kart. */
export interface RolesFile {
  pct?: PercentileShard;
  dist?: Record<string, DistEntry>;
}

interface Ind { id: string; name: string; unit: string }
const IND = new Map((indicators as Ind[]).map((i) => [i.id, i]));

/** „Czytelnicy bibliotek publicznych na 1000 ludności” → „Czytelnicy bibliotek publicznych”; nawias z jednostką znika. */
export function subjectOf(id: string): string {
  const name = IND.get(id)?.name ?? id;
  return name.replace(/\s*\([^)]*\)\s*$/, '').replace(/\s+na (1000|10 tys\.) ludności$/, '').trim();
}

const fmt = (n: number) => n.toLocaleString('pl-PL', { maximumFractionDigits: 1 });
const adjusted = (id: string, p: number) => (valenceOf(id) === 'down' ? 100 - p : p);

function unusualCard(c: UnitPercentile, dist: RolesFile['dist']): RoleCard {
  const ind = IND.get(c.indicatorId) as Ind;
  // „1 na N mieszkańców” tylko dla wskaźników liczonych w osobach; reszta dostaje porównanie z typową gminą.
  const people = config.roles.personBased.includes(c.indicatorId);
  const hs = humanScale({
    value: c.value as number,
    unit: people ? ind.unit : 'wartość',
    median: dist?.[c.indicatorId]?.m ?? null,
    percentile: c.percentile,
    year: c.year,
    place: '',
    label: subjectOf(c.indicatorId),
  });
  const real = humanScale({ value: c.value as number, unit: ind.unit, year: c.year, place: '' });
  return { role: 'unusual', indicatorId: c.indicatorId, ...hs, source: real.source, percentile: c.percentile, value: c.value as number, year: c.year };
}

/** Karta mocnej/słabszej strony: kierunek wynika z `valence`, zdanie z percentyla (bez przymiotników ocennych). */
function sideCard(role: 'strong' | 'weak', c: UnitPercentile, dist: RolesFile['dist']): RoleCard {
  const ind = IND.get(c.indicatorId) as Ind;
  const higher = c.percentile >= 50;
  const share = Math.min(99, Math.max(1, Math.round(higher ? c.percentile : 100 - c.percentile)));
  const hs = humanScale({ value: c.value as number, unit: ind.unit, median: dist?.[c.indicatorId]?.m ?? null, year: c.year, place: '' });
  return {
    role,
    indicatorId: c.indicatorId,
    main: `${subjectOf(c.indicatorId)}: wartość ${higher ? 'wyższa' : 'niższa'} niż w ${share}% gmin.`,
    reference: hs.reference,
    source: hs.source,
    percentile: c.percentile,
    value: c.value as number,
    year: c.year,
  };
}

function changeCard(pct: PercentileShard, teryt: string, used: Set<string>): RoleCard | null {
  const flat = pct.c?.[teryt] ?? [];
  for (let k = 0; k + 3 < flat.length; k += 4) {
    const id = pct.ind[flat[k]];
    if (used.has(id)) continue;
    const to = pct.y[flat[k]];
    const from = flat[k + 1];
    const rel = flat[k + 2];
    const ind = IND.get(id) as Ind;
    const now = from * (1 + rel);
    const pctChange = Math.round(Math.abs(rel) * 100);
    return {
      role: 'change',
      indicatorId: id,
      main: `${subjectOf(id)}: o ${pctChange}% ${rel > 0 ? 'więcej' : 'mniej'} niż w ${to - 10} roku.`,
      reference: `W ${to - 10} roku: ${fmt(from)}, w ${to}: ${fmt(now)} (${ind.unit}).`,
      source: `GUS BDL, ${to - 10}–${to} · ${ind.unit}`,
      percentile: flat[k + 3],
      value: now,
      year: to,
    };
  }
  return null;
}

/** Karty gminy w kolejności: nietypowe, mocna strona, słabsza strona, zmiana. Wskaźnik występuje najwyżej raz. */
export function pickRoles(file: RolesFile, teryt: string): RoleCard[] {
  const pct = file.pct;
  const all = decodePercentiles(pct, teryt);
  if (!pct || !all.length) return [];
  const { minRatioToMedian, strongPercentile, weakPercentile, unusualExcluded } = config.roles;
  const used = new Set<string>();
  const cards: RoleCard[] = [];

  const unusual = all
    .filter((c) => c.ratio !== null && c.value !== null && IND.has(c.indicatorId) && !unusualExcluded.includes(c.indicatorId) && (c.ratio >= minRatioToMedian || c.ratio <= 1 / minRatioToMedian))
    .sort((a, b) => Math.max(b.ratio as number, 1 / (b.ratio as number)) - Math.max(a.ratio as number, 1 / (a.ratio as number)) || Math.abs(b.percentile - 50) - Math.abs(a.percentile - 50));
  if (unusual[0]) {
    cards.push(unusualCard(unusual[0], file.dist));
    used.add(unusual[0].indicatorId);
  }

  const dir = all.filter((c) => valenceOf(c.indicatorId) !== null && IND.has(c.indicatorId));
  const pool = dir.filter((c) => c.value !== null && !used.has(c.indicatorId)).sort((a, b) => adjusted(b.indicatorId, b.percentile) - adjusted(a.indicatorId, a.percentile));
  const none = (role: 'strong' | 'weak'): RoleCard => ({ role, none: true, main: `W żadnym z ${dir.length} wskaźników gmina nie odstaje wyraźnie od środka stawki.`, reference: '', source: '' });
  const strong = pool[0] && adjusted(pool[0].indicatorId, pool[0].percentile) >= strongPercentile ? pool[0] : null;
  cards.push(strong ? sideCard('strong', strong, file.dist) : none('strong'));
  if (strong) used.add(strong.indicatorId);
  const weakPool = pool.filter((c) => !used.has(c.indicatorId));
  const weak = weakPool.length ? weakPool[weakPool.length - 1] : null;
  cards.push(weak && adjusted(weak.indicatorId, weak.percentile) <= weakPercentile ? sideCard('weak', weak, file.dist) : none('weak'));
  if (weak && adjusted(weak.indicatorId, weak.percentile) <= weakPercentile) used.add(weak.indicatorId);

  const change = changeCard(pct, teryt, used);
  if (change) cards.push(change);
  return cards;
}

/** Deterministyczna próba gmin do przeglądu przez właściciela (ziarno → ta sama lista). */
export function reviewSample(files: RolesFile[], count = 50, seed = 2711): { teryt: string; cards: RoleCard[] }[] {
  const all = files.flatMap((f) => Object.keys(f.pct?.u ?? {}).map((t) => ({ t, f })));
  let s = seed >>> 0;
  const rnd = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = Math.imul(s ^ (s >>> 15), 1 | s);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  const out: { teryt: string; cards: RoleCard[] }[] = [];
  const pool = [...all];
  while (out.length < count && pool.length) {
    const [pick] = pool.splice(Math.floor(rnd() * pool.length), 1);
    out.push({ teryt: pick.t, cards: pickRoles(pick.f, pick.t) });
  }
  return out;
}
