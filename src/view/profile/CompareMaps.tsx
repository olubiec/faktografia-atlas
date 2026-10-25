import { useEffect, useState, useMemo, useCallback } from 'react';
import type { UnitProfile, IndicatorValues } from '../../core/profile/profile';
import type { Unit, UnitLevel } from '../../core/units/types';
import type { MainView } from '../map/hooks/useMainView';
import { loadAdminTopo, loadUnits } from '../../core/data/load-atlas-data';
import { loadGeoData } from '../map/layers/admin';
import { mapShapes } from '../../core/share/map-shapes';
import { buildChoropleth } from '../../core/map/choropleth';
import { classColorToken } from '../../core/map/classes';
import { unitLabel } from '../../core/units/label';
import { loadIndicatorValues } from '../../core/data/load-values';
import { writeUrlState } from '../../core/url/state';
import { cn } from '../../lib/utils';

export interface CompareMapsProps {
  profileA: UnitProfile;
  profileB: UnitProfile;
  units?: Unit[];
  view?: MainView;
  onSelectUnit?: (teryt: string) => void;
  className?: string;
}

interface SingleMiniMapProps {
  profile: UnitProfile;
  units: Unit[];
  topoData: any;
  indicatorValues: IndicatorValues | null;
  indicatorId: string;
  year: number | null;
  onSelectUnit?: (teryt: string) => void;
}

function SingleMiniMap({
  profile,
  units,
  topoData,
  indicatorValues,
  year,
  onSelectUnit,
}: SingleMiniMapProps) {
  const teryt = profile.teryt;
  const unit = profile.unit;

  const unitName = unit
    ? unitLabel(unit, { short: true })
    : `TERYT ${teryt}`;

  const level: UnitLevel =
    unit?.level ??
    (teryt.length === 2 ? 'woj' : teryt.length === 4 ? 'pow' : 'gmi');

  const wojTeryt = teryt.slice(0, 2);

  // Filtrowanie obiektów przestrzennych dla danego obszaru (województwo / Polska)
  const features = useMemo(() => {
    if (!topoData) return [];
    const { wojFeatures, powFeatures, gmiFeatures } = loadGeoData(topoData);

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
    return [];
  }, [topoData, level, wojTeryt]);

  // Klasyfikacja kolorystyczna choropletu dla wybranego wskaźnika i roku
  const choropleth = useMemo(() => {
    if (!indicatorValues || units.length === 0) return null;
    return buildChoropleth({
      values: indicatorValues,
      units,
      level,
      year: year ?? undefined,
      n: 5,
    });
  }, [indicatorValues, units, level, year]);

  // Generowanie kształtów SVG za pomocą mapShapes()
  const shapesResult = useMemo(() => {
    if (features.length === 0) return null;
    const box = { x: 0, y: 0, width: 220, height: 150 };

    return mapShapes(features, {
      box,
      padding: 8,
      classOf: (fTeryt: string) => {
        const cls = choropleth?.classByTeryt?.[fTeryt];
        if (
          cls === 0 ||
          cls === 1 ||
          cls === 2 ||
          cls === 3 ||
          cls === 4
        ) {
          return cls;
        }
        return 'noData';
      },
      selected: (fTeryt: string) => fTeryt === teryt,
    });
  }, [features, choropleth, teryt]);

  const handleClick = useCallback(() => {
    if (onSelectUnit) {
      onSelectUnit(teryt);
    } else {
      writeUrlState({ u: teryt });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('popstate'));
      }
    }
  }, [teryt, onSelectUnit]);

  const scheme = choropleth?.scheme ?? 'sequential';

  return (
    <button
      type="button"
      data-slot="compare-map"
      data-selected={teryt}
      data-teryt={teryt}
      onClick={handleClick}
      aria-label={`Wybierz ${unitName}`}
      className="flex flex-col items-center justify-between border border-linia bg-arkusz hover:bg-kalka transition-colors p-3 w-full min-h-[160px] cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-tusz"
    >
      <span className="text-xs font-semibold text-tusz text-center truncate w-full mb-2">
        {unitName}
      </span>

      <div className="w-full flex items-center justify-center flex-1 min-h-[110px]">
        {shapesResult ? (
          <svg
            viewBox="0 0 220 150"
            className="w-full h-auto max-h-[140px]"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={`Mapa ${unitName}`}
          >
            {shapesResult.shapes.map((s, idx) => {
              const isSelected = s.teryt === teryt || s.selected;
              const fillVar =
                s.fill === 'noData'
                  ? 'var(--no-data)'
                  : `var(${classColorToken(s.fill, 5, scheme)})`;

              return (
                <path
                  key={s.teryt || `shape-${idx}`}
                  d={s.d}
                  fill={fillVar}
                  stroke={isSelected ? 'var(--korekta)' : 'var(--arkusz)'}
                  strokeWidth={isSelected ? 2.5 : 0.5}
                  data-selected={isSelected ? 'true' : undefined}
                  data-teryt={s.teryt}
                />
              );
            })}
            {shapesResult.outline && (
              <path
                d={shapesResult.outline}
                fill="none"
                stroke="var(--tusz)"
                strokeWidth={1}
              />
            )}
          </svg>
        ) : (
          <div className="text-xs text-olowek animate-pulse">Wczytuję mapę…</div>
        )}
      </div>
    </button>
  );
}

/**
 * Komponent dwóch małych mapek porównawczych nad tabelą porównania.
 * Prezentuje dwie mapki w kolorach bieżącego wskaźnika i roku z zakreślonym miejscem.
 */
export function CompareMaps({
  profileA,
  profileB,
  units: unitsProp,
  view,
  onSelectUnit,
  className,
}: CompareMapsProps) {
  const [topoData, setTopoData] = useState<any>(null);
  const [loadedUnits, setLoadedUnits] = useState<Unit[]>([]);
  const [fetchedValues, setFetchedValues] = useState<IndicatorValues | null>(null);

  const units = unitsProp ?? loadedUnits;
  const indicatorValues = view?.values ?? fetchedValues;

  // Wczytywanie danych TopoJSON i opcjonalnie units
  useEffect(() => {
    let cancelled = false;

    loadAdminTopo().then((topo) => {
      if (!cancelled) setTopoData(topo);
    });

    if (!unitsProp) {
      loadUnits().then((u) => {
        if (!cancelled) setLoadedUnits(u);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [unitsProp]);

  // Identyfikator wskaźnika i rok z widoku lub profilu
  const indicatorId =
    view?.indicator.id ??
    profileA.indicators[0]?.indicatorId ??
    'population-density';

  const year = view?.year ?? profileA.indicators[0]?.year ?? null;

  // Wczytywanie wartości wskaźnika (jeśli nie przekazano w view)
  useEffect(() => {
    if (view?.values) {
      return;
    }

    let cancelled = false;
    loadIndicatorValues(indicatorId).then((vals) => {
      if (!cancelled) setFetchedValues(vals);
    });

    return () => {
      cancelled = true;
    };
  }, [view?.values, indicatorId]);

  return (
    <div
      data-slot="compare-maps"
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 w-full max-w-full',
        className
      )}
    >
      <SingleMiniMap
        profile={profileA}
        units={units}
        topoData={topoData}
        indicatorValues={indicatorValues}
        indicatorId={indicatorId}
        year={year}
        onSelectUnit={onSelectUnit}
      />
      <SingleMiniMap
        profile={profileB}
        units={units}
        topoData={topoData}
        indicatorValues={indicatorValues}
        indicatorId={indicatorId}
        year={year}
        onSelectUnit={onSelectUnit}
      />
    </div>
  );
}

if (typeof window !== 'undefined') {
  (window as any).__CompareMaps = CompareMaps;
  (window as any).__renderCompareMaps = (container: HTMLElement, props: CompareMapsProps) => {
    import('react-dom/client').then(({ createRoot }) => {
      import('react').then(({ createElement }) => {
        const root = (container as any).__reactRoot || createRoot(container);
        (container as any).__reactRoot = root;
        root.render(createElement(CompareMaps, props));
      });
    });
  };
}
