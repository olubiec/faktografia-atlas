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
import { createDeck, type Deck, type NewPage } from '@/core/share/deck';
import { indicatorTableCsv, profileCsv, compareCsv, shareFileName, toCsv } from '@/core/share/csv';
import type { CardKind, CardData } from '@/core/share/card';
import { seedIndicators } from '@/core/share/deck-page-data';
import { BASIC_INDICATORS } from '@/core/indicators/basic';
import { pageCsv, type DeckCsvSection, type PageCsvInput } from '@/core/share/deck-csv';

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
  const mine = BASIC_INDICATORS;

  useEffect(() => {
    let cancelled = false;
    loadAdminTopo().then((topo) => {
      if (!cancelled) setTopoData(topo);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const { level, year, indicator, values } = view;  const activeWojTeryt =
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
      indicator: { name: indicator.name, unit: indicator.unit },
      year,
      items,
      selectedTeryt: selectedTeryt ?? undefined,
    };
  }, [indicator, year, ranking, scopeUnits, index, selectedTeryt]);

  // Profil: wskaźniki z listy „Moje” (+ bieżący dla dużej liczby karty), nie cały katalog
  const profileParts = useMemo(() => {
    if (!selectedTeryt || year == null || !values) return undefined;
    const picked = mine.flatMap((id) => view.indicators.filter((i) => i.id === id));
    const list = picked.some((i) => i.id === indicator.id) ? picked : [...picked, indicator];
    const profile = buildProfile(selectedTeryt, list, { [indicator.id]: values }, Array.from(index.byTeryt.values()));
    if (!profile.unit) return undefined;
    // CSV profilu: tylko wiersze z listy „Moje”
    const unitProfile = { ...profile, indicators: profile.indicators.filter((i) => mine.includes(i.indicatorId)) };
    return { profile, unit: profile.unit, unitProfile };
  }, [selectedTeryt, year, index, view.indicators, indicator, values, mine]);
  const unitProfile = profileParts?.unitProfile;
  const profileData = useMemo<ProfileCardData | undefined>(() => {
    if (!profileParts || year == null || !selectedTeryt) return undefined;
    const { profile, unit } = profileParts;
    const cur = profile.indicators.find((i) => i.indicatorId === indicator.id);
    const others = profile.indicators
      .filter((i) => i.indicatorId !== indicator.id && i.value != null).slice(0, 5)
      .map((i) => ({
        name: i.indicator.name,
        value: formatValue(i.value, i.indicator.unit),
        unit: i.indicator.unit,
        rankText: i.rankNational ? `${i.rankNational}. miejsce` : undefined,
      }));
    return {
      unitName: unit.name,
      teryt: selectedTeryt,
      indicatorName: indicator.name,
      unit: indicator.unit,
      year,
      bigNumber: cur && cur.value != null ? formatValue(cur.value, indicator.unit) : 'brak danych',
      rankText: cur?.rankNational ? `${cur.rankNational}. miejsce w Polsce` : undefined,
      indicators: others,
    };
  }, [profileParts, selectedTeryt, indicator, year]);

  return useMemo<ShareDialogData>(
    () => ({
      map: mapData,
      ranking: rankingData,
      profile: profileData,
      unitProfile,
      units: scopeUnits,
      indicatorValues: values ?? undefined,
      indicator: { ...indicator, minLevel: level },
      year: year ?? undefined,
    }),
    [mapData, rankingData, profileData, unitProfile, scopeUnits, values, indicator, level, year]
  );
}

/** Startowy zestaw stron: tylko podstawowe, dla których okno ma dane (PRODUKT §4b); resztę dodaje użytkownik. */
export function initialDeck(data: ShareDialogData, mine: readonly string[] = BASIC_INDICATORS): Deck {
  const activeId = data.indicator?.id ?? null;
  const ids = activeId ? [activeId] : [];
  const pages: NewPage[] = [];
  if (data.map) pages.push({ kind: 'map', indicatorIds: ids });
  if (data.ranking) pages.push({ kind: 'ranking', indicatorIds: ids, options: { side: 'top' } });
  if (data.profile) pages.push({ kind: 'profile', indicatorIds: seedIndicators('profile', mine, activeId) });
  if (data.compare) pages.push({ kind: 'compare', indicatorIds: seedIndicators('compare', mine, activeId) });
  return createDeck(pages.length ? pages : [{ kind: 'map', indicatorIds: ids }]);
}

// Dane CSV jednej strony; brak danych = strona jest pomijana.
function pageInput(kind: string, data: ShareDialogData): { input: PageCsvInput; title: string } | null {
  if ((kind === 'map' || kind === 'ranking') && data.units && data.indicatorValues && data.indicator && data.year) {
    return { input: { kind, units: data.units, values: data.indicatorValues, indicator: data.indicator, year: data.year }, title: data.indicator.name };
  }
  if (kind === 'profile' && data.unitProfile) {
    return { input: { kind, profile: data.unitProfile }, title: data.unitProfile.unit?.name ?? 'Profil' };
  }
  if ((kind === 'compare' || kind === 'versus') && data.compareRows) {
    return { input: { kind, rows: data.compareRows, a: data.compareUnitA ?? null, b: data.compareUnitB ?? null }, title: 'Porównanie' };
  }
  return null;
}

/** Sekcje pliku CSV zestawu – po jednej na stronę, która ma dane w oknie. */
export function deckCsvSections(deck: Deck, data: ShareDialogData): DeckCsvSection[] {
  const found = deck.pages.map((p) => pageInput(p.kind, data));
  return found.flatMap((f) => (f ? [{ title: f.title, csv: pageCsv(f.input) }] : []));
}

/** Dane karty dla strony; ranking „najniżej” bierze koniec listy. */
export function dataForPage(data: ShareDialogData, kind: CardKind, side?: 'top' | 'bottom'): CardData | undefined {
  if (kind === 'ranking' && data.ranking && side === 'bottom') {
    return { ...data.ranking, items: data.ranking.items.slice(-10) };
  }
  return data[kind];
}

/** CSV bieżącej karty („Pobierz dane (CSV)”) i nazwa pliku. */
export function singleCsv(data: ShareDialogData, kind: CardKind): { csv: string; fileName: string } {
  if (data.csvContent) {
    return { csv: data.csvContent, fileName: data.csvFileName || shareFileName('faktografia', [kind, 'dane'], 'csv') };
  }
  if (kind === 'profile' && data.unitProfile) {
    return { csv: profileCsv(data.unitProfile), fileName: shareFileName('faktografia', ['profil', data.unitProfile.teryt], 'csv') };
  }
  if (kind === 'compare' && data.compareRows) {
    return { csv: compareCsv(data.compareRows, data.compareUnitA, data.compareUnitB), fileName: shareFileName('faktografia', ['porownanie'], 'csv') };
  }
  if (data.units && data.indicatorValues && data.indicator && data.year) {
    return {
      csv: indicatorTableCsv(data.units, data.indicatorValues, data.indicator, data.year),
      fileName: shareFileName('faktografia', [data.indicator.id, data.indicator.minLevel, data.year], 'csv'),
    };
  }
  const csv = toCsv(['Tytuł', 'Wartość', 'Źródło'], [['Faktografia Atlas', 'Dane GUS', 'GUS, Bank Danych Lokalnych (CC BY 4.0)']]);
  return { csv, fileName: shareFileName('faktografia', ['dane'], 'csv') };
}
