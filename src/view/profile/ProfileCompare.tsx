import { useState, useEffect, useMemo, useCallback } from 'react';
import type { UnitProfile, IndicatorValues, Indicator } from '../../core/profile/profile';
import { buildProfile } from '../../core/profile/profile';
import type { Unit, UnitLevel } from '../../core/units/types';
import type { MainView } from '../map/hooks/useMainView';
import { CompareMaps } from './CompareMaps';
import { ProfileCompareTable } from './ProfileCompareTable';
import { compare } from '../../core/compare/compare';
import { unitTitle } from '../../core/units/label';
import { formatValue } from '../../core/format/number';
import { loadAdminTopo, loadUnits } from '../../core/data/load-atlas-data';
import { loadGeoData } from '../map/layers/admin';
import { buildChoropleth } from '../../core/map/choropleth';
import { loadIndicatorValues } from '../../core/data/load-values';
import { loadProfileShard, profileFromShard } from '../../core/data/load-profile';
import { readUrlState, writeUrlState } from '../../core/url/state';
import { useSearch } from '../search/useSearch';
import { LazyShareDialog } from '../share/LazyShareDialog';
import type { ShareDialogData } from '../share/ShareDialog';
import type { CompareCardData, CompareCardRow } from '../../core/share/card';
import { Icon } from '../ui/Icon';
import { Download, Search, Xmark } from 'iconoir-react';
import { cn } from '../../lib/utils';
import indicatorsData from '../../../config/indicators.json';

const indicators = indicatorsData as Indicator[];

const CONTRAST_SUGGESTIONS: Record<'woj' | 'pow' | 'gmi', { teryt: string; name: string }[]> = {
  woj: [
    { teryt: '14', name: 'Mazowieckie' },
    { teryt: '24', name: 'Śląskie' },
    { teryt: '18', name: 'Podkarpackie' },
    { teryt: '20', name: 'Podlaskie' },
  ],
  pow: [
    { teryt: '1465', name: 'Warszawa' },
    { teryt: '1261', name: 'Kraków' },
    { teryt: '1801', name: 'bieszczadzki' },
    { teryt: '2005', name: 'hajnowski' },
  ],
  gmi: [
    { teryt: '1465011', name: 'Warszawa' },
    { teryt: '1261011', name: 'Kraków' },
    { teryt: '1001042', name: 'Kleszczów' },
    { teryt: '1821022', name: 'Cisna' },
  ],
};

export interface ProfileCompareProps {
  profileA: UnitProfile;
  profileB?: UnitProfile | null;
  units?: Unit[];
  view?: MainView;
  onSelectUnit?: (teryt: string) => void;
  className?: string;
}

/**
 * Komponent zakładek/sekcji porównania profilu.
 * Umożliwia wyszukanie i wybór drugiego miejsca do porównania (ustawiając parametr ?c= w URL).
 * Gdy wybrano drugi profil, renderuje mapki porównawcze (CompareMaps),
 * tabelę porównawczą (ProfileCompareTable), przycisk wyczyszczenia (×) oraz „Pobierz i udostępnij”.
 */
export function ProfileCompare({
  profileA,
  profileB: profileBProp,
  units: unitsProp,
  view,
  onSelectUnit,
  className,
}: ProfileCompareProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [topoData, setTopoData] = useState<any>(null);
  const [loadedUnits, setLoadedUnits] = useState<Unit[]>([]);
  const [fetchedValues, setFetchedValues] = useState<IndicatorValues | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [loadedProfileB, setLoadedProfileB] = useState<UnitProfile | null>(null);
  const [cleared, setCleared] = useState(false);
  const [selectedTerytB, setSelectedTerytB] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const c = readUrlState(window.location.search).c;
    if (!c) return null;
    const parts = c.split(',');
    return parts.length === 2 && parts[1] ? parts[1] : null;
  });

  const units = unitsProp ?? loadedUnits;
  const indicatorValues = view?.values ?? fetchedValues;

  const indicatorId =
    view?.indicator.id ??
    profileA.indicators[0]?.indicatorId ??
    'population-density';

  const year = view?.year ?? profileA.indicators[0]?.year ?? 2025;

  useEffect(() => {
    let active = true;

    loadAdminTopo().then((topo) => {
      if (active) setTopoData(topo);
    });

    if (!unitsProp) {
      loadUnits().then((u) => {
        if (active) setLoadedUnits(u);
      });
    }

    return () => {
      active = false;
    };
  }, [unitsProp]);

  useEffect(() => {
    if (view?.values) return;

    let active = true;
    loadIndicatorValues(indicatorId).then((vals) => {
      if (active) setFetchedValues(vals);
    });

    return () => {
      active = false;
    };
  }, [view?.values, indicatorId]);

  // Nasłuchiwanie na zmiany URL (popstate)
  useEffect(() => {
    const onPopState = () => {
      const c = readUrlState(window.location.search).c;
      if (c) {
        const parts = c.split(',');
        if (parts.length === 2 && parts[1]) {
          setSelectedTerytB(parts[1]);
          setCleared(false);
          return;
        }
      }
      setSelectedTerytB(null);
      setCleared(true);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Wczytywanie profilu B na podstawie selectedTerytB
  useEffect(() => {
    if (profileBProp !== undefined && profileBProp !== null) {
      return;
    }
    if (!selectedTerytB || selectedTerytB === profileA.teryt) {
      return;
    }

    let active = true;
    const wojTeryt = selectedTerytB.slice(0, 2);

    loadProfileShard(wojTeryt)
      .then((shard) => {
        if (!active) return;
        const prof = profileFromShard(selectedTerytB, shard, indicators, units);
        setLoadedProfileB(prof);
      })
      .catch(() => {
        if (!active) return;
        setLoadedProfileB(buildProfile(selectedTerytB, indicators, {}, units));
      });

    return () => {
      active = false;
    };
  }, [profileBProp, selectedTerytB, units, profileA.teryt]);

  const handleSelectSecondUnit = useCallback((targetTeryt: string) => {
    setSelectedTerytB(targetTeryt);
    setCleared(false);
    setSearchQuery('');
    writeUrlState({ c: `${profileA.teryt},${targetTeryt}` });
  }, [profileA.teryt]);

  const handleClearSecondUnit = useCallback(() => {
    setSelectedTerytB(null);
    setLoadedProfileB(null);
    setCleared(true);
    setSearchQuery('');
    writeUrlState({ c: null });
  }, []);

  const profileB = cleared ? null : (profileBProp ?? loadedProfileB);

  // Wyszukiwanie drugiego miejsca
  const { results: searchResultsRaw } = useSearch(searchQuery);

  const searchResults = useMemo(() => {
    if (searchQuery.trim().length < 2) return [];
    if (searchResultsRaw && searchResultsRaw.length > 0) {
      return searchResultsRaw
        .filter((r) => r.teryt !== profileA.teryt)
        .slice(0, 6)
        .map((r) => ({
          teryt: r.teryt,
          name: r.name,
          label: r.label,
        }));
    }
    const q = searchQuery.toLowerCase().trim();
    return units
      .filter((u) => u.teryt !== profileA.teryt && u.name.toLowerCase().includes(q))
      .slice(0, 6)
      .map((u) => ({
        teryt: u.teryt,
        name: u.name,
        label: u.level === 'woj' ? 'województwo' : u.level === 'pow' ? 'powiat' : 'gmina',
      }));
  }, [searchResultsRaw, searchQuery, profileA.teryt, units]);

  // Przykłady kontrastowe
  const levelA: 'woj' | 'pow' | 'gmi' =
    profileA.unit?.level ??
    (profileA.teryt.length === 2 ? 'woj' : profileA.teryt.length === 4 ? 'pow' : 'gmi');

  const suggestions = useMemo(() => {
    return (CONTRAST_SUGGESTIONS[levelA] || CONTRAST_SUGGESTIONS.pow).filter(
      (s) => s.teryt !== profileA.teryt
    );
  }, [levelA, profileA.teryt]);

  const shareData = useMemo<ShareDialogData>(() => {
    if (!profileB) return {};

    const compResult = compare(profileA, profileB);

    const validRows = compResult.rows.filter(
      (row) => row.a !== null && row.a !== undefined && row.b !== null && row.b !== undefined
    );

    const profileAIndicatorsMap = new Map(
      profileA.indicators.map((item) => [item.indicatorId, item])
    );

    const compareCardRows: CompareCardRow[] = validRows.map((row) => {
      const itemA = profileAIndicatorsMap.get(row.indicatorId);
      const unitUnit = itemA?.indicator.unit;
      return {
        indicatorName: itemA?.indicator.name ?? row.indicatorId,
        valA: formatValue(row.a, unitUnit),
        valB: formatValue(row.b, unitUnit),
        diffText: row.diffText,
      };
    });

    const unitAName = profileA.unit ? unitTitle(profileA.unit) : `TERYT ${profileA.teryt}`;
    const unitBName = profileB.unit ? unitTitle(profileB.unit) : `TERYT ${profileB.teryt}`;

    const getFeatures = (prof: UnitProfile) => {
      if (!topoData) return undefined;
      const { wojFeatures, powFeatures, gmiFeatures } = loadGeoData(topoData);
      const teryt = prof.teryt;
      const level: UnitLevel =
        prof.unit?.level ??
        (teryt.length === 2 ? 'woj' : teryt.length === 4 ? 'pow' : 'gmi');
      const wojTeryt = teryt.slice(0, 2);

      if (level === 'woj') {
        return wojFeatures.features;
      }
      if (level === 'pow') {
        return powFeatures.features.filter((f: any) =>
          f.properties?.teryt?.startsWith(wojTeryt)
        );
      }
      if (level === 'gmi') {
        const filteredGmi = gmiFeatures.features.filter((f: any) =>
          f.properties?.teryt?.startsWith(wojTeryt)
        );
        if (filteredGmi.length > 0) return filteredGmi;
        return powFeatures.features.filter((f: any) =>
          f.properties?.teryt?.startsWith(wojTeryt)
        );
      }
      return undefined;
    };

    const getClassOf = (prof: UnitProfile) => {
      if (!indicatorValues || units.length === 0) return undefined;
      const teryt = prof.teryt;
      const level: UnitLevel =
        prof.unit?.level ??
        (teryt.length === 2 ? 'woj' : teryt.length === 4 ? 'pow' : 'gmi');

      const choropleth = buildChoropleth({
        values: indicatorValues,
        units,
        level,
        year: year ?? undefined,
        n: 5,
      });

      return (fTeryt: string) => {
        const cls = choropleth?.classByTeryt?.[fTeryt];
        if (cls === 0 || cls === 1 || cls === 2 || cls === 3 || cls === 4) {
          return cls;
        }
        return 'noData';
      };
    };

    const compareCard: CompareCardData = {
      indicatorName: view?.indicator.name ?? profileA.indicators[0]?.indicator.name ?? 'Wskaźniki',
      year,
      unitA: {
        name: unitAName,
        teryt: profileA.teryt,
        features: getFeatures(profileA),
        classOf: getClassOf(profileA),
      },
      unitB: {
        name: unitBName,
        teryt: profileB.teryt,
        features: getFeatures(profileB),
        classOf: getClassOf(profileB),
      },
      rows: compareCardRows,
    };

    return {
      compare: compareCard,
      compareRows: compResult.rows,
      compareUnitA: profileA,
      compareUnitB: profileB,
    };
  }, [
    profileA,
    profileB,
    view,
    year,
    topoData,
    indicatorValues,
    units,
  ]);

  if (!profileB) {
    return (
      <div className={cn('space-y-4', className)} data-slot="profile-compare">
        <div>
          <label htmlFor="compare-search-input" className="block text-xs font-semibold text-olowek mb-1.5">
            Wybierz drugie miejsce do porównania
          </label>
          <div className="relative flex items-center w-full">
            <div className="absolute left-3 pointer-events-none text-olowek flex items-center justify-center">
              <Icon icon={Search} aria-hidden={true} size={18} />
            </div>
            <input
              id="compare-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Wpisz nazwę gminy, powiatu..."
              className="w-full pl-9 pr-4 py-2 border border-linia bg-arkusz text-tusz placeholder:text-olowek text-sm min-h-[44px] focus:outline-none focus:ring-1 focus:ring-tusz"
            />
          </div>
        </div>

        {searchQuery.trim().length >= 2 && (
          <div className="border border-linia bg-arkusz divide-y divide-linia max-h-60 overflow-y-auto">
            {searchResults.length === 0 ? (
              <p className="p-3 text-xs text-olowek text-center">Brak wyników dla „{searchQuery}”</p>
            ) : (
              searchResults.map((res) => (
                <button
                  key={res.teryt}
                  type="button"
                  onClick={() => handleSelectSecondUnit(res.teryt)}
                  className="w-full text-left p-3 hover:bg-kalka transition-colors flex items-center justify-between text-tusz min-h-[44px] cursor-pointer"
                >
                  <span className="text-sm font-medium">{res.name}</span>
                  <span className="text-xs text-olowek border border-linia px-1.5 py-0.5 bg-kalka font-mono">
                    {res.label}
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        <div className="space-y-2 pt-2">
          <p className="text-xs text-olowek font-medium">Szybki wybór (przykłady kontrastowe):</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((sug) => (
              <button
                key={sug.teryt}
                type="button"
                onClick={() => handleSelectSecondUnit(sug.teryt)}
                className="min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-medium border border-linia bg-arkusz hover:bg-kalka transition-colors text-tusz cursor-pointer flex items-center justify-center"
              >
                {sug.name}
              </button>
            ))}
          </div>
        </div>

        <p className="py-6 text-sm text-olowek text-center">
          Wybierz drugie miejsce, aby porównać wskaźniki.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)} data-slot="profile-compare">
      {/* Pasek wybranego drugiego miejsca z przyciskiem × */}
      <div className="flex items-center justify-between gap-3 p-3 border border-linia bg-kalka/30">
        <div className="min-w-0 flex-1">
          <span className="text-xs text-olowek block">Porównanie z:</span>
          <span className="text-sm font-bold text-tusz truncate block">
            {profileB.unit ? unitTitle(profileB.unit) : `TERYT ${profileB.teryt}`}
          </span>
        </div>
        <button
          type="button"
          onClick={handleClearSecondUnit}
          aria-label="Wyczyść drugie miejsce"
          className="min-h-[44px] min-w-[44px] p-2 flex items-center justify-center border border-linia bg-arkusz hover:bg-kalka transition-colors text-tusz shrink-0 cursor-pointer"
        >
          <Icon icon={Xmark} aria-hidden={true} size={18} />
        </button>
      </div>

      <CompareMaps
        profileA={profileA}
        profileB={profileB}
        units={units}
        view={view}
        onSelectUnit={onSelectUnit}
      />
      <ProfileCompareTable profileA={profileA} profileB={profileB} />

      <div className="pt-3 flex justify-start">
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
        defaultKind="compare"
        data={shareData}
      />
    </div>
  );
}

function renderProfileCompare(container: HTMLElement, props: ProfileCompareProps) {
  import('react-dom/client').then(({ createRoot }) => {
    import('react').then(({ createElement }) => {
      const root = (container as any).__reactRoot || createRoot(container);
      (container as any).__reactRoot = root;
      root.render(createElement(ProfileCompare, props));
    });
  });
}

if (typeof window !== 'undefined') {
  (window as unknown as { __renderProfileCompare?: typeof renderProfileCompare }).__renderProfileCompare = renderProfileCompare;
}
