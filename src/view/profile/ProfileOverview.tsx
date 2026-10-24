import { useMemo } from 'react';
import type { UnitProfile } from '../../core/profile/profile';
import type { Unit, UnitLevel } from '../../core/units/types';
import type { MainView } from '../map/hooks/useMainView';
import { rankingScope } from '../../core/profile/sections';
import { rankUnits } from '../../core/ranking/ranking';
import { unitLabel } from '../../core/units/label';
import { formatValue } from '../../core/format/number';
import { RankingBars } from '../ranking/RankingBars';
import { Annotate } from '../annotation/Annotate';

export interface ProfileOverviewProps {
  profile: UnitProfile;
  units: Unit[];
  view?: MainView;
  selectUnit?: (teryt: string) => void;
}

const LEVEL_WEIGHT: Record<UnitLevel, number> = {
  gmi: 1,
  pow: 2,
  woj: 3,
};

function voivodeshipGenitive(name: string): string {
  if (name.endsWith('e')) {
    return name.slice(0, -1) + 'go';
  }
  return name;
}

export function ProfileOverview({
  profile,
  units,
  view,
  selectUnit,
}: ProfileOverviewProps) {
  const targetUnit = profile.unit;

  const unitsByTeryt = useMemo(() => {
    const map = new Map<string, Unit>();
    for (const u of units) {
      map.set(u.teryt, u);
    }
    return map;
  }, [units]);

  const effectiveUnit = useMemo(() => {
    if (!targetUnit || !view) return null;
    let curr = targetUnit;
    while (
      LEVEL_WEIGHT[curr.level] < LEVEL_WEIGHT[view.indicator.minLevel] &&
      curr.parent !== null
    ) {
      const parentUnit = unitsByTeryt.get(curr.parent);
      if (!parentUnit) break;
      curr = parentUnit;
    }
    return curr;
  }, [targetUnit, view, unitsByTeryt]);

  const activeYear = view?.year ?? null;

  const ranking = useMemo(() => {
    if (!view || !effectiveUnit || !view.values || activeYear == null) return null;
    const parentTeryt = effectiveUnit.level !== 'woj' ? effectiveUnit.teryt.slice(0, 2) : undefined;
    return rankUnits({
      values: view.values,
      units,
      level: effectiveUnit.level,
      year: activeYear,
      parentTeryt,
      higherIsBetter: view.indicator.higherIsBetter,
    });
  }, [view, effectiveUnit, activeYear, units]);

  const rankingItems = useMemo(() => {
    if (!ranking || !ranking.items) return [];
    return ranking.items.map((item) => {
      const u = unitsByTeryt.get(item.teryt);
      return {
        ...item,
        name: u ? unitLabel(u) : item.name,
      };
    });
  }, [ranking, unitsByTeryt]);

  if (!targetUnit || !view || !effectiveUnit) {
    return null;
  }

  const indicator = view.indicator;

  let val: number | null = null;
  if (view.values && activeYear != null) {
    const yearIdx = view.values.years.indexOf(activeYear);
    if (yearIdx !== -1) {
      val = view.values.values[effectiveUnit.teryt]?.[yearIdx] ?? null;
    }
  }

  const scope = rankingScope(effectiveUnit, units);
  const rankedItem = ranking?.items.find((i) => i.teryt === effectiveUnit.teryt);

  let rankText: string | null = null;
  if (rankedItem && val !== null) {
    if (effectiveUnit.level === 'woj') {
      rankText = `${rankedItem.rank}. miejsce wśród ${rankedItem.total} województw`;
    } else {
      rankText = `${rankedItem.rank}. miejsce ${scope.description}`;
    }
  }

  const wojTeryt = effectiveUnit.teryt.slice(0, 2);
  const wojUnit = unitsByTeryt.get(wojTeryt);
  const wojGenitive = wojUnit ? voivodeshipGenitive(wojUnit.name) : '';

  let rankingTitle = '';
  if (effectiveUnit.level === 'woj') {
    rankingTitle = `${indicator.name} we wszystkich województwach`;
  } else if (effectiveUnit.level === 'pow') {
    rankingTitle = wojGenitive
      ? `${indicator.name} w powiatach województwa ${wojGenitive}`
      : `${indicator.name} w powiatach`;
  } else {
    rankingTitle = wojGenitive
      ? `${indicator.name} w gminach województwa ${wojGenitive}`
      : `${indicator.name} w gminach`;
  }

  return (
    <div className="py-4 space-y-4 border-b border-linia">
      <div className="space-y-1">
        <p className="text-xs text-olowek">
          {indicator.name}, {activeYear ?? ''}
        </p>

        {val !== null ? (
          <div className="flex items-baseline gap-2 pt-1 pb-1">
            <Annotate type="circle">
              <span className="text-3xl sm:text-4xl font-extrabold text-tusz font-mono">
                {formatValue(val)}
              </span>
            </Annotate>
            <span className="text-xs text-olowek font-medium">{indicator.unit}</span>
          </div>
        ) : (
          <p className="text-sm text-olowek">brak danych</p>
        )}

        {rankText && <p className="text-sm font-semibold text-tusz pt-1">{rankText}</p>}
      </div>

      {rankingItems.length > 0 && (
        <div className="pt-2">
          <RankingBars
            items={rankingItems}
            unit={indicator.unit}
            selectedTeryt={effectiveUnit.teryt}
            limit={10}
            onSelect={selectUnit}
            title={rankingTitle}
          />
        </div>
      )}
    </div>
  );
}
