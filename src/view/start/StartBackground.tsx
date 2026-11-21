import { useEffect, useMemo, useRef, useState } from 'react';
import {
  bindVisibility, createStartLoop, loadOutline, outlineCells, type Frame, type OutlineFile,
} from '@/core/start/outline';
import {
  indicatorLabel, loadStart, startFields, type StartFile,
} from '@/core/start/start-data';
import { useReducedMotion } from '@/view/map/hooks/useReducedMotion';

export type StartBackgroundData = { outline: OutlineFile; start: StartFile };
type Ui = { index: number; mode: Frame['mode']; nearest: string | null };

/**
 * Animowany obrys Polski w tle `/` (własny SVG, bez WebGL).
 * Kolory: 5 klas z start.json (`--seq-1…5`, `--no-data`). Pierwszy kadr, `prefers-reduced-motion`
 * i brak ruchu = ludność. Dane przychodzą z propsa `initial` (testy) albo z dwóch małych plików.
 */
export function StartBackground({ initial, onPick }: { initial?: StartBackgroundData; onPick?: (teryt: string, indicatorId: string) => void }) {
  const [data, setData] = useState<StartBackgroundData | null>(initial ?? null);
  const [ui, setUi] = useState<Ui>({ index: 0, mode: 'random', nearest: null });
  // Województwo pod kursorem lub palcem (bez efektów przy reduced-motion).
  const [hot, setHot] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    if (initial) return;
    let alive = true;
    Promise.all([loadOutline(), loadStart()])
      .then(([outline, start]) => alive && setData({ outline, start }))
      .catch(() => undefined); // tło jest ozdobą: bez plików strona działa dalej
    return () => {
      alive = false;
    };
  }, [initial]);

  const cells = useMemo(() => (data ? outlineCells(data.outline) : []), [data]);
  const indicators = data?.start.indicators ?? [];

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || cells.length === 0 || indicators.length === 0) return;
    const loop = createStartLoop({
      cells,
      count: indicators.length,
      reduced: reduced.current,
      env: {
        now: () => performance.now(),
        raf: (cb) => requestAnimationFrame(cb),
        caf: (id) => cancelAnimationFrame(id),
        rand: Math.random,
      },
      onFrame: (f) => {
        f.strokes.forEach((s, i) => {
          const el = pathRefs.current[i];
          if (!el) return;
          el.style.opacity = String(s.opacity);
          el.style.strokeWidth = String(s.width);
        });
        setUi((p) => (p.index === f.index && p.mode === f.mode && p.nearest === f.nearest ? p : { index: f.index, mode: f.mode, nearest: f.nearest }));
      },
    });
    // Mysz i palec: nasłuch na oknie, więc tło reaguje też pod tekstem; poza obrysem dotyk przewija stronę.
    const onPointer = (e: PointerEvent) => {
      const r = svg.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      loop.pointer([(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]);
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onPointer, { passive: true });
    loop.start();
    const unbind = bindVisibility(document, loop);
    const io = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(([entry]) => loop.setPaused('offscreen', !entry.isIntersecting))
      : null;
    io?.observe(svg);
    return () => {
      loop.stop();
      unbind();
      io?.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [cells, indicators.length, reduced]);

  const active = indicators[ui.index] ?? indicators[0];
  const colors = useMemo(() => new Map(active ? startFields(active).map((f) => [f.teryt, f.color]) : []), [active]);

  return (
    <div className="pointer-events-none flex w-full flex-col items-center" data-slot="start-background">
      <div className="w-full">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${data?.outline.viewBox[0] ?? 1} ${data?.outline.viewBox[1] ?? 1}`}
          role="img"
          aria-label={`Mapa Polski: ${active ? indicatorLabel(active) : 'ładowanie'}`}
          data-indicator={active?.id ?? ''}
          data-bbox={data ? data.outline.bbox.join(',') : undefined}
          data-mode={ui.mode}
          className="h-auto w-full touch-pan-y"
          onPointerLeave={() => setHot(null)}
          onPointerUp={(e) => e.pointerType === 'touch' && setHot(null)}
          onPointerCancel={() => setHot(null)}
        >
          {cells.map((c, i) => (
            <path
              key={c.teryt}
              ref={(el) => {
                pathRefs.current[i] = el;
              }}
              d={c.d}
              data-teryt={c.teryt}
              data-hot={hot === c.teryt ? '1' : undefined}
              className="pointer-events-auto cursor-pointer stroke-tusz"
              onPointerEnter={() => !reduced.current && setHot(c.teryt)}
              onPointerDown={() => !reduced.current && setHot(c.teryt)}
              onClick={() => active && onPick?.(c.teryt, active.id)}
              style={{
                fill: colors.get(c.teryt) ?? 'var(--no-data)',
                fillOpacity: hot && hot !== c.teryt ? 0.6 : 1,
                transition: reduced.current ? 'none' : 'fill var(--motion-slow) var(--easing)',
              }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
