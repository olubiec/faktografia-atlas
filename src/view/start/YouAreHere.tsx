// Pasek „Na tle kraju” (W32-O06, docs/KONCEPT-ODKRYCIA-V2.md §3): rozkład wszystkich gmin, mediana i znacznik miejsca.
// SVG z tokenów (klasy fill-/stroke-), bez animacji, bez czerwonego zakreślenia (należy do karty 1).
import type { DistEntry } from '../../core/facts/percentile-types';
import { formatValue } from '../../core/format/number';

const W = 320;
const H = 64;
const BASE = 44;

/** Indeks przedziału, w którym leży wartość; poza zakresem – krawędź. */
function markerBin(dist: DistEntry, value: number): number {
  const n = dist.b.length;
  if (dist.hi <= dist.lo) return 0;
  const k = Math.floor(((value - dist.lo) / (dist.hi - dist.lo)) * n);
  return Math.min(n - 1, Math.max(0, k));
}

/** Pozycja pozioma (0–1) wartości na osi od 1. do 99. percentyla, ucięta do krawędzi. */
const posOf = (dist: DistEntry, v: number) => (dist.hi <= dist.lo ? 0.5 : Math.min(1, Math.max(0, (v - dist.lo) / (dist.hi - dist.lo))));

export interface YouAreHereProps {
  dist?: DistEntry | null;
  value: number;
  name: string;
  /** Jednostka do podpisu (np. „na 1000”, „%”). */
  unitLabel?: string;
}

export function YouAreHere({ dist, value, name, unitLabel }: YouAreHereProps) {
  if (!dist || !dist.b.length) return null;
  const n = dist.b.length;
  const max = Math.max(...dist.b, 1);
  const bw = W / n;
  const bin = markerBin(dist, value);
  const x = posOf(dist, value) * W;
  const mx = posOf(dist, dist.m) * W;
  const unit = unitLabel ?? null;
  const v = formatValue(value, unit);
  const m = formatValue(dist.m, unit);
  const label = `${name}: ${v}; mediana gmin: ${m}`;
  const anchor = x < 60 ? 'start' : x > W - 60 ? 'end' : 'middle';
  return (
    <figure className="m-0 flex w-full min-w-70 flex-col gap-1">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="block h-auto w-full">
        {dist.b.map((c, i) => {
          const h = Math.max(1, (c / max) * 28);
          return <rect key={i} data-bin={i} x={i * bw + 1} y={BASE - h} width={bw - 2} height={h} className={i === bin ? 'fill-tusz' : 'fill-linia'} />;
        })}
        <line x1={mx} x2={mx} y1={BASE - 32} y2={BASE + 2} strokeWidth={1} className="stroke-olowek" />
        <path data-marker={bin} d={`M ${x} ${BASE + 3} l -4 7 h 8 z`} className="fill-tusz" />
        <text x={x} y={H - 2} textAnchor={anchor} className="fill-tusz text-xs">{name}</text>
      </svg>
      <figcaption className="text-xs text-olowek">{`▲ ${name}: ${v} / mediana: ${m}`}</figcaption>
    </figure>
  );
}
