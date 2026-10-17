import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import Map, { useControl } from 'react-map-gl/maplibre';
import { MapboxOverlay } from '@deck.gl/mapbox';
import type { MapboxOverlayProps } from '@deck.gl/mapbox';
import type { StyleSpecification } from 'maplibre-gl';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import unitsData from '../../../public/data/units.json';
import adminTopo from '../../../public/geo/admin.topo.json';
import { countryBounds, initialViewState, mapLimits, type ViewState } from '@/core/map/view';
import { installAtlasSeam, type AtlasState } from '@/core/map/test-seam';
import { createMapLayers, getMapColorsFromCss } from './layers';
import type { Unit } from '@/core/units/types';

function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

export function AtlasMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [colors, setColors] = useState(getMapColorsFromCss);
  const [isReady, setIsReady] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const bounds = useMemo(() => countryBounds(unitsData as Unit[]), []);
  const limits = useMemo(() => mapLimits(bounds), [bounds]);

  const [currentViewState, setCurrentViewState] = useState<ViewState>({
    longitude: 19.145,
    latitude: 51.919,
    zoom: 5.5,
  });

  const updateColorsAndTheme = useCallback(() => {
    const newColors = getMapColorsFromCss();
    setColors(newColors);

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

  useEffect(() => {
    if (!containerRef.current) return;

    const measure = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth > 0 && clientHeight > 0) {
        const init = initialViewState(bounds, clientWidth, clientHeight);
        setCurrentViewState(init);
      }
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [bounds]);

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
      layers: ['woj-layer', 'country-layer'],
      selected: null,
      viewState: currentViewState,
      theme,
    };
  }, [isReady, currentViewState, theme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      installAtlasSeam(window as any, getState);
    }
  }, [getState]);

  const layers = useMemo(() => {
    return createMapLayers(adminTopo, colors);
  }, [colors]);

  const mapStyle: StyleSpecification = useMemo(() => {
    const [r, g, b] = colors.kalka;
    const kalkaRgb = `rgb(${r}, ${g}, ${b})`;

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
  }, [colors.kalka]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden focus:outline-none focus-visible:ring-1 focus-visible:ring-tusz"
      tabIndex={0}
      aria-label="Mapa Polski"
      onKeyDown={handleKeyDown}
    >
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
