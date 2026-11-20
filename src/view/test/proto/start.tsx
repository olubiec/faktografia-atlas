import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Link } from 'react-router';
import { feature } from 'topojson-client';
import type { Feature, MultiPolygon, Polygon } from 'geojson';
import { loadAdminTopo, loadUnits } from '@/core/data/load-atlas-data';
import { loadIndicatorValues } from '@/core/data/load-values';
import { classColorToken, classify, computeBreaks } from '@/core/map/classes';
import {
  DEFAULT_MOTION, createMotion, cycleIndex, glowAt, pointerMove, projectLonLat, ringToPath,
  simplifyLine, tickMotion, waveAt, type MotionState, type Point,
} from '@/core/start/idle-motion';
import { useReducedMotion } from '@/view/map/hooks/useReducedMotion';

// PROTOTYP (U07): obrys województw jest tu upraszczany w przeglądarce z admin.topo.json (1,2 MB).
// Docelowo strona dostaje gotowy plik ok. 22 KB (patrz docs/research/u/U07.md).
type Cell = { teryt: string; name: string; d: string; center: Point };
type Variant = 'cycle' | 'fixed';
const INDICATORS = [
  { id: 'population', label: 'Liczba ludności', unit: 'osób' },
  { id: 'unemployment-rate', label: 'Stopa bezrobocia', unit: '%' },
  { id: 'avg-wage', label: 'Przeciętne wynagrodzenie', unit: 'zł' },
  { id: 'density', label: 'Gęstość zaludnienia', unit: 'os./km²' },
] as const;
const CYCLE_MS = 5000;
const EPS = 1.2;

async function buildCells() {
  const [topoRaw, units] = await Promise.all([loadAdminTopo(), loadUnits()]);
  const topo = topoRaw as Parameters<typeof feature>[0] & { objects: Record<string, never> };
  const fc = feature(topo, topo.objects.woj) as unknown as { features: Feature<Polygon | MultiPolygon>[] };
  const names = new Map(units.filter((u) => u.level === 'woj').map((u) => [u.teryt, u.name]));
  const shapes = fc.features.map((f) => {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    const rings = polys.flatMap((p) => p.map((r) => simplifyLine(r.map(([x, y]) => projectLonLat(x, y)), EPS)));
    return { teryt: String((f.properties as { teryt: string }).teryt), rings };
  });
  const all = shapes.flatMap((s) => s.rings.flat());
  const xs = all.map((p) => p[0]);
  const ys = all.map((p) => p[1]);
  const [x0, y0] = [Math.min(...xs), Math.min(...ys)];
  const [w, h] = [Math.max(...xs) - x0, Math.max(...ys) - y0];
  const cells: Cell[] = shapes.map((s) => {
    const pts = s.rings.flat();
    const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    return { teryt: s.teryt, name: names.get(s.teryt) ?? s.teryt, d: s.rings.map(ringToPath).join(''), center: [(cx - x0) / w, (cy - y0) / h] };
  });
  return { cells, box: `${x0} ${y0} ${w} ${h}`, bytes: cells.reduce((a, c) => a + c.d.length, 0), points: all.length };
}

type Slice = { year: number; byTeryt: Map<string, number>; token: Map<string, string> };
async function loadSlice(id: string): Promise<Slice | null> {
  const v = await loadIndicatorValues(id);
  if (!v) return null;
  const last = v.years.length - 1;
  const byTeryt = new Map<string, number>();
  for (const [t, arr] of Object.entries(v.values)) {
    const x = (arr as (number | null)[])[last];
    if (t.length === 2 && typeof x === 'number') byTeryt.set(t, x);
  }
  const breaks = computeBreaks([...byTeryt.values()], 'quantile', 5);
  const token = new Map([...byTeryt].map(([t, x]) => [t, `var(${classColorToken(classify(x, breaks), 5, 'sequential')})`]));
  return { year: v.years[last], byTeryt, token };
}

export default function StartProto() {
  const [data, setData] = useState<Awaited<ReturnType<typeof buildCells>> & { ms: number } | null>(null);
  const [slices, setSlices] = useState<Record<string, Slice>>({});
  const [variant, setVariant] = useState<Variant>('cycle');
  const [index, setIndex] = useState(0);
  const [nearest, setNearest] = useState<string | null>(null);
  const [mode, setMode] = useState('random');
  const reduced = useReducedMotion();
  const pathRefs = useRef(new Map<string, SVGPathElement>());
  const state = useRef<MotionState | null>(null);
  const box = useRef<DOMRect | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const t0 = performance.now();
    void buildCells().then((d) => setData({ ...d, ms: Math.round(performance.now() - t0) }));
    for (const i of INDICATORS) void loadSlice(i.id).then((s) => s && setSlices((p) => ({ ...p, [i.id]: s })));
  }, []);

  const active = INDICATORS[variant === 'fixed' || reduced.current ? 0 : index];
  const slice = slices[active.id];

  useEffect(() => {
    if (!data) return;
    const opts = { ...DEFAULT_MOTION, reducedMotion: reduced.current };
    const t0 = performance.now();
    state.current = createMotion(t0, opts, Math.random);
    let raf = 0;
    const frame = (now: number) => {
      const s = (state.current = tickMotion(state.current!, now, opts, Math.random));
      let best = { d: Infinity, t: '' };
      for (const c of data.cells) {
        const g = Math.max(glowAt(c.center, s.focus, 0.4), waveAt(c.center, s.focus, now, 2400, 0.5) * 0.8);
        const el = pathRefs.current.get(c.teryt);
        if (el) {
          el.style.opacity = String(0.55 + 0.45 * g);
          el.style.strokeWidth = String(0.5 + 2.5 * g);
        }
        const d = s.focus ? Math.hypot(c.center[0] - s.focus[0], c.center[1] - s.focus[1]) : Infinity;
        if (d < best.d) best = { d, t: c.teryt };
      }
      setNearest((p) => (p === best.t || !s.focus ? p : best.t));
      setMode((p) => (p === s.mode ? p : s.mode));
      if (!opts.reducedMotion && variant === 'cycle') setIndex((p) => { const n = cycleIndex(now - t0, CYCLE_MS, INDICATORS.length); return p === n ? p : n; });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const stop = () => cancelAnimationFrame(raf);
    const onHide = () => (document.hidden ? stop() : (raf = requestAnimationFrame(frame)));
    document.addEventListener('visibilitychange', onHide);
    return () => { stop(); document.removeEventListener('visibilitychange', onHide); };
  }, [data, variant, reduced]);

  const onMove = (e: PointerEvent) => {
    const r = (box.current = svgRef.current?.getBoundingClientRect() ?? box.current);
    if (!r || !state.current) return;
    const p: Point = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
    state.current = pointerMove(state.current, p, performance.now(), { ...DEFAULT_MOTION, reducedMotion: reduced.current });
  };

  const cell = data?.cells.find((c) => c.teryt === nearest);
  const value = cell && slice?.byTeryt.get(cell.teryt);
  return (
    <div className="min-h-screen bg-kalka text-tusz">
      <div className="flex items-center justify-between gap-4 border-b border-linia bg-arkusz p-2 text-sm">
        <span>PROTOTYP – nie jest to docelowy ekran</span>
        <Link to="/__test/proto" className="inline-flex min-h-[44px] items-center underline">Lista prototypów</Link>
      </div>
      <div role="group" aria-label="Wariant tła" className="flex gap-2 p-2">
        {(['cycle', 'fixed'] as const).map((v) => (
          <button key={v} type="button" aria-pressed={variant === v} onClick={() => setVariant(v)}
            className="min-h-[44px] flex-1 border border-tusz px-3 text-sm aria-pressed:bg-tusz aria-pressed:text-kalka">
            {v === 'cycle' ? 'A: zmieniające się wskaźniki' : 'B: jeden stały (ludność)'}
          </button>
        ))}
      </div>
      <section className="relative mx-auto grid max-w-5xl gap-4 p-4 md:grid-cols-2 md:items-center" onPointerMove={onMove} onPointerDown={onMove}>
        <svg ref={svgRef} viewBox={data?.box ?? '0 0 1 1'} role="img" aria-label={`Mapa Polski: ${active.label}`} className="aspect-[6/5] w-full touch-none">
          {data?.cells.map((c) => (
            <path key={c.teryt} d={c.d} ref={(el) => { if (el) pathRefs.current.set(c.teryt, el); }}
              className="stroke-tusz" style={{ fill: slice?.token.get(c.teryt) ?? 'var(--no-data)', transition: reduced.current ? 'none' : 'fill var(--motion-slow) var(--easing)' }} />
          ))}
        </svg>
        <div className="flex flex-col gap-4 bg-arkusz/90 p-4">
          <h1 className="text-2xl font-bold">Faktografia</h1>
          <p>Zobacz, jak wypada Twoja gmina na tle całej Polski, na danych GUS.</p>
          <ol className="list-decimal pl-6">
            <li>Wybierz dane, np. bezrobocie albo ludność.</li>
            <li>Dotknij miejsca na mapie.</li>
            <li>Zobacz profil i porównaj z innym miejscem.</li>
          </ol>
          <Link to="/" className="inline-flex min-h-[44px] items-center justify-center bg-tusz px-4 text-kalka">Otwórz mapę</Link>
          <p className="text-xs text-olowek" aria-live="off">
            {active.label}, {slice?.year ?? '…'}{cell && value !== undefined ? ` · ${cell.name}: ${value.toLocaleString('pl-PL')} ${active.unit}` : ''}
          </p>
          <p className="text-xs text-olowek">Źródło: GUS, Bank Danych Lokalnych.</p>
        </div>
      </section>
      <p className="p-4 text-xs text-olowek" data-testid="proto-stats">
        Tryb: {reduced.current ? 'statyczny' : mode === 'react' ? 'reaguje na kursor' : 'losowy'} · obrys: {data ? `${data.points} pkt, ${(data.bytes / 1024).toFixed(1)} KB, ${data.ms} ms` : '…'}
      </p>
    </div>
  );
}
