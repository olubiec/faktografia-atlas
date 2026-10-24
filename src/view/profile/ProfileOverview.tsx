import { useMemo } from 'react';
import type { UnitProfile } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import type { MainView } from '../map/hooks/useMainView';
import { rankingScope } from '../../core/profile/sections';
import { rankUnits } from '../../core/ranking/ranking';
import { formatValue } from '../../core/format/number';
import { unitLabel } from '../../core/units/label';
import { Annotate } from '../annotation/Annotate';
import { RankingBars } from '../ranking/RankingBars';

export interface ProfileOverviewProps {
  profile: UnitProfile;
  units: Unit[];
  view: MainView;
  onSelectUnit: (teryt: string) => void;
}

/**
 * Sekcja przeglądu profilu jednostki dla bieżącego wskaźnika.
 * Wyświetla nazwę wskaźnika, rok, dużą liczbę w czerwonym kółku (rough-notation),
 * opisaną pozycję w rankingu oraz ranking ze słupkami (RankingBars).
 */
export function ProfileOverview({
  profile,
  units,
  view,
  onSelectUnit,
}: ProfileOverviewProps) {
  const currentItem = useMemo(() => {
    return (
      profile.indicators.find((item) => item.indicatorId === view.indicator.id) ??
      profile.indicators[0]
    );
  }, [profile.indicators, view.indicator.id]);

  const formattedValue = useMemo(() => {
    return formatValue(currentItem?.value ?? null, view.indicator.unit);
  }, [currentItem?.value, view.indicator.unit]);

  const scope = useMemo(() => {
    return profile.unit ? rankingScope(profile.unit, units) : { teryts: [], description: '' };
  }, [profile.unit, units]);

  const ranking = useMemo(() => {
    if (!view.values || view.year === null || !profile.unit) return null;
    return rankUnits({
      values: view.values,
      units,
      level: profile.unit.level,
      year: view.year,
      parentTeryt: profile.unit.level === 'woj' ? undefined : profile.unit.teryt.slice(0, 2),
      higherIsBetter: view.indicator.higherIsBetter,
    });
  }, [view.values, view.year, profile.unit, units, view.indicator.higherIsBetter]);

  const currentRankItem = useMemo(() => {
    if (!ranking) return null;
    return ranking.items.find((item) => item.teryt === profile.teryt) ?? null;
  }, [ranking, profile.teryt]);

  const rankText = useMemo(() => {
    if (!currentRankItem || !profile.unit) return null;
    if (profile.unit.level === 'woj') {
      return `${currentRankItem.rank}. miejsce wśród ${currentRankItem.total} województw`;
    }
    return `${currentRankItem.rank}. miejsce ${scope.description}`;
  }, [currentRankItem, profile.unit, scope.description]);

  const rankingTitle = useMemo(() => {
    if (!profile.unit) return `${view.indicator.name} w rankingu`;
    if (profile.unit.level === 'woj') {
      return `${view.indicator.name} we wszystkich województwach`;
    }

    const wojTeryt = profile.unit.teryt.slice(0, 2);
    const wojUnit = units.find((u) => u.level === 'woj' && u.teryt === wojTeryt);
    const wojName = wojUnit?.name ?? '';
    const wojGenitive = wojName.endsWith('e') ? wojName.slice(0, -1) + 'ego' : wojName;

    if (profile.unit.level === 'pow') {
      return `${view.indicator.name} w powiatach województwa ${wojGenitive}`;
    }
    return `${view.indicator.name} w gminach województwa ${wojGenitive}`;
  }, [view.indicator.name, profile.unit, units]);

  const rankingItems = useMemo(() => {
    if (!ranking) return [];
    const unitMap = new Map(units.map((u) => [u.teryt, u]));
    return ranking.items.map((item) => {
      const u = unitMap.get(item.teryt);
      return {
        ...item,
        name: u ? unitLabel(u) : item.name,
      };
    });
  }, [ranking, units]);

  return (
    <div className="space-y-4 pb-4 border-b border-linia">
      {/* Nazwa wskaźnika i rok */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-olowek font-mono">
          <span className="font-semibold">{view.indicator.name}</span>
          {view.year !== null && <span>{view.year}</span>}
        </div>

        {/* Duża liczba z zakreśleniem kółkiem i pozycja w rankingu */}
        <div className="flex flex-col items-start gap-2 pt-1">
          <Annotate type="circle" show={true}>
            <span className="text-3xl font-extrabold leading-none tabular-nums text-tusz px-1">
              {formattedValue}
            </span>
          </Annotate>

          {rankText && (
            <span className="text-sm font-semibold text-olowek">
              {rankText}
            </span>
          )}
        </div>
      </div>

      {/* Tabela rankingowa */}
      <div className="pt-2">
        <RankingBars
          items={rankingItems}
          unit={view.indicator.unit}
          selectedTeryt={profile.teryt}
          limit={10}
          onSelect={onSelectUnit}
          title={rankingTitle}
        />
      </div>
    </div>
  );
}
