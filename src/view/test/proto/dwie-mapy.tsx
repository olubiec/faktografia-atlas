import { useEffect, useMemo, useRef, useState } from 'react';
import Map, { useControl } from 'react-map-gl/maplibre';
import { MapboxOverlay } from '@deck.gl/mapbox';
import type { MapboxOverlayProps } from '@deck.gl/mapbox';
import { GeoJsonLayer } from '@deck.gl/layers';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Link } from 'react-router';
import tokensJson from '../../../../config/tokens.json';
import indicatorsJson from '../../../../config/indicators.json';
import { loadUnits, loadAdminTopo } from '@/core/data/load-atlas-data';
import { loadIndicatorValues } from '@/core/data/load-values';
import { buildChoropleth } from '@/core/map/choropleth';
import { classColorToken } from '@/core/map/classes';
import { countryBounds, initialViewState } from '@/core/map/view';
import type { IndicatorValues } from '@/core/profile/profile';
import type { Unit, UnitLevel } from '@/core/units/types';
import { loadGeoData } from '../../map/layers/admin';
import { resolveTokenColor } from '../../map/layers/choropleth-color';
import { cn } from '../../../lib/utils';

// Prototyp U06: dwie zsynchronizowane mapy z dwoma wskaźnikami. Nie jest to ekran docelowy.
if (typeof maplibregl.setWorkerCount === 'function') maplibregl.setWorkerCount(0);
const INDICATORS = indicatorsJson as { id: string; name: string; unit: string }[];
const LEVELS: { id: UnitLevel; label: string }[] = [{ id: 'woj', label: 'Województwa' }, { id: 'pow', label: 'Powiaty' }, { id: 'gmi', label: 'Gminy' }];
const MAP_STYLE = { version: 8 as const, sources: {}, layers: [{ id: 'bg', type: 'background' as const, paint: { 'background-color': tokensJson.color.light.kalka } }] };
type Cam = { center: [number, number]; zoom: number };
type Maps = Record<'A' | 'B', maplibregl.Map | null>;

function Overlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

type PaneProps = { slot: 'A' | 'B'; units: Unit[]; topo: unknown; values: IndicatorValues | null; level: UnitLevel; year: number | undefined; selected: string | null; cam: Cam; reg: (s: 'A' | 'B', m: maplibregl.Map | null) => void; onSelect: (t: string) => void; onCam: (from: 'A' | 'B', c: Cam, end: boolean) => void };

function Pane({ slot, units, topo, values, level, year, selected, cam, reg, onSelect, onCam }: PaneProps) {
  const ch = useMemo(() => buildChoropleth({ values, units, level, year, n: 5 }), [values, units, level, year]);
  const layer = useMemo(() => {
    const g = loadGeoData(topo);
    const data = level === 'pow' ? g.powFeatures : level === 'gmi' ? g.gmiFeatures : g.wojFeatures;
    const fill = (f: { properties?: { teryt?: string } | null }) => resolveTokenColor(classColorToken(ch.classByTeryt[f.properties?.teryt ?? ''] ?? 'no-data', 5, ch.scheme));
    return new GeoJsonLayer({ id: `ch-${slot}`, data, filled: true, stroked: true, pickable: true, getFillColor: fill as never, getLineColor: (f: { properties?: { teryt?: string } | null }) => (f.properties?.teryt === selected ? resolveTokenColor('--tusz') : resolveTokenColor('--linia')) as never, getLineWidth: (f: { properties?: { teryt?: string } | null }) => (f.properties?.teryt === selected ? 3 : 0.6), lineWidthUnits: 'pixels', updateTriggers: { getFillColor: [ch], getLineColor: [selected], getLineWidth: [selected] }, onClick: (i) => i.object?.properties?.teryt && onSelect(i.object.properties.teryt) });
  }, [topo, level, ch, selected, slot, onSelect]);
  return (
    <Map initialViewState={{ longitude: cam.center[0], latitude: cam.center[1], zoom: cam.zoom }} mapStyle={MAP_STYLE} attributionControl={false} pixelRatio={Math.min(window.devicePixelRatio || 1, 2)} touchPitch={false} dragRotate={false}
      onLoad={(e) => { reg(slot, e.target); e.target.touchZoomRotate.disableRotation(); }}
            onMove={(e) => onCam(slot, { center: [e.viewState.longitude, e.viewState.latitude], zoom: e.viewState.zoom }, false)}
      onMoveEnd={(e) => onCam(slot, { center: [e.viewState.longitude, e.viewState.latitude], zoom: e.viewState.zoom }, true)}>
      <Overlay layers={[layer]} />
    </Map>
  );
}

function Legend({ ch, unit }: { ch: ReturnType<typeof buildChoropleth>; unit: string }) {
  const fmt = (n: number) => n.toLocaleString('pl-PL', { maximumFractionDigits: 1 });
  return (
    <div className="flex items-center gap-1 text-xs text-olowek" aria-label="Legenda">
      {[0, 1, 2, 3, 4].map((i) => <span key={i} className="inline-block h-3 w-6 border border-linia" style={{ backgroundColor: `var(${classColorToken(i, 5, ch.scheme)})` }} />)}
      <span>{ch.breaks.length ? `${fmt(ch.breaks[0])} – ${fmt(ch.breaks[ch.breaks.length - 1])} ${unit}` : 'brak danych'}</span>
    </div>
  );
}

const btn = 'min-h-11 min-w-11 px-3 border border-linia text-sm';
const sel = 'min-h-11 border border-linia bg-arkusz px-2 text-sm text-tusz max-w-full';

export default function DwieMapy() {
  const [data, setData] = useState<{ units: Unit[]; topo: unknown } | null>(null);
  const [ids, setIds] = useState({ A: 'unemployed-share-working-age', B: 'income-per-capita' });
  const [vals, setVals] = useState<Record<'A' | 'B', IndicatorValues | null>>({ A: null, B: null });
  const [level, setLevel] = useState<UnitLevel>('pow');
  const [year, setYear] = useState<number | undefined>(undefined);
  const [layout, setLayout] = useState<'stack' | 'ab'>('stack');
  const [active, setActive] = useState<'A' | 'B'>('A');
  const [selected, setSelected] = useState<string | null>(null);
  const maps = useRef<Maps>({ A: null, B: null });
  const [cam, setCam] = useState<Cam | null>(null);
  const reg = (s: 'A' | 'B', m: maplibregl.Map | null) => { maps.current[s] = m; };

  useEffect(() => { Promise.all([loadUnits(), loadAdminTopo()]).then(([units, topo]) => { const v = initialViewState(countryBounds(units), 360, 300); setCam({ center: [v.longitude, v.latitude], zoom: v.zoom }); setData({ units, topo }); }); }, []);
  useEffect(() => { (['A', 'B'] as const).forEach((s) => loadIndicatorValues(ids[s]).then((v) => setVals((p) => ({ ...p, [s]: v })))); }, [ids]);
  const years = useMemo(() => (vals.A?.years ?? []).filter((y) => vals.B?.years.includes(y)), [vals]);
  // Kamera: ruch jednej mapy przenosi drugą (bez pętli, bo jumpTo nie ma originalEvent).
  const syncing = useRef(false);
  const onCam = (from: 'A' | 'B', c: Cam, end: boolean) => {
    if (syncing.current) return;
    if (end) { setCam(c); return; }
    syncing.current = true;
    maps.current[from === 'A' ? 'B' : 'A']?.jumpTo({ center: c.center, zoom: c.zoom });
    syncing.current = false;
  };

  const slots = layout === 'stack' ? (['A', 'B'] as const) : ([active] as const);
  const unitOf = (t: string | null) => data?.units.find((u) => u.teryt === t);
  const nameOf = (id: string) => INDICATORS.find((i) => i.id === id);
  const valueAt = (s: 'A' | 'B') => { const v = vals[s]; if (!v || !selected) return '–'; const i = year ? v.years.indexOf(year) : v.years.length - 1; const x = v.values[selected]?.[i]; return typeof x === 'number' ? `${x.toLocaleString('pl-PL')} ${nameOf(ids[s])?.unit ?? ''}` : 'brak danych'; };

  return (
    <div className="min-h-dvh bg-arkusz text-tusz">
      <div className="flex min-h-11 flex-wrap items-center gap-2 bg-tusz px-4 text-sm text-arkusz">
        <strong>PROTOTYP – nie jest to docelowy ekran</strong><Link to="/__test/proto" className="min-h-11 inline-flex items-center underline">Lista prototypów</Link>
      </div>
      <div className="flex flex-col gap-2 px-4 py-2">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Układ">
          <button type="button" className={cn(btn, layout === 'stack' && 'bg-tusz text-arkusz')} onClick={() => setLayout('stack')}>Jedna pod drugą</button>
          <button type="button" className={cn(btn, layout === 'ab' && 'bg-tusz text-arkusz')} onClick={() => setLayout('ab')}>Przełącznik A / B</button>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Wspólny poziom i rok">
          {LEVELS.map((l) => <button key={l.id} type="button" className={cn(btn, level === l.id && 'bg-tusz text-arkusz')} onClick={() => setLevel(l.id)}>{l.label}</button>)}
          <select aria-label="Wspólny rok" className={sel} value={year ?? ''} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : undefined)}>
            <option value="">Najnowszy rok</option>{years.slice().reverse().map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        {layout === 'ab' && <div className="flex gap-2" role="tablist" aria-label="Którą mapę pokazać">{(['A', 'B'] as const).map((s) => <button key={s} role="tab" aria-selected={active === s} type="button" className={cn(btn, 'flex-1', active === s && 'bg-tusz text-arkusz')} onClick={() => setActive(s)}>Mapa {s}</button>)}</div>}
      </div>
      <div className={cn('grid gap-2 px-4', 'grid-cols-[minmax(0,1fr)]', layout === 'stack' && 'md:grid-cols-2')}>
        {data && cam && slots.map((s) => {
          const ch = buildChoropleth({ values: vals[s], units: data.units, level, year, n: 5 });
          return (
            <section key={s} className="flex flex-col gap-1" aria-label={`Mapa ${s}`}>
              <select aria-label={`Wskaźnik mapy ${s}`} className={sel} value={ids[s]} onChange={(e) => setIds({ ...ids, [s]: e.target.value })}>
                {INDICATORS.map((i) => <option key={i.id} value={i.id}>{s}: {i.name}</option>)}
              </select>
              <div className="relative h-[40dvh] border border-linia md:h-[60dvh]" data-testid={`mapa-${s}`}>
                <Pane slot={s} units={data.units} topo={data.topo} values={vals[s]} level={level} year={year} selected={selected} cam={cam} reg={reg} onSelect={setSelected} onCam={onCam} />
              </div>
              <Legend ch={ch} unit={nameOf(ids[s])?.unit ?? ''} />
            </section>
          );
        })}
        {!data && <p>Wczytuję mapy…</p>}
      </div>
      <p className="px-4 py-2 text-sm" aria-live="polite">
        {selected ? <>Zaznaczono: <strong>{unitOf(selected)?.name ?? selected}</strong>. A: {valueAt('A')} · B: {valueAt('B')}</> : 'Dotknij miejsca na jednej z map – zaznaczy się na obu.'}
      </p>
    </div>
  );
}
