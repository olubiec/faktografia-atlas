import { useState, useEffect, useMemo } from 'react';
import type { MainView } from '@/view/map/hooks/useMainView';
import type { ChoroplethData } from '@/view/map/hooks/useChoropleth';
import type { RankedResult } from '@/core/ranking/ranking';
import type { UnitIndex } from '@/core/units/types';
import type { MapCardData, RankingCardData, ProfileCardData } from '@/core/share/card';
import type { ShareDialogData } from '@/view/share/ShareDialog';
import { loadAdminTopo } from '@/core/data/load-atlas-data';
import { loadGeoData } from '@/view/map/layers/admin';
import { LEVEL_LABELS } from '@/core/map/main-view';
import { formatValue } from '@/core/format/number';
import { buildProfile } from '@/core/profile/profile';

export interface UseShareDataProps {
  view: MainView;
  choropleth: ChoroplethData | null;
  ranking: RankedResult | null;
  index: UnitIndex;
  selectedTeryt: string | null;
}

/**
 * Zbiera dane kart (Mapa, Ranking, opcjonalnie Profil) oraz CSV dla bieżącego widoku wskaźnika.
 * Korzysta z danych w pamięci (loadAdminTopo) bez wysyłania nowych żądań sieciowych.
 */
export function useShareData({
  view,
  choropleth,
  ranking,
  index,
  selectedTeryt,
}: UseShareDataProps): ShareDialogData {
  const [topoData, setTopoData] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminTopo().then((topo) => {
      if (!cancelled) setTopoData(topo);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const { level, year, indicator, values } = view;

  const activeWojTeryt =
    choropleth?.activeScope?.activeWojTeryt ??
    (selectedTeryt && selectedTeryt.length >= 2 ? selectedTeryt.slice(0, 2) : null);
  const activePowTeryt =
    choropleth?.activeScope?.activePowTeryt ??
    (selectedTeryt && selectedTeryt.length >= 4 ? selectedTeryt.slice(0, 4) : null);

  // Jednostki dla bieżącego widoku / obszaru
  const scopeUnits = useMemo(() => {
    const all = Array.from(index.byTeryt.values());
    if (level === 'woj') {
      return all.filter((u) => u.level === 'woj');
    }
    if (level === 'pow') {
      if (activeWojTeryt) {
        return all.filter((u) => u.level === 'pow' && u.teryt.startsWith(activeWojTeryt));
      }
      return all.filter((u) => u.level === 'pow');
    }
    if (level === 'gmi') {
      if (activePowTeryt) {
        return all.filter((u) => u.level === 'gmi' && u.teryt.startsWith(activePowTeryt));
      }
      if (activeWojTeryt) {
        return all.filter((u) => u.level === 'gmi' && u.teryt.startsWith(activeWojTeryt));
      }
      return all.filter((u) => u.level === 'gmi');
    }
    return [];
  }, [index, level, activeWojTeryt, activePowTeryt]);

  // Cechy GeoJSON dla mapy w bieżącym widoku
  const scopeFeatures = useMemo(() => {
    if (!topoData) return null;
    const { wojFeatures, powFeatures, gmiFeatures } = loadGeoData(topoData);

    if (level === 'woj') {
      return wojFeatures.features;
    }
    if (level === 'pow') {
      if (activeWojTeryt) {
        return powFeatures.features.filter((f: any) =>
          f.properties?.teryt?.startsWith(activeWojTeryt)
        );
      }
      return powFeatures.features;
    }
    if (level === 'gmi') {
      if (activePowTeryt) {
        return gmiFeatures.features.filter((f: any) =>
          f.properties?.teryt?.startsWith(activePowTeryt)
        );
      }
      if (activeWojTeryt) {
        return gmiFeatures.features.filter((f: any) =>
          f.properties?.teryt?.startsWith(activeWojTeryt)
        );
      }
      return gmiFeatures.features;
    }
    return [];
  }, [topoData, level, activeWojTeryt, activePowTeryt]);

  // Karta: Mapa
  const mapData = useMemo<MapCardData | undefined>(() => {
    if (year == null) return undefined;

    let parentUnitName = '';
    if (activePowTeryt && index.byTeryt.has(activePowTeryt)) {
      parentUnitName = index.byTeryt.get(activePowTeryt)?.name ?? '';
    } else if (activeWojTeryt && index.byTeryt.has(activeWojTeryt)) {
      parentUnitName = index.byTeryt.get(activeWojTeryt)?.name ?? '';
    }

    const levelNoun = LEVEL_LABELS[level].toLowerCase();
    const unitName = parentUnitName
      ? `${parentUnitName}, ${year}, ${levelNoun}`
      : `${year}, ${levelNoun}`;

    return {
      indicator: {
        name: indicator.name,
        unit: indicator.unit,
        year,
      },
      year,
      unitName,
      features: scopeFeatures,
      classOf: (teryt: string) => {
        const cls = choropleth?.classByTeryt?.[teryt];
        if (cls === 0 || cls === 1 || cls === 2 || cls === 3 || cls === 4) {
          return cls;
        }
        return 'noData';
      },
      selectedTeryt: selectedTeryt ?? undefined,
    };
  }, [indicator, year, level, activeWojTeryt, activePowTeryt, index, scopeFeatures, choropleth, selectedTeryt]);

  // Karta: Ranking
  const rankingData = useMemo<RankingCardData | undefined>(() => {
    if (year == null || !ranking) return undefined;

    const scopeTeryts = new Set(scopeUnits.map((u) => u.teryt));
    const items = ranking.items
      .filter((r) => scopeTeryts.has(r.teryt))
      .map((r) => {
        const unit = index.byTeryt.get(r.teryt);
        const name = unit
          ? unit.level === 'pow'
            ? unit.name.replace(/^powiat /, '')
            : unit.name
          : r.name;
        return {
          teryt: r.teryt,
          name,
          value: r.value,
          valueText: formatValue(r.value, indicator.unit),
          rank: r.rank,
          selected: r.teryt === selectedTeryt,
        };
      });

    return {
      indicator: {
        name: indicator.name,
        unit: indicator.unit,
      },
      year,
      items,
      selectedTeryt: selectedTeryt ?? undefined,
    };
  }, [indicator, year, ranking, scopeUnits, index, selectedTeryt]);

  // Karta: Profil (jeśli wybrano jednostkę)
  const profileData = useMemo<ProfileCardData | undefined>(() => {
    if (!selectedTeryt || year == null || !values) return undefined;
    const allUnits = Array.from(index.byTeryt.values());
    const profile = buildProfile(
      selectedTeryt,
      view.indicators,
      { [indicator.id]: values },
      allUnits
    );
    if (!profile.unit) return undefined;

    const currentItem = profile.indicators.find((i) => i.indicatorId === indicator.id);
    const bigNumber =
      currentItem && currentItem.value != null
        ? formatValue(currentItem.value, indicator.unit)
        : 'brak danych';

    const otherIndicators = profile.indicators
      .filter((i) => i.indicatorId !== indicator.id && i.value != null)
      .slice(0, 5)
      .map((i) => ({
        name: i.indicator.name,
        value: formatValue(i.value, i.indicator.unit),
        unit: i.indicator.unit,
        rankText: i.rankNational ? `${i.rankNational}. miejsce` : undefined,
      }));

    return {
      unitName: profile.unit.name,
      teryt: selectedTeryt,
      indicatorName: indicator.name,
      unit: indicator.unit,
      year,
      bigNumber,
      rankText: currentItem?.rankNational ? `${currentItem.rankNational}. miejsce w Polsce` : undefined,
      indicators: otherIndicators,
    };
  }, [selectedTeryt, year, index, view.indicators, indicator, values]);

  return useMemo<ShareDialogData>(
    () => ({
      map: mapData,
      ranking: rankingData,
      profile: profileData,
      units: scopeUnits,
      indicatorValues: values ?? undefined,
      indicator: { ...indicator, minLevel: level },
      year: year ?? undefined,
    }),
    [mapData, rankingData, profileData, scopeUnits, values, indicator, level, year]
  );
}
