import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import Map, { useControl } from 'react-map-gl/maplibre';
import { MapboxOverlay } from '@deck.gl/mapbox';
import type { MapboxOverlayProps } from '@deck.gl/mapbox';
import type { StyleSpecification } from 'maplibre-gl';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import unitsData from '../../../public/data/units.json';
import adminTopo from '../../../public/geo/admin.topo.json';
import tokensJson from '../../../config/tokens.json';
import { countryBounds, initialViewState, mapLimits, type ViewState } from '@/core/map/view';
import { installAtlasSeam, type AtlasState } from '@/core/map/test-seam';
import { buildIndex } from '@/core/units/units';
import { getDrillState, getParentTeryt } from '@/core/map/drill';
import { readUrlState, writeUrlState } from '@/core/url/state';
import { createMapLayers, getMapColorsFromCss } from './layers';
import { BackButton } from './BackButton';
import { Breadcrumbs } from './Breadcrumbs';
import { UnitList } from './UnitList';
import type { Unit } from '@/core/units/types';

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

export function AtlasMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [colors, setColors] = useState(getMapColorsFromCss);
  const [isReady, setIsReady] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const unitIndex = useMemo(() => buildIndex(unitsData as Unit[]), []);
  const bounds = useMemo(() => countryBounds(unitsData as Unit[]), []);
  const limits = useMemo(() => mapLimits(bounds), [bounds]);

  const [selectedTeryt, setSelectedTeryt] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return readUrlState(window.location.search, unitIndex).u ?? null;
  });

  const drillState = useMemo(() => {
    return getDrillState(selectedTeryt, unitIndex);
  }, [selectedTeryt, unitIndex]);

  const [currentViewState, setCurrentViewState] = useState<ViewState>({
    longitude: 19.145,
    latitude: 51.919,
    zoom: 5.5,
  });

  const updateColorsAndTheme = useCallback(() => {
    const newColors = getMapColorsFromCss();
    if (newColors) {
      setColors(newColors);
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
      (document.documentElement.classList.contains('dark') &&
        document.documentElement.getAttribute('data-theme') !== 'light');

    setTheme(isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      updateColorsAndTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    return () => observer.disconnect();
  }, [updateColorsAndTheme]);

  const updateViewStateForBbox = useCallback(
    (targetBbox: [number, number, number, number] | null) => {
      const { width, height } = dimensions;
      if (width > 0 && height > 0) {
        const activeBbox = targetBbox ?? bounds;
        const newView = initialViewState(activeBbox, width, height);
        setCurrentViewState(newView);
      }
    },
    [bounds, dimensions]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const measure = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth > 0 && clientHeight > 0) {
        setDimensions({ width: clientWidth, height: clientHeight });
        const activeBbox = drillState.bbox ?? bounds;
        const init = initialViewState(activeBbox, clientWidth, clientHeight);
        setCurrentViewState(init);
      }
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [bounds, drillState.bbox]);

  // Obsługa powrotu/przejścia w historii przeglądarki
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const fromUrl = readUrlState(window.location.search, unitIndex).u ?? null;
      setSelectedTeryt(fromUrl);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [unitIndex]);

  const handleSelectUnit = useCallback(
    (teryt: string) => {
      setSelectedTeryt(teryt);
      writeUrlState({ u: teryt });

      const targetUnit = unitIndex.byTeryt.get(teryt);
      if (targetUnit) {
        updateViewStateForBbox(targetUnit.bbox);
      }
    },
    [unitIndex, updateViewStateForBbox]
  );

  const handleSelectBreadcrumb = useCallback(
    (teryt: string | null) => {
      if (teryt === null) {
        setSelectedTeryt(null);
        writeUrlState({ u: null });
        updateViewStateForBbox(bounds);
      } else {
        handleSelectUnit(teryt);
      }
    },
    [handleSelectUnit, bounds, updateViewStateForBbox]
  );

  const handleBack = useCallback(() => {
    const parent = getParentTeryt(selectedTeryt, unitIndex);
    setSelectedTeryt(parent);
    writeUrlState({ u: parent });

    if (parent) {
      const parentUnit = unitIndex.byTeryt.get(parent);
      updateViewStateForBbox(parentUnit ? parentUnit.bbox : bounds);
    } else {
      updateViewStateForBbox(bounds);
    }
  }, [selectedTeryt, unitIndex, updateViewStateForBbox, bounds]);

  const layers = useMemo(() => {
    return createMapLayers(adminTopo, colors, drillState, handleSelectUnit);
  }, [colors, drillState, handleSelectUnit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const panStep = 0.5 / Math.pow(2, currentViewState.zoom - 5);
    const zoomStep = 0.5;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setCurrentViewState((prev) => ({ ...prev, longitude: prev.longitude + panStep }));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setCurrentViewState((prev) => ({ ...prev, longitude: prev.longitude - panStep }));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCurrentViewState((prev) => ({ ...prev, latitude: prev.latitude + panStep }));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCurrentViewState((prev) => ({ ...prev, latitude: prev.latitude - panStep }));
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      setCurrentViewState((prev) => ({
        ...prev,
        zoom: Math.min(limits.maxZoom, prev.zoom + zoomStep),
      }));
    } else if (e.key === '-') {
      e.preventDefault();
      setCurrentViewState((prev) => ({
        ...prev,
        zoom: Math.max(limits.minZoomOffset + prev.zoom, prev.zoom - zoomStep),
      }));
    }
  }, [currentViewState.zoom, limits.maxZoom, limits.minZoomOffset]);

  const getState = useCallback((): AtlasState => {
    return {
      ready: isReady,
      layers: layers.map((layer) => layer.id),
      selected: drillState.selected,
      viewState: currentViewState,
      theme,
    };
  }, [isReady, layers, drillState.selected, currentViewState, theme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      installAtlasSeam(window as any, getState);
    }
  }, [getState]);

  const mapStyle: StyleSpecification = useMemo(() => {
    const kalkaRgb = colors
      ? `rgb(${colors.kalka[0]}, ${colors.kalka[1]}, ${colors.kalka[2]})`
      : tokensJson.color.light.kalka;

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
            onSelect={handleSelectBreadcrumb}
          />
        </div>

        {selectedTeryt !== null && (
          <div className="relative pointer-events-auto h-11 -mt-4 -ml-4">
            <BackButton onClick={handleBack} visible={true} />
          </div>
        )}

        <div className="pointer-events-auto overflow-hidden flex flex-col min-h-0">
          <UnitList
            selectedTeryt={selectedTeryt}
            index={unitIndex}
            onSelect={handleSelectUnit}
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
    </div>
  );
}

export default AtlasMap;
