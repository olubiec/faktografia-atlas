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
import { choroplethLayerFactory } from './layers/choropleth';
import { BackButton } from './BackButton';
import { Breadcrumbs } from './Breadcrumbs';
import { UnitList } from './UnitList';
import type { Unit } from '@/core/units/types';

import { useMapSelection } from './hooks/useMapSelection';
import { useMapViewState } from './hooks/useMapViewState';
import { useMapColors } from './hooks/useMapColors';
import { useChoropleth } from './hooks/useChoropleth';
import { useProfile } from './hooks/useProfile';
import { ProfilePortal } from './ProfilePortal';

registerLayerFactory(localitiesLayerFactory);
registerLayerFactory(choroplethLayerFactory);

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
    handleKeyDown,
  } = useMapViewState(drillState.bbox, bounds);

  const choroplethData = useChoropleth(drillState, units);
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
      localities
    );
  }, [adminTopo, colors, extendedDrillState, selectUnit, currentViewState, localities]);

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

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden focus:outline-none focus-visible:ring-1 focus-visible:ring-tusz"
      tabIndex={0}
      aria-label="Mapa Polski"
      onKeyDown={handleKeyDown}
    >
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-[280px] sm:max-w-[320px] max-h-[calc(100%-2rem)] pointer-events-none">
        <div className="pointer-events-auto">
          <Breadcrumbs
            teryt={selectedTeryt}
            index={unitIndex}
            onSelect={selectBreadcrumb}
          />
        </div>

        {selectedTeryt !== null && (
          <div className="relative pointer-events-auto h-11 -mt-4 -ml-4">
            <BackButton onClick={goBack} visible={true} />
          </div>
        )}

        <div className="pointer-events-auto overflow-hidden flex flex-col min-h-0">
          <UnitList
            selectedTeryt={selectedTeryt}
            index={unitIndex}
            onSelect={selectUnit}
          />
        </div>
      </div>

      <Map
        mapLib={maplibregl}
        {...currentViewState}
        onMove={(evt) => setCurrentViewState(evt.viewState)}
        mapStyle={mapStyle}
        maxBounds={limits.maxBounds}
        maxZoom={limits.maxZoom}
        minZoom={limits.minZoomOffset}
        onLoad={() => setIsReady(true)}
        attributionControl={false}
      >
        <DeckGLOverlay layers={layers} />
      </Map>

      <ProfilePortal
        profile={profile}
        units={units}
        isOpen={profileOpen}
        onClose={closeProfile}
      />
    </div>
  );
}

export default AtlasMap;
