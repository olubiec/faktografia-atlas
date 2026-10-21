import type { UnitProfile, ProfileIndicatorItem } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import type { RankedUnit } from '../../core/ranking/ranking';
import { currentIndicatorItem, rankingScope } from '../../core/profile/sections';
import { getProfileShardFromCache } from '../../core/data/load-profile';
import { formatValue } from '../../core/format/number';
import { unitLabel } from '../../core/units/label';
import { RankingBars } from '../ranking/RankingBars';
import { Annotate } from '../annotation/Annotate';
import { DEFAULT_INDICATOR_ID } from '../../core/map/main-view';
import indicatorsData from '../../../config/indicators.json';

export interface ProfileOverviewProps {
  profile: UnitProfile;
  units: Unit[];
  activeIndicatorId?: string | null;
  onSelectUnit?: (teryt: string) => void;
}

/**
 * Zwraca listę pozycji rankingowych dla wybranego zakresu i wskaźnika.
 * Dane pobierane są bezpośrednio z pamięci podręcznej pobranego szardu.
 */
function buildScopeRanking(
  profile: UnitProfile,
  currentItem: ProfileIndicatorItem,
  units: Unit[]
): RankedUnit[] {
  if (!profile.unit) return [];

  const scope = rankingScope(profile.unit, units);
  const targetUnits = units.filter((u) => scope.teryts.includes(u.teryt));

  const shard = getProfileShardFromCache(profile.teryt.slice(0, 2));
  if (!shard || !shard.units) return [];

  const indicator = indicatorsData.find((i) => i.id === currentItem.indicatorId);
  const higherIsBetter = indicator?.higherIsBetter ?? null;

  const rawItems: { teryt: string; name: string; value: number }[] = [];

  for (const unit of targetUnits) {
    const shardItems = shard.units[unit.teryt] ?? shard.voivodeships?.[unit.teryt];
    if (!shardItems) continue;

    const item = shardItems.find((i) => i.indicatorId === currentItem.indicatorId);
    if (item && item.value !== null && !Number.isNaN(item.value)) {
      rawItems.push({
        teryt: unit.teryt,
        name: unitLabel(unit),
        value: item.value,
      });
    }
  }

  const isDescending = higherIsBetter !== false;
  rawItems.sort((a, b) => {
    if (a.value !== b.value) {
      return isDescending ? b.value - a.value : a.value - b.value;
    }
    return a.name.localeCompare(b.name, 'pl');
  });

  const total = rawItems.length;
  return rawItems.map((item) => {
    let betterCount = 0;
    if (higherIsBetter === false) {
      for (const other of rawItems) {
        if (other.value < item.value) betterCount++;
      }
    } else {
      for (const other of rawItems) {
        if (other.value > item.value) betterCount++;
      }
    }

    return {
      teryt: item.teryt,
      name: item.name,
      value: item.value,
      rank: 1 + betterCount,
      total,
    };
  });
}

/**
 * Sekcja przeglądu górnej części profilu:
 * Prezentuje bieżący wskaźnik z dużą wartością, zakreśleniem, rokiem, miejscem w zakresie oraz rankingiem ze słupkami.
 */
export function ProfileOverview({
  profile,
  units,
  activeIndicatorId,
  onSelectUnit,
}: ProfileOverviewProps) {
  const currentItem = currentIndicatorItem(profile, activeIndicatorId, DEFAULT_INDICATOR_ID);

  if (!currentItem) {
    return null;
  }

  const scope = profile.unit ? rankingScope(profile.unit, units) : null;
  const isWoj = profile.unit?.level === 'woj';
  const rank = isWoj ? currentItem.rankNational : currentItem.rankVoivodeship;

  const formattedVal = formatValue(currentItem.value, currentItem.indicator.unit);

  const rankText =
    rank !== null && scope
      ? `${rank}. miejsce ${scope.description}`
      : null;

  const rankingItems = buildScopeRanking(profile, currentItem, units);

  return (
    <div className="space-y-4 py-3 border-b border-linia">
      {/* Bieżący wskaźnik */}
      <div className="space-y-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-olowek">
          {currentItem.indicator.name}
          {currentItem.year !== null && (
            <span className="font-normal normal-case text-olowek ml-1">
              ({currentItem.year})
            </span>
          )}
        </h3>

        <div className="pt-1 pb-1">
          <Annotate type="highlight" show={true}>
            <span className="text-3xl font-extrabold text-tusz font-mono tracking-tight">
              {formattedVal}
            </span>
          </Annotate>
        </div>

        {rankText && (
          <p className="text-sm font-medium text-tusz">
            {rankText}
          </p>
        )}
      </div>

      {/* Ranking zakresu */}
      {rankingItems.length > 0 && (
        <div className="pt-2">
          <RankingBars
            items={rankingItems}
            unit={currentItem.indicator.unit}
            selectedTeryt={profile.teryt}
            limit={10}
            onSelect={onSelectUnit}
          />
        </div>
      )}
    </div>
  );
}
