import { useEffect, useState, useMemo, useCallback } from 'react';
import Map, { useControl } from 'react-map-gl/maplibre';
import { MapboxOverlay } from '@deck.gl/mapbox';
import type { MapboxOverlayProps } from '@deck.gl/mapbox';
import type { StyleSpecification } from 'maplibre-gl';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import tokensJson from '../../../config/tokens.json';

import { installAtlasSeam, type AtlasState } from '@/core/map/test-seam';
import { buildIndex } from '@/core/units/units';
import { loadUnits, loadAdminTopo } from '@/core/data/load-atlas-data';
import { countryBounds } from '@/core/map/view';
import { createMapLayers, registerLayerFactory, parseCssColor } from './layers';
import { localitiesLayerFactory } from './layers/localities';
import { choroplethLayerFactory, selectedOutlineLayerFactory } from './layers/choropleth';
import { BackButton } from './BackButton';
import { Breadcrumbs } from './Breadcrumbs';
import { UnitList } from './UnitList';
import type { Unit, UnitLevel } from '@/core/units/types';

import { useMapSelection } from './hooks/useMapSelection';
import { useMapViewState } from './hooks/useMapViewState';
import { useMapColors } from './hooks/useMapColors';
import { useChoropleth } from './hooks/useChoropleth';
import { useMainView } from './hooks/useMainView';
import { rankUnits } from '@/core/ranking/ranking';
import { effectiveLevel, levelRequiresDeselect } from '@/core/map/main-view';
import { IndicatorPanel } from '@/view/main/IndicatorPanel';
import { UnitTooltip } from '@/view/main/UnitTooltip';
import { useProfile } from './hooks/useProfile';
import { ProfilePortal } from './ProfilePortal';

// Kolejność = kolejność rysowania: kolory wskaźnika, obrys wybranej jednostki, na wierzchu miejscowości.
registerLayerFactory(choroplethLayerFactory);
registerLayerFactory(selectedOutlineLayerFactory);
registerLayerFactory(localitiesLayerFactory);

// Wyłączamy pracownika MapLibre GL za pomocą oficjalnego API maplibregl.setWorkerCount(0),
// aby żądanie maplibre-gl-worker.mjs nie pozostawało w toku i networkidle przechodziło pomyślnie.
if (typeof maplibregl.setWorkerCount === 'function') {
  maplibregl.setWorkerCount(0);
}

function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

const defaultKalka = parseCssColor(tokensJson.color.light.kalka);

type AtlasData = { units: Unit[]; adminTopo: any };

/**
 * Lista jednostek i granice to osobne pliki (public/data, public/geo), pobierane przy starcie mapy
 * i trzymane w pamięci przeglądarki. Dzięki temu nie są wklejone do kodu (PRODUKT.md §7).
 */
export function AtlasMap() {
  const [data, setData] = useState<AtlasData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadUnits(), loadAdminTopo()])
      .then(([units, adminTopo]) => {
        if (!cancelled) setData({ units, adminTopo });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (data) return <AtlasMapReady units={data.units} adminTopo={data.adminTopo} />;

  return (
    <div className="w-full h-full relative flex items-center justify-center text-olowek text-sm" aria-label="Mapa Polski" role="status">
      {failed ? 'Nie udało się wczytać mapy. Odśwież stronę.' : 'Wczytuję mapę…'}
    </div>
  );
}

function AtlasMapReady({ units, adminTopo }: { units: Unit[]; adminTopo: any }) {
  const [isReady, setIsReady] = useState(false);
  const unitIndex = useMemo(() => buildIndex(units), [units]);
  const bounds = useMemo(() => countryBounds(units), [units]);

  const { colors, theme } = useMapColors();

  const {
    selectedTeryt,
    drillState,
    selectUnit,
    selectBreadcrumb,
    goBack,
  } = useMapSelection(unitIndex, {
    onBboxChange: (bbox) => {
      updateViewStateForBbox(bbox);
    },
    onLocalitySelectView: (targetView) => {
      localityTargetRef.current = targetView;
      setCurrentViewState(targetView);
    },
  });

  const {
    containerRef,
    currentViewState,
    setCurrentViewState,
    limits,
    localities,
    localityTargetRef,
    updateViewStateForBbox,
    markUserMoved,
    handleKeyDown,
  } = useMapViewState(drillState.bbox, bounds);

  const mainView = useMainView();
  const selectedLevel = selectedTeryt ? unitIndex.byTeryt.get(selectedTeryt)?.level ?? null : null;
  // Po wybraniu jednostki mapa pokazuje jej jednostki podrzędne (województwo → powiaty).
  const level = effectiveLevel(mainView.level, selectedLevel, mainView.indicator.minLevel);
  const view = useMemo(
    () => ({
      ...mainView,
      level,
      setLevel: (l: UnitLevel) => {
        mainView.setLevel(l);
        if (levelRequiresDeselect(l, selectedLevel)) selectBreadcrumb(null);
      },
    }),
    [mainView, level, selectedLevel, selectBreadcrumb]
  );
  const choroplethData = useChoropleth(view, units);

  // Ranking wg wartości (miejsce 1 = największa wartość) dla bieżącego wskaźnika, roku i poziomu.
  const ranking = useMemo(() => {
    if (!view.values || view.year == null) return null;
    return rankUnits({ values: view.values, units, level: view.level, year: view.year, higherIsBetter: null });
  }, [view.values, view.year, view.level, units]);
  const rankByTeryt = useMemo(() => Object.fromEntries((ranking?.items ?? []).map((r) => [r.teryt, r])), [ranking]);

  const [hover, setHover] = useState<{ teryt: string; x: number; y: number; width: number } | null>(null);
  const hoverUnit = hover ? unitIndex.byTeryt.get(hover.teryt) ?? null : null;
  const { profile, isOpen: profileOpen, closeProfile } = useProfile(selectedTeryt, units);

  const extendedDrillState = useMemo(() => {
    return {
      ...drillState,
      choropleth: choroplethData,
    };
  }, [drillState, choroplethData]);

  const layers = useMemo(() => {
    return createMapLayers(
      adminTopo,
      colors,
      extendedDrillState,
      selectUnit,
      currentViewState,
      localities,
      setHover
    );
  }, [adminTopo, colors, extendedDrillState, selectUnit, currentViewState, localities, setHover]);

  const getState = useCallback((): AtlasState => {
    return {
      ready: isReady,
      layers: layers.map((layer) => layer.id),
      selected: drillState.selected,
      viewState: currentViewState,
      theme,
      choropleth: choroplethData
        ? {
            indicatorId: choroplethData.indicatorId,
            year: choroplethData.year,
            level: choroplethData.level,
            classes: choroplethData.classes,
          }
        : null,
      profileOpen,
    };
  }, [isReady, layers, drillState.selected, currentViewState, theme, choroplethData, profileOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      installAtlasSeam(window as any, getState);
    }
  }, [getState]);

  const mapStyle: StyleSpecification = useMemo(() => {
    const c = colors?.kalka ?? defaultKalka;
    const kalkaRgb = c ? `rgb(${c[0]}, ${c[1]}, ${c[2]})` : tokensJson.color.light.kalka;

    return {
      version: 8,
      sources: {},
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': kalkaRgb,
          },
        },
      ],
    };
  }, [colors]);

  const selectedName = selectedTeryt ? unitIndex.byTeryt.get(selectedTeryt)?.name ?? null : null;
  const hoverRank = hover ? rankByTeryt[hover.teryt] : undefined;
  const hoverValue =
    hover && view.values && view.year != null
      ? view.values.values[hover.teryt]?.[view.values.years.indexOf(view.year)] ?? null
      : null;

  return (
    <div className="flex flex-col md:flex-row w-full h-full min-h-0">
      <IndicatorPanel
        view={view}
        choropleth={choroplethData}
        ranking={ranking}
        index={unitIndex}
        selectedTeryt={selectedTeryt}
        onSelectUnit={selectUnit}
      >
        {selectedTeryt !== null && (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Jednostki w: {selectedName}</span>
            <UnitList selectedTeryt={selectedTeryt} index={unitIndex} onSelect={selectUnit} />
          </div>
        )}
      </IndicatorPanel>

      <div
        ref={containerRef}
        className="flex-1 min-w-0 min-h-[320px] relative overflow-hidden focus:outline-none focus-visible:ring-1 focus-visible:ring-tusz"
        tabIndex={0}
        aria-label="Mapa Polski"
        onKeyDown={handleKeyDown}
        onPointerLeave={() => setHover(null)}
      >
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-[280px] sm:max-w-[360px] pointer-events-none">
          <div className="pointer-events-auto">
            <Breadcrumbs teryt={selectedTeryt} index={unitIndex} onSelect={selectBreadcrumb} />
          </div>

          {selectedTeryt !== null && (
            <div className="relative pointer-events-auto h-11 -mt-4 -ml-4">
              <BackButton onClick={goBack} visible={true} />
            </div>
          )}
        </div>

        <Map
          mapLib={maplibregl}
          {...currentViewState}
          onMove={(evt) => {
            // Zdarzenia bez originalEvent to echo programowej zmiany widoku (np. po zmianie rozmiaru kontenera,
            // gdy dopasowujemy widok do nowej szerokości); nie nadpisują stanu, który właśnie ustawiliśmy.
            if (!evt.originalEvent) return;
            markUserMoved();
            setCurrentViewState(evt.viewState);
          }}
          mapStyle={mapStyle}
          maxBounds={limits.maxBounds}
          maxZoom={limits.maxZoom}
          minZoom={limits.minZoom}
          onLoad={() => setIsReady(true)}
          attributionControl={false}
        >
          <DeckGLOverlay layers={layers} />
        </Map>

        {hover && hoverUnit && (
          <UnitTooltip
            unit={hoverUnit}
            value={hoverValue}
            unitName={view.indicator.unit}
            rank={hoverRank?.rank ?? null}
            total={ranking?.items.length ?? 0}
            levelNoun={view.level === 'woj' ? 'województw' : view.level === 'pow' ? 'powiatów' : 'gmin'}
            x={hover.x}
            y={hover.y}
            containerWidth={hover.width}
          />
        )}
      </div>

      {/* Profil miejsca: osobna kolumna obok mapy, nic nie jest nałożone na mapę (PRODUKT.md §4). */}
      <div data-slot="side" className="empty:hidden md:w-[440px] md:shrink-0 border-t md:border-t-0 md:border-l border-linia bg-arkusz overflow-y-auto max-h-[45vh] md:max-h-none" />

      <ProfilePortal profile={profile} units={units} isOpen={profileOpen} onClose={closeProfile} />
    </div>
  );
}

export default AtlasMap;
