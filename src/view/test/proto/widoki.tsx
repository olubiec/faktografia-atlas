import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import indicators from '../../../../config/indicators.json';
import { loadUnits } from '../../../core/data/load-atlas-data';
import { loadIndicatorValues } from '../../../core/data/load-values';
import { formatValue } from '../../../core/format/number';
import { rankUnits } from '../../../core/ranking/ranking';
import type { IndicatorValues } from '../../../core/profile/profile';
import type { Unit, UnitLevel } from '../../../core/units/types';
import { cn } from '../../../lib/utils';
import { RankingBars } from '../../ranking/RankingBars';
import { TrendChart } from '../../profile/TrendChart';

// PROTOTYP (zadanie U05): przełącznik 4 widoków tych samych danych. Bez nowych pakietów.
// Model adresu: ?v=mapa|wykres|tabela|ranking, plus istniejące i (wskaźnik), y (rok), l (poziom), u (miejsce).
const VIEWS = ['mapa', 'wykres', 'tabela', 'ranking'] as const;
type View = (typeof VIEWS)[number];
const VIEW_LABEL: Record<View, string> = { mapa: 'Mapa', wykres: 'Wykres', tabela: 'Tabela', ranking: 'Ranking' };
const LEVELS: { id: UnitLevel; label: string }[] = [
  { id: 'woj', label: 'Województwa' },
  { id: 'pow', label: 'Powiaty' },
  { id: 'gmi', label: 'Gminy' },
];
const CHOICES = indicators.filter((x) => ['population', 'density', 'unemployment-rate', 'avg-wage'].includes(x.id));

function readView(raw: string | null): View {
  return (VIEWS as readonly string[]).includes(raw ?? '') ? (raw as View) : 'mapa';
}

function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const pill = (on: boolean) =>
  cn('min-h-[44px] px-3 text-sm border border-linia cursor-pointer', on ? 'bg-tusz text-arkusz' : 'bg-arkusz text-tusz');

function TableView({ rows, unit, selected, onSelect }: { rows: ReturnType<typeof rankUnits>; unit: string; selected: string | null; onSelect: (t: string) => void }) {
  const [query, setQuery] = useState('');
  const [byName, setByName] = useState(false);
  const shown = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('pl');
    const list = rows.filter((r) => r.name.toLocaleLowerCase('pl').includes(q));
    return byName ? [...list].sort((a, b) => a.name.localeCompare(b.name, 'pl')) : list;
  }, [rows, query, byName]);
  return (
    <div>
      <input
        type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Szukaj miejsca"
        aria-label="Szukaj w tabeli" className="w-full min-h-[44px] px-3 mb-2 border border-linia bg-arkusz text-sm text-tusz"
      />
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-olowek">
            <th className="py-2 w-10">Nr</th>
            <th><button type="button" className="min-h-[44px] cursor-pointer" onClick={() => setByName(true)}>Miejsce{byName ? ' ▲' : ''}</button></th>
            <th className="text-right"><button type="button" className="min-h-[44px] cursor-pointer" onClick={() => setByName(false)}>Wartość{byName ? '' : ' ▼'}</button></th>
          </tr>
        </thead>
        <tbody>
          {shown.slice(0, 100).map((r) => (
            <tr key={r.teryt} className={cn('border-t border-linia', r.teryt === selected && 'font-bold text-korekta-tekst')}>
              <td className="py-2 font-mono text-xs">{r.rank}.</td>
              <td><button type="button" className="min-h-[44px] text-left cursor-pointer" onClick={() => onSelect(r.teryt)}>{r.name}</button></td>
              <td className="text-right font-mono tabular-nums">{formatValue(r.value, unit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {shown.length > 100 && <p className="py-2 text-xs text-olowek">Pokazano 100 z {shown.length}. Zawęź wyszukiwanie.</p>}
    </div>
  );
}

export default function WidokiPrototype() {
  const [params, setParams] = useSearchParams();
  const [units, setUnits] = useState<Unit[]>([]);
  const [values, setValues] = useState<IndicatorValues | null>(null);
  const view = readView(params.get('v'));
  const ind = CHOICES.find((x) => x.id === params.get('i')) ?? CHOICES[0];
  const level = (LEVELS.find((l) => l.id === params.get('l'))?.id ?? 'pow') as UnitLevel;
  const set = (patch: Record<string, string>) => setParams((p) => { const n = new URLSearchParams(p); for (const [k, v] of Object.entries(patch)) n.set(k, v); return n; }, { replace: true });

  useEffect(() => { void loadUnits().then(setUnits); }, []);
  useEffect(() => { void loadIndicatorValues(ind.id).then(setValues); }, [ind.id]);

  const years = useMemo(() => values?.years ?? [], [values]);
  const asked = Number(params.get('y'));
  const year = years.includes(asked) ? asked : years[years.length - 1];
  const higher = ind.higherIsBetter as boolean | null;
  const ranked = useMemo(
    () => (values && year ? rankUnits({ values, units, level, year, higherIsBetter: higher }) : null),
    [values, units, level, year, higher],
  );
  const selected = params.get('u') ?? ranked?.[0]?.teryt ?? null;
  const selectedName = units.find((u) => u.teryt === selected)?.name ?? '';
  const series = useMemo(() => {
    if (!values || !selected) return [];
    return years.map((y, i) => ({ year: y, value: values.values[selected]?.[i] ?? null }));
  }, [values, selected, years]);
  const nationalMedian = useMemo(() => {
    if (!values) return [];
    const ids = units.filter((u) => u.level === level).map((u) => u.teryt);
    return years.map((y, i) => ({ year: y, value: median(ids.map((t) => values.values[t]?.[i]).filter((v): v is number => typeof v === 'number')) }));
  }, [values, units, level, years]);
  const mapHref = `/?i=${ind.id}&l=${level}${selected ? `&u=${selected}` : ''}${year ? `&y=${year}` : ''}`;

  return (
    <main className="min-h-dvh bg-arkusz text-tusz">
      <div className="bg-ochra-tekst text-arkusz text-xs px-4 py-2 flex justify-between gap-2">
        <span>PROTOTYP – nie jest to docelowy ekran</span>
        <Link to="/__test/proto" className="underline">Lista prototypów</Link>
      </div>
      <div className="mx-auto max-w-2xl p-4 space-y-3">
        <h1 className="text-lg font-semibold">Jeden wskaźnik, cztery widoki</h1>
        <label className="block text-xs text-olowek">Wskaźnik
          <select value={ind.id} onChange={(e) => set({ i: e.target.value })} className="block w-full min-h-[44px] px-2 border border-linia bg-arkusz text-sm text-tusz">
            {CHOICES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <div role="tablist" aria-label="Widok danych" className="flex">
          {VIEWS.map((v) => (
            <button key={v} role="tab" aria-selected={v === view} className={cn(pill(v === view), 'flex-1')} onClick={() => set({ v })}>{VIEW_LABEL[v]}</button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {LEVELS.map((l) => <button key={l.id} aria-pressed={l.id === level} className={pill(l.id === level)} onClick={() => set({ l: l.id })}>{l.label}</button>)}
          <label className="text-xs text-olowek">Rok
            <select value={year ?? ''} onChange={(e) => set({ y: e.target.value })} className="ml-1 min-h-[44px] px-2 border border-linia bg-arkusz text-sm text-tusz">
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
        </div>
        <p className="text-xs text-olowek" data-testid="widoki-adres">Adres: ?v={view}&amp;i={ind.id}&amp;l={level}&amp;y={year ?? ''}&amp;u={selected ?? ''}</p>
        {!ranked ? <p role="status">Ładowanie danych…</p> : (
          <section aria-label={VIEW_LABEL[view]} className="border border-linia p-3">
            {view === 'mapa' && (
              <div className="space-y-2">
                <p className="text-sm">Tu będzie istniejąca mapa. W prototypie nie powielamy jej (to osobny ekran WebGL).</p>
                <Link to={mapHref} className="inline-flex items-center min-h-[44px] px-3 border border-tusz text-sm underline">Otwórz tę samą mapę</Link>
              </div>
            )}
            {view === 'wykres' && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold">{selectedName}: {ind.name}</h2>
                <TrendChart series={series} unit={ind.unit} label={ind.name} compareSeries={nationalMedian} compareLabel={`Mediana (${LEVELS.find((l) => l.id === level)?.label.toLowerCase()})`} />
              </div>
            )}
            {view === 'tabela' && <TableView rows={ranked} unit={ind.unit} selected={selected} onSelect={(t) => set({ u: t })} />}
            {view === 'ranking' && <RankingBars items={ranked} unit={ind.unit} selectedTeryt={selected} onSelect={(t) => set({ u: t })} title={`${ind.name}, ${year}`} />}
          </section>
        )}
      </div>
    </main>
  );
}
