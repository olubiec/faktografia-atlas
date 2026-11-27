import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { BUTTON_PRIMARY } from '../start/ListPodium';
import { RankingsToolbar } from './RankingsToolbar';
import { RankingsTable } from './RankingsTable';
import { RankingsShare } from '../pages/RankingsShare';
import { useIndicatorRegistry } from '../hooks/useIndicatorRegistry';
import { loadAnyValues } from '../../core/indicators/load-any-values';
import { isLibraryIndicatorId } from '../../core/indicators/registry';
import { filterRows, orderRows, pageOf } from '../../core/ranking/rankings-view';
import { listName } from '../../core/units/label';
import { formatValue, displayUnit } from '../../core/format/number';
import { mapHref } from '../../core/start/discoveries';
import { DEFAULT_INDICATOR_ID } from '../../core/map/main-view';
import { loadUnits } from '../../core/data/load-atlas-data';
import { rankUnits, type RankedUnit } from '../../core/ranking/ranking';
import { summarizeRanking } from '../../core/ranking/rankings-summary';
import {
  applyRankingsChange,
  readRankingsState,
  writeRankingsParams,
  type RankingsState,
} from '../../core/ranking/rankings-url';
import { allowedLevels } from '../../core/map/main-view';
import { fallbackLevel, levelsWithData } from '../../core/map/level-data';
import type { Unit } from '../../core/units/types';
import type { Indicator, IndicatorValues } from '../../core/profile/profile';
import indicatorsData from '../../../config/indicators.json';

const ALL_INDICATORS = indicatorsData as Indicator[];

const KNOWN_MAIN = new Set(ALL_INDICATORS.map((i) => i.id));
/** Wskaźnik główny albo z biblioteki (b123); czy biblioteka go ma, wiadomo dopiero po wczytaniu spisu. */
const isKnownId = (id: string) => KNOWN_MAIN.has(id) || isLibraryIndicatorId(id);

/** Napis o medianie z wartości rankingu (istniejące summarizeRanking); brak wartości = brak napisu. */
export function RankingMedian({ items, units, unit }: { items: RankedUnit[]; units: Unit[]; unit: string }) {
  if (items.length === 0) return null;
  const text = summarizeRanking(items, new Map(units.map((u) => [u.teryt, u])), unit).median;
  return text ? <p data-testid="ranking-median">{text}</p> : null;
}

export { MyIndicatorsBar } from '../pages/MyIndicatorsBar';

/** Ranking wskaźnika w całości (strona `/zestawienia?i=…`): pasek wyboru, podsumowanie i lista z nazwami. Stan w adresie. */
export function RankingsView() {
  const [params, setParams] = useSearchParams();
  const state = useMemo(() => readRankingsState(params.toString(), isKnownId), [params]);
  const { registry, ready } = useIndicatorRegistry();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loaded, setLoaded] = useState<{ id: string; values: IndicatorValues | null } | null>(null);

  useEffect(() => {
    let active = true;
    loadUnits().then((u) => { if (active) setUnits(u); });
    return () => { active = false; };
  }, []);

  const indicator = registry.byId.get(state.i);
  const libraryLevels = registry.levels.get(state.i);
  useEffect(() => {
    if (!indicator || units.length === 0) return;
    let active = true;
    loadAnyValues(indicator.id, { units, levels: libraryLevels }).then((v) => { if (active) setLoaded({ id: indicator.id, values: v }); });
    return () => { active = false; };
  }, [indicator, units, libraryLevels]);

  // Nieznany wskaźnik z biblioteki (spis wczytany, a go nie ma) wraca do domyślnego.
  useEffect(() => {
    if (ready && !indicator) setParams(writeRankingsParams({ ...state, i: DEFAULT_INDICATOR_ID }), { replace: true });
  }, [ready, indicator, state, setParams]);

  const values = loaded?.id === state.i ? loaded.values : null;
  const voivodeships = useMemo(() => units.filter((u) => u.level === 'woj').map((u) => ({ teryt: u.teryt, name: u.name })), [units]);
  const byTeryt = useMemo(() => new Map(units.map((u) => [u.teryt, u])), [units]);

  const onChange = (patch: Partial<RankingsState>) => {
    setParams(writeRankingsParams(applyRankingsChange(state, patch)), { replace: patch.q !== undefined });
  };

  const year = values ? (state.y !== null && values.years.includes(state.y) ? state.y : values.years[values.years.length - 1]) : null;

  // Poziomy z wartościami w wybranym roku (puste są wyłączone, jak w przełączniku mapy).
  const withData = useMemo(() => (values && year != null ? levelsWithData(values, year) : undefined), [values, year]);
  const availableLevels = useMemo(() => {
    const allowed = allowedLevels(indicator?.minLevel).filter((l) => !libraryLevels?.length || libraryLevels.includes(l));
    return !withData || withData.length === 0 ? allowed : allowed.filter((l) => withData.includes(l));
  }, [withData, indicator, libraryLevels]);

  // Wybrany poziom bez danych: przechodzimy na najbliższy z danymi.
  useEffect(() => {
    if (!values || availableLevels.length === 0) return;
    const next = fallbackLevel(state.l, availableLevels);
    if (next !== state.l) setParams(writeRankingsParams(applyRankingsChange(state, { l: next })), { replace: true });
  }, [values, availableLevels, state, setParams]);

  const ranking = useMemo(() => {
    if (!values || !units.length || year == null) return null;
    return rankUnits({ values, units, level: state.l, year, parentTeryt: state.w ?? undefined, higherIsBetter: indicator?.higherIsBetter ?? true });
  }, [values, units, state.l, state.w, year, indicator]);

  const nameOf = (teryt: string) => { const u = byTeryt.get(teryt); return u ? listName(u) : teryt; };
  const ordered = useMemo(() => (ranking ? orderRows(ranking.items, state.d) : []), [ranking, state.d]);
  const page = pageOf(filterRows(ordered, nameOf, state.q), state.p);
  const fmt = (v: number) => formatValue(v, indicator?.unit);
  const rows = page.rows.map((r) => {
    const u = byTeryt.get(r.teryt);
    const region = u && u.level !== 'woj' ? (voivodeships.find((v) => v.teryt === r.teryt.slice(0, 2))?.name ?? '') : '';
    return { teryt: r.teryt, pos: r.pos, name: nameOf(r.teryt), region, valueText: fmt(r.value), href: mapHref({ indicatorId: state.i, ...(year != null ? { year } : {}), teryt: r.teryt, level: state.l }) };
  });
  const first = ordered[0];
  const last = ordered[ordered.length - 1];

  return (
    <section aria-labelledby="ranking-wskaznika" className="w-full text-tusz" data-slot="ranking-view">
        <h2 id="ranking-wskaznika" className="mb-4 text-xl font-bold">{indicator ? `Ranking: ${indicator.name}` : 'Ranking'}</h2>

        <div className="mb-8 flex flex-col gap-3">
          {indicator ? (
            <RankingsToolbar state={state} indicator={indicator} years={values?.years ?? []} year={year} withData={withData} libraryLevels={libraryLevels} voivodeships={voivodeships} onChange={onChange} />
          ) : (
            <p role="status" className="text-sm text-olowek">Wczytujemy wskaźnik…</p>
          )}
        </div>

        {ranking && indicator && (
          <RankingsShare state={state} ranking={ranking.items} units={units} indicator={indicator} year={year} />
        )}

        {ranking && indicator && (
          <div className="mb-8 border border-linia bg-kalka/30 p-4" data-slot="rankings-summary">
            <h2 className="mb-2 text-xl font-semibold">Podsumowanie</h2>
            <RankingMedian items={ranking.items} units={units} unit={indicator.unit} />
            {first && last && (
              <>
                <p>{`Najwyżej: ${nameOf(first.teryt)} (${fmt(first.value)})`}</p>
                <p>{`Najniżej: ${nameOf(last.teryt)} (${fmt(last.value)})`}</p>
              </>
            )}
            <p className="mt-3"><Link to={mapHref({ indicatorId: state.i, ...(year != null ? { year } : {}), level: state.l })} className={BUTTON_PRIMARY}>Zobacz na mapie</Link></p>
          </div>
        )}

        {ranking && indicator && (
          <RankingsTable rows={rows} page={page.page} pages={page.pages} total={ordered.length} q={state.q} onQuery={(q) => onChange({ q })} onPage={(p) => onChange({ p })} unitLabel={displayUnit(indicator.unit)} />
        )}
        {!ranking && indicator && <p role="status" className="text-sm text-olowek">Wczytujemy ranking…</p>}
    </section>
  );
}
