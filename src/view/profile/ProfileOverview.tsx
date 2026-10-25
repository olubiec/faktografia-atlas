import { useMemo, useState, useEffect } from 'react';
import type { UnitProfile } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import type { MainView } from '../map/hooks/useMainView';
import { rankingScope } from '../../core/profile/sections';
import { rankUnits } from '../../core/ranking/ranking';
import { formatValue } from '../../core/format/number';
import { unitLabel } from '../../core/units/label';
import { Annotate } from '../annotation/Annotate';
import { RankingBars } from '../ranking/RankingBars';
import { TrendChart } from './TrendChart';
import { loadExplanations, type Explanation } from '../../core/explain/explanations';
import { unitTitle } from '../../core/units/label';
import { writeUrlState } from '../../core/url/state';
import { LazyShareDialog } from '../share/LazyShareDialog';
import type { ShareDialogData } from '../share/ShareDialog';
import type { ProfileCardData, RankingCardData } from '../../core/share/card';
import { Icon } from '../ui/Icon';
import { NavArrowDown, NavArrowUp, Download } from 'iconoir-react';

export interface ProfileOverviewProps {
  profile: UnitProfile;
  units: Unit[];
  view: MainView;
  onSelectUnit: (teryt: string) => void;
}

/**
 * Sekcja przeglądu profilu jednostki dla bieżącego wskaźnika.
 * Wyświetla nazwę wskaźnika, rok, dużą liczbę w czerwonym kółku (rough-notation),
 * opisaną pozycję w rankingu, zwijane detale (wykres lat, objaśnienie) oraz ranking ze słupkami (RankingBars).
 */
export function ProfileOverview({
  profile,
  units,
  view,
  onSelectUnit,
}: ProfileOverviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [explanation, setExplanation] = useState<Explanation | null>(null);

  useEffect(() => {
    let active = true;
    loadExplanations().then((map) => {
      if (active) {
        setExplanation(map.get(view.indicator.id) ?? null);
      }
    });
    return () => {
      active = false;
    };
  }, [view.indicator.id]);

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

  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleShowOnMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    writeUrlState({ i: view.indicator.id });
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const shareData = useMemo<ShareDialogData>(() => {
    const unitName = profile.unit ? unitTitle(profile.unit) : profile.teryt;

    const otherInds = profile.indicators
      .filter((item) => item.indicatorId !== view.indicator.id)
      .slice(0, 5)
      .map((item) => ({
        name: item.indicator.name,
        value: formatValue(item.value, null),
        unit: item.indicator.unit,
        rankText: item.rankVoivodeship ? `${item.rankVoivodeship}. miejsce` : undefined,
      }));

    const profileCard: ProfileCardData = {
      unitName,
      teryt: profile.teryt,
      indicatorName: view.indicator.name,
      unit: view.indicator.unit,
      year: view.year ?? 2025,
      bigNumber: formatValue(currentItem?.value ?? null, null),
      rankText: rankText ?? undefined,
      indicators: otherInds,
    };

    const rankingCard: RankingCardData | undefined = ranking
      ? {
          indicator: { name: view.indicator.name, unit: view.indicator.unit },
          year: view.year ?? 2025,
          items: rankingItems.map((item) => ({
            teryt: item.teryt,
            name: item.name,
            value: item.value,
            valueText: formatValue(item.value, view.indicator.unit),
            rank: item.rank,
            selected: item.teryt === profile.teryt,
          })),
          selectedTeryt: profile.teryt,
        }
      : undefined;

    return {
      profile: profileCard,
      ranking: rankingCard,
      unitProfile: profile,
    };
  }, [
    profile,
    view.indicator.id,
    view.indicator.name,
    view.indicator.unit,
    view.year,
    currentItem?.value,
    rankText,
    ranking,
    rankingItems,
  ]);

  return (
    <div className="space-y-4 pb-4 border-b border-linia">
      <style>{`span.text-korekta { color: var(--korekta-tekst) !important; }`}</style>
      {/* Nazwa wskaźnika, przycisk rozwijania i rok */}
      <div className="space-y-1">
        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((prev) => !prev)}
          className="w-full text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-tusz p-1 -m-1 hover:bg-linia/10 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-olowek font-mono">
            <span className="font-semibold text-tusz min-w-0 flex-1 truncate pr-2">
              {view.indicator.name}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {view.year !== null && <span>{view.year}</span>}
              <Icon
                icon={isExpanded ? NavArrowUp : NavArrowDown}
                size={18}
                aria-hidden={true}
                className="text-olowek"
              />
            </div>
          </div>
        </button>

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

      {/* Rozwinięcie ze szczegółami wskaźnika (wykres lat, objaśnienia, przycisk Pokaż na mapie) */}
      {isExpanded && (
        <div className="pt-2 space-y-3">
          {currentItem?.series && currentItem.series.length >= 2 && (
            <TrendChart
              series={currentItem.series}
              unit={view.indicator.unit}
              label={view.indicator.name}
            />
          )}

          {explanation && (
            <div className="bg-arkusz border border-linia p-3 space-y-2 text-xs">
              <div>
                <span className="font-semibold text-tusz block mb-0.5">Co to jest</span>
                <p className="text-olowek leading-relaxed">{explanation.short}</p>
              </div>
              <div>
                <span className="font-semibold text-tusz block mb-0.5">Jak czytać</span>
                <p className="text-olowek leading-relaxed">{explanation.howToRead}</p>
              </div>
              <div>
                <a
                  href={explanation.definitionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-tusz underline hover:text-olowek focus:outline-none focus:ring-2 focus:ring-tusz font-medium"
                >
                  Definicja GUS
                </a>
              </div>
            </div>
          )}

          <div className="pt-1">
            <button
              type="button"
              onClick={handleShowOnMap}
              className="min-h-[44px] min-w-[44px] px-4 py-2 bg-arkusz border border-linia hover:bg-linia/20 focus:outline-none focus:ring-2 focus:ring-tusz text-xs font-semibold text-tusz cursor-pointer transition-colors"
            >
              Pokaż na mapie
            </button>
          </div>
        </div>
      )}

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

      {/* Przycisk Pobierz i udostępnij */}
      <div className="pt-2 flex justify-start">
        <button
          type="button"
          onClick={() => setIsShareOpen(true)}
          className="min-h-[44px] min-w-[44px] px-4 py-2 bg-arkusz border border-linia hover:bg-linia/20 focus:outline-none focus:ring-2 focus:ring-tusz text-xs font-semibold text-tusz cursor-pointer transition-colors flex items-center gap-2"
        >
          <Icon icon={Download} size={16} aria-hidden={true} />
          <span>Pobierz i udostępnij</span>
        </button>
      </div>

      <LazyShareDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        defaultKind="profile"
        data={shareData}
      />
    </div>
  );
}
