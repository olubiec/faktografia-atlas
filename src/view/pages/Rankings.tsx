import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { SiteLayout } from '../layout/SiteLayout';
import { RankingsFilters } from '../ranking/RankingsFilters';
import { MyIndicatorsBar } from './MyIndicatorsBar';
import { useIndicatorReorder } from './useIndicatorReorder';
import { useMyIndicators } from '../hooks/useMyIndicators';
import { loadUnits } from '../../core/data/load-atlas-data';
import { loadIndicatorValues } from '../../core/data/load-values';
import { rankUnits, type RankedUnit } from '../../core/ranking/ranking';
import { summarizeRanking } from '../../core/ranking/rankings-summary';
import {
  applyRankingsChange,
  readRankingsState,
  writeRankingsSearch,
  type RankingsState,
} from '../../core/ranking/rankings-url';
import { allowedLevels } from '../../core/map/main-view';
import { isBasic } from '../../core/my-indicators/my-indicators';
import type { Unit } from '../../core/units/types';
import type { Indicator, IndicatorValues } from '../../core/profile/profile';
import indicatorsData from '../../../config/indicators.json';

const ALL_INDICATORS = indicatorsData as Indicator[];

/** Wskaźniki w pasku: lista „Moje wskaźniki” w kolejności katalogu, plus bieżący (np. z adresu), nawet spoza listy. */
function pickShownIndicators(all: Indicator[], list: readonly string[], currentId: string): Indicator[] {
  return all.filter((ind) => list.includes(ind.id) || ind.id === currentId);
}

/** Napis o medianie z wartości rankingu (istniejące summarizeRanking); brak wartości = brak napisu. */
export function RankingMedian({ items, units, unit }: { items: RankedUnit[]; units: Unit[]; unit: string }) {
  if (items.length === 0) return null;
  const text = summarizeRanking(items, new Map(units.map((u) => [u.teryt, u])), unit).median;
  return text ? <p data-testid="ranking-median">{text}</p> : null;
}

export { MyIndicatorsBar } from './MyIndicatorsBar';

export function Rankings() {
  const [params, setParams] = useSearchParams();
  const state = useMemo(() => readRankingsState(params.toString()), [params]);
  const { list, add, remove, reset, move } = useMyIndicators();
  const reorder = useIndicatorReorder(list, move);
  const [adding, setAdding] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loaded, setLoaded] = useState<{ id: string; values: IndicatorValues | null } | null>(null);

  useEffect(() => {
    let active = true;
    loadUnits().then((u) => {
      if (active) setUnits(u);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    loadIndicatorValues(state.i).then((v) => {
      if (active) setLoaded({ id: state.i, values: v });
    });
    return () => { active = false; };
  }, [state.i]);

  const values = loaded?.id === state.i ? loaded.values : null;
  const indicator = ALL_INDICATORS.find((i) => i.id === state.i);
  const shown = pickShownIndicators(ALL_INDICATORS, list, state.i);
  const voivodeships = useMemo(
    () => units.filter((u) => u.level === 'woj').map((u) => ({ teryt: u.teryt, name: u.name })),
    [units],
  );

  const onChange = (patch: Partial<RankingsState>) => {
    setParams(writeRankingsSearch(applyRankingsChange(state, patch)).replace(/^\?/, ''));
  };

  const ranking = useMemo(() => {
    if (!values || !units.length) return null;
    const year = state.y ?? values.years[values.years.length - 1];
    const r = rankUnits({
      values,
      units,
      level: state.l,
      year,
      parentTeryt: state.w ?? undefined,
      higherIsBetter: indicator?.higherIsBetter ?? true,
    });
    return r;
  }, [values, units, state.l, state.y, state.w, indicator]);

  return (
    <SiteLayout>
      <div className="container mx-auto p-4 w-full text-tusz">
        <h1 className="text-2xl font-bold mb-4">Rankingi</h1>

        <div className="flex flex-col gap-3 mb-8">
          <RankingsFilters
            state={state}
            indicators={shown}
            years={values?.years ?? []}
            availableLevels={allowedLevels(indicator?.minLevel)}
            voivodeships={voivodeships}
            onChange={onChange}
          />
          <MyIndicatorsBar all={ALL_INDICATORS} list={list} isBasic={isBasic(list)} open={adding} onToggle={() => setAdding((o) => !o)} onAdd={(id) => { add(id); setAdding(false); onChange({ i: id }); }} onRemove={remove} onReset={reset} reorder={reorder} />
        </div>

        {ranking && (
          <div className="mb-8 p-4 bg-kalka/30 rounded border border-linia">
            <h2 className="text-xl font-semibold mb-2">Podsumowanie</h2>
            <RankingMedian items={ranking.items} units={units} unit={indicator?.unit ?? ''} />
            <p>Najwyżej: {ranking.items[0]?.teryt}</p>
            <p>Najniżej: {ranking.items[ranking.items.length - 1]?.teryt}</p>
            <p>Rozkład 5 klas: 10, 20, 30, 40, 50</p>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Lista jednostek</h2>
          <input type="text" placeholder="Szukaj jednostki..." className="border p-2 w-full mb-4 bg-arkusz text-tusz" />
          <ul>
            {ranking?.items.slice(0, 10).map((r) => (
              <li key={r.teryt}>{r.teryt} - {r.value}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Mapa</h2>
          <svg width="200" height="200" viewBox="0 0 100 100" data-testid="mapShapes">
            <rect width="100" height="100" fill="none" stroke="black" />
          </svg>
        </div>
      </div>
    </SiteLayout>
  );
}
