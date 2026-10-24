import { useMemo } from 'react';
import type { UnitProfile } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import type { MainView } from '../map/hooks/useMainView';
import { rankingScope } from '../../core/profile/sections';
import { rankUnits } from '../../core/ranking/ranking';
import { unitLabel } from '../../core/units/label';
import { buildIndex } from '../../core/units/units';
import { formatValue } from '../../core/format/number';
import { Annotate } from '../annotation/Annotate';
import { RankingBars } from '../ranking/RankingBars';

export interface ProfileOverviewProps {
  profile: UnitProfile;
  units: Unit[];
  view: MainView;
  onSelectUnit?: (teryt: string) => void;
}

/**
 * Sekcja przeglądu profilu na samej górze arkusza.
 * Wyświetla nazwę bieżącego wskaźnika i rok, dużą liczbę w kółku czerwonego długopisu,
 * słowny opis miejsca w rankingu oraz poziome słupki rankingu dla wszystkich jednostek
 * danego poziomu w kraju/województwie.
 */
export function ProfileOverview({
  profile,
  units,
  view,
  onSelectUnit,
}: ProfileOverviewProps) {
  const { indicator, year, values } = view;

  // 1. Wyznaczenie wartości dla wybranej jednostki
  const yearIdx = values?.years && year !== null ? values.years.indexOf(year) : -1;
  const rawValue =
    values && yearIdx !== -1 ? values.values[profile.teryt]?.[yearIdx] ?? null : null;

  // Sformatowana sama liczba (bez jednostki) do wyświetlenia w kółku zakreślenia
  const formattedNumberOnly =
    rawValue !== null ? formatValue(rawValue, null) : 'brak danych';

  // 2. Ranking w zakresie (województwo / kraj)
  const scope = useMemo(() => {
    if (!profile.unit) return null;
    return rankingScope(profile.unit, units);
  }, [profile.unit, units]);

  const parentTeryt =
    profile.unit && profile.unit.level !== 'woj'
      ? profile.teryt.slice(0, 2)
      : undefined;

  const rankedResult = useMemo(() => {
    if (!values || year === null || !profile.unit) return [];
    return rankUnits({
      values,
      units,
      level: profile.unit.level,
      year,
      parentTeryt,
      higherIsBetter: indicator.higherIsBetter,
    });
  }, [values, units, profile.unit, year, parentTeryt, indicator.higherIsBetter]);

  const unitMap = useMemo(() => buildIndex(units).byTeryt, [units]);

  // Znalezienie pozycji wybranej jednostki w rankingu zakreślenia
  const myRank = useMemo(() => {
    return rankedResult.find((r) => r.teryt === profile.teryt) ?? null;
  }, [rankedResult, profile.teryt]);

  // Tekst opisu miejsca (np. "2. miejsce wśród 16 województw" / "3. miejsce w województwie małopolskim")
  let rankText: string | null = null;
  if (myRank && rawValue !== null) {
    if (profile.unit?.level === 'woj') {
      const totalWoj = scope ? scope.teryts.length : 16;
      rankText = `${myRank.rank}. miejsce wśród ${totalWoj} województw`;
    } else if (scope?.description) {
      rankText = `${myRank.rank}. miejsce ${scope.description}`;
    }
  }

  // Tytuł nagłówka rankingu
  const rankingTitle = useMemo(() => {
    if (!profile.unit) return `${indicator.name}`;
    if (profile.unit.level === 'woj') {
      return `${indicator.name} we wszystkich województwach`;
    }

    const wojTeryt = profile.teryt.slice(0, 2);
    const wojUnit = units.find((u) => u.level === 'woj' && u.teryt === wojTeryt);
    let wojGenitive = '';
    if (wojUnit) {
      let name = wojUnit.name;
      if (name.toLowerCase().startsWith('województwo ')) {
        name = name.slice(12);
      }
      if (name.endsWith('e')) {
        wojGenitive = name.slice(0, -1) + 'go';
      } else {
        wojGenitive = name;
      }
    }

    const levelNoun = profile.unit.level === 'pow' ? 'powiatach' : 'gminach';
    return `${indicator.name} w ${levelNoun} województwa ${wojGenitive}`;
  }, [indicator.name, profile.unit, profile.teryt, units]);

  // Sformatowane nazwy jednostek w rankingu z użyciem unitLabel
  const itemsWithUnitLabels = useMemo(() => {
    return rankedResult.map((item) => {
      const u = unitMap.get(item.teryt);
      return {
        ...item,
        name: u ? unitLabel(u) : item.name,
      };
    });
  }, [rankedResult, unitMap]);

  return (
    <div className="space-y-4 py-3 border-b border-linia">
      {/* Nazwa wskaźnika i rok */}
      <div>
        <p className="text-xs text-olowek font-mono">
          {indicator.name}
          {year !== null && `, ${year}`}
        </p>

        {/* Duża liczba z jednostką i zakreśleniem circle */}
        <div className="flex items-baseline gap-3 my-2">
          {rawValue !== null ? (
            <Annotate type="circle" show={true}>
              <span className="text-4xl font-extrabold font-mono text-tusz tabular-nums">
                {formattedNumberOnly}
              </span>
            </Annotate>
          ) : (
            <span className="text-2xl font-bold font-mono text-tusz">
              {formattedNumberOnly}
            </span>
          )}
          {indicator.unit && (
            <span className="text-sm font-normal text-olowek">{indicator.unit}</span>
          )}
        </div>

        {/* Opis miejsca w rankingu */}
        {rankText && (
          <p className="text-xs text-olowek font-mono mt-1">{rankText}</p>
        )}
      </div>

      {/* Ranking jednostek danego poziomu w powiecie / województwie / kraju */}
      {itemsWithUnitLabels.length > 0 && (
        <div className="pt-2">
          <RankingBars
            title={rankingTitle}
            items={itemsWithUnitLabels}
            unit={indicator.unit}
            selectedTeryt={profile.teryt}
            limit={10}
            onSelect={onSelectUnit}
          />
        </div>
      )}
    </div>
  );
}
