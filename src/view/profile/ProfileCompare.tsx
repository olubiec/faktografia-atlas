import { useState, useEffect, useMemo } from 'react';
import type { UnitProfile, IndicatorValues } from '../../core/profile/profile';
import type { Unit, UnitLevel } from '../../core/units/types';
import type { MainView } from '../map/hooks/useMainView';
import { CompareMaps } from './CompareMaps';
import { ProfileCompareTable } from './ProfileCompareTable';
import { compare } from '../../core/compare/compare';
import { Button } from '../../components/ui/button';
import { Search, Xmark } from 'iconoir-react';
import { unitTitle } from '../../core/units/label';
import { formatValue } from '../../core/format/number';
import { loadAdminTopo, loadUnits } from '../../core/data/load-atlas-data';
import { loadGeoData } from '../map/layers/admin';
import { buildChoropleth } from '../../core/map/choropleth';
import { loadIndicatorValues } from '../../core/data/load-values';
import { LazyShareDialog } from '../share/LazyShareDialog';
import type { ShareDialogData } from '../share/ShareDialog';
import type { CompareCardData, CompareCardRow } from '../../core/share/card';
import { Icon } from '../ui/Icon';
import { Download } from 'iconoir-react';

export interface ProfileCompareProps {
  profileA: UnitProfile;
  profileB: UnitProfile | null;
  units?: Unit[];
  view?: MainView;
  onSelectUnit?: (teryt: string) => void;
  className?: string;
}

/**
 * Komponent zakładek/sekcji porównania profilu.
 * Gdy podano drugi profil (profileB), renderuje mapki porównawcze (CompareMaps),
 * tabelę porównawczą (ProfileCompareTable) oraz przycisk „Pobierz i udostępnij”.
 * W przeciwnym razie wyświetla komunikat o zachęcie do wyboru drugiego miejsca.
 */
export function ProfileCompare({
  profileA,
  profileB,
  units: unitsProp,
  view,
  onSelectUnit,
  className,
}: ProfileCompareProps) {
  const clearCompare = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('c');
    window.history.pushState({}, '', url.toString());
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [topoData, setTopoData] = useState<any>(null);
  const [loadedUnits, setLoadedUnits] = useState<Unit[]>([]);
  const [fetchedValues, setFetchedValues] = useState<IndicatorValues | null>(null);

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
      <div className={className} data-slot="profile-compare">
        <div className="py-8 text-center text-[var(--kalka-tekst)]">
          <Button variant="secondary" onClick={() => {
             const searchBtn = document.querySelector('[aria-label="Szukaj miejsca"]');
             if (searchBtn) (searchBtn as HTMLButtonElement).click();
          }} className="w-full justify-start text-muted-foreground border-dashed h-12">
            <Icon icon={Search} size={16} aria-hidden={true} className="mr-2" />
            Porównaj z innym miejscem...
          </Button>

          <div className="mt-6 text-left">
            <h3 className="text-sm font-semibold mb-3 text-foreground">Przykładowe miejsca</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('c', `${profileA.teryt},1465011`);
                window.history.pushState({}, '', url.toString());
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}>
                Warszawa
              </Button>
              <Button variant="secondary" size="sm" onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('c', `${profileA.teryt},1261011`);
                window.history.pushState({}, '', url.toString());
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}>
                Kraków
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} data-slot="profile-compare">
      <div className="flex items-center gap-2 relative mb-4">
        <Button
          variant="secondary"
          className="w-full justify-start flex-1 text-foreground min-h-[44px]"
          onClick={() => {
             const searchBtn = document.querySelector('[aria-label="Szukaj miejsca"]');
             if (searchBtn) (searchBtn as HTMLButtonElement).click();
          }}
        >
          <Icon icon={Search} size={16} aria-hidden={true} className="mr-2 text-[var(--olowek)]" />
          {profileB.unit?.name || `TERYT ${profileB.teryt}`}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearCompare}
          aria-label="Wyczyść porównanie"
        >
          <Icon icon={Xmark} size={16} aria-hidden={true} />
        </Button>
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

if (typeof window !== 'undefined') {
  (window as any).__ProfileCompare = ProfileCompare;
  (window as any).__renderProfileCompare = (container: HTMLElement, props: ProfileCompareProps) => {
    import('react-dom/client').then(({ createRoot }) => {
      import('react').then(({ createElement }) => {
        const root = (container as any).__reactRoot || createRoot(container);
        (container as any).__reactRoot = root;
        root.render(createElement(ProfileCompare, props));
      });
    });
  };
}
