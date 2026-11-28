// Karty panelu „{Gmina} na tle Polski” z pliku anomalii (cała biblioteka GUS). Czysta logika: bez sieci, bez nazw gmin.
// Każda liczba na karcie ma jedną jednostkę (tę z pliku), bez przeliczeń na „1 na N”; zmiana pokazuje procent tylko tam, gdzie jest czytelny.
import config from '../../../config/roles.json';
import type { AnomalyMeta, AnomalyShard } from './anomaly-types';
import { times } from './human-scale';
import type { RoleCard } from './roles';

export interface AnomalyRow {
  meta: AnomalyMeta;
  value: number;
  percentile: number;
  ratio: number | null;
}

const pl = (n: number, d: number) => n.toLocaleString('pl-PL', { maximumFractionDigits: d });
/** Liczba z rozsądną liczbą miejsc po przecinku zależnie od wielkości. */
export function fmtNumber(n: number): string {
  const a = Math.abs(n);
  return pl(n, a >= 100 ? 0 : a >= 10 ? 1 : 2).replace('-', '−');
}
/** Wartość z jednostką: „6,6 na 1000 mieszkańców”, „12%”; bez jednostki – sama liczba. */
export function fmtValue(n: number, unit: string): string {
  if (unit === '%') return `${fmtNumber(n)}%`;
  return unit ? `${fmtNumber(n)} ${unit}` : fmtNumber(n);
}

/** Wpisy gminy z pliku (najbardziej odstające pierwsze). */
export function anomalyRows(an: AnomalyShard | undefined, teryt: string): AnomalyRow[] {
  const flat = an?.u[teryt] ?? [];
  const out: AnomalyRow[] = [];
  for (let k = 0; k + 3 < flat.length; k += 4) {
    const meta = an?.m[flat[k]];
    if (meta) out.push({ meta, value: flat[k + 1], percentile: flat[k + 2], ratio: flat[k + 3] || null });
  }
  return out;
}

const adjusted = (r: AnomalyRow) => (r.meta[4] === 'd' ? 100 - r.percentile : r.percentile);
const logRatio = (r: AnomalyRow) => Math.abs(Math.log(r.ratio ?? 1));
const base = (r: AnomalyRow, role: RoleCard['role']): RoleCard => ({
  role,
  indicatorId: r.meta[0],
  main: '',
  reference: `W typowej gminie: ${fmtValue(r.meta[6].m, r.meta[2])}.`,
  source: `GUS BDL, ${r.meta[3]} · ${fmtValue(r.value, r.meta[2])}`,
  percentile: r.percentile,
  value: r.value,
  year: r.meta[3],
  unit: r.meta[2],
  dist: r.meta[6],
  noRanking: r.meta[5] === 1,
});

/** „Wartość wyższa niż w 93% gmin” – bez przymiotników ocennych. */
function positionCard(role: RoleCard['role'], r: AnomalyRow): RoleCard {
  const higher = r.percentile >= 50;
  const share = Math.min(99, Math.max(1, Math.round(higher ? r.percentile : 100 - r.percentile)));
  return { ...base(r, role), main: `${r.meta[1]}: wartość ${higher ? 'wyższa' : 'niższa'} niż w ${share}% gmin.` };
}

/** Zmiana w oknie: procent tylko gdy obie wartości są dodatnie i punkt wyjścia nie jest znikomy; inaczej „z A do B”. */
export function changeCard(an: AnomalyShard, teryt: string, used: Set<string>): RoleCard | null {
  const flat = an.c[teryt] ?? [];
  for (let k = 0; k + 4 < flat.length; k += 5) {
    const meta = an.m[flat[k]];
    if (!meta || used.has(meta[0])) continue;
    const [from, to, since] = [flat[k + 1], flat[k + 2], flat[k + 3]];
    const unit = meta[2];
    const typical = Math.abs(meta[6].m);
    const rel = unit !== '%' && from > 0 && to > 0 && from >= 0.2 * typical ? to / from - 1 : null;
    if (rel !== null && Math.abs(rel) < 0.1) continue;
    const up = to > from;
    const how =
      rel !== null && Math.abs(rel) < 3
        ? `${up ? 'wzrost' : 'spadek'} o ${Math.round(Math.abs(rel) * 100)}%`
        : `${up ? 'wzrost' : 'spadek'} z ${fmtNumber(from)} do ${fmtNumber(to)}${unit && unit !== '%' ? ` ${unit}` : unit}`;
    return {
      role: 'change',
      indicatorId: meta[0],
      main: `${meta[1]}: ${how} od ${since} roku.`,
      reference: `W ${since} roku: ${fmtValue(from, unit)}, w ${meta[3]}: ${fmtValue(to, unit)}.`,
      source: `GUS BDL, ${since}–${meta[3]} · ${unit || 'wartość'}`,
      percentile: flat[k + 4],
      value: to,
      year: meta[3],
      unit,
      dist: meta[6],
      noRanking: meta[5] === 1,
    };
  }
  return null;
}

/** Karty gminy: nietypowe (najdalej od mediany), skrajne, mocna i słabsza strona, zmiana. Wskaźnik występuje najwyżej raz. */
export function pickAnomalyCards(an: AnomalyShard | undefined, teryt: string): RoleCard[] {
  const rows = anomalyRows(an, teryt);
  if (!an || !rows.length) return [];
  const { minRatioToMedian, strongPercentile, weakPercentile } = config.roles;
  const used = new Set<string>();
  const cards: RoleCard[] = [];
  const take = (r: AnomalyRow) => used.add(r.meta[0]);

  const unusual = rows.filter((r) => r.ratio !== null && (r.ratio >= minRatioToMedian || r.ratio <= 1 / minRatioToMedian)).sort((a, b) => logRatio(b) - logRatio(a));
  if (unusual[0]) {
    const r = unusual[0];
    cards.push({ ...base(r, 'unusual'), main: `${r.meta[1]}: ${times(r.ratio as number)} niż w typowej gminie.` });
    take(r);
  }
  const extreme = rows.filter((r) => !used.has(r.meta[0]) && Math.abs(r.percentile - 50) >= 45)[0];
  if (extreme) {
    cards.push(positionCard('extreme', extreme));
    take(extreme);
  }
  const dir = rows.filter((r) => r.meta[4] !== '' && !used.has(r.meta[0])).sort((a, b) => adjusted(b) - adjusted(a));
  const none = (role: 'strong' | 'weak'): RoleCard => ({ role, none: true, main: 'Żaden z wyraźnie ocenianych wskaźników nie wyróżnia tej gminy.', reference: '', source: '' });
  const strong = dir[0] && adjusted(dir[0]) >= strongPercentile ? dir[0] : null;
  cards.push(strong ? positionCard('strong', strong) : none('strong'));
  if (strong) take(strong);
  const weakPool = dir.filter((r) => !used.has(r.meta[0]));
  const weak = weakPool[weakPool.length - 1];
  const weakOk = weak && adjusted(weak) <= weakPercentile;
  cards.push(weakOk ? positionCard('weak', weak) : none('weak'));
  if (weakOk) take(weak);
  const change = changeCard(an, teryt, used);
  if (change) cards.push(change);
  return cards;
}

export interface NeighbourLine {
  indicatorId: string;
  subject: string;
  mine: string;
  theirs: string;
}

/** Te same wskaźniki, które wyróżniają gminę, u sąsiada o podobnej liczbie ludności; null, gdy plik nie ma sąsiada. */
export function neighbourLines(an: AnomalyShard | undefined, teryt: string): { neighbour: string; lines: NeighbourLine[] } | null {
  const row = an?.n[teryt];
  if (!an || !row || typeof row[0] !== 'string') return null;
  const mine = new Map(anomalyRows(an, teryt).map((r) => [r.meta[0], r]));
  const lines: NeighbourLine[] = [];
  for (let k = 1; k + 2 < row.length; k += 3) {
    const meta = an.m[row[k] as number];
    const me = meta ? mine.get(meta[0]) : undefined;
    if (meta && me) lines.push({ indicatorId: meta[0], subject: meta[1], mine: fmtValue(me.value, meta[2]), theirs: fmtValue(row[k + 1] as number, meta[2]) });
  }
  return lines.length ? { neighbour: row[0], lines } : null;
}
