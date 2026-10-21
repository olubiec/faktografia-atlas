import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { initialViewState, mapLimits, type ViewState } from '@/core/map/view';
import { loadLocalities } from '@/core/search/load-localities';
import type { Locality } from '@/core/search/types';

// Margines (px) wokół dopasowanego obszaru, żeby mapa nie dotykała krawędzi okna.
const FIT_PADDING = 48;

type Bbox = [number, number, number, number];
// Przybliżony obrys Polski; używany tylko, gdy lista jednostek nie jest jeszcze wczytana.
const POLAND_BBOX: Bbox = [14.12, 49.0, 24.15, 54.84];

export function useMapViewState(drillBbox?: Bbox | null, countryBbox: Bbox = POLAND_BBOX) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [localities, setLocalities] = useState<Locality[]>([]);
  const localityTargetRef = useRef<ViewState | null>(null);
  // Dla którego obszaru widok został już dopasowany. Sama zmiana rozmiaru kontenera (np. otwarcie
  // arkusza profilu obok mapy) nie może resetować przybliżenia ani przesunięcia ustawionego przez użytkownika.
  const fittedKeyRef = useRef<string | null>(null);
  // Czy użytkownik sam przesunął lub przybliżył mapę. Dopóki nie, zmiana rozmiaru kontenera (np. otwarcie
  // profilu obok mapy) dopasowuje widok ponownie, żeby wybrany obszar nadal mieścił się w całości.
  const userMovedRef = useRef(false);
  const markUserMoved = useCallback(() => {
    userMovedRef.current = true;
  }, []);

  const bounds = countryBbox;
  const limits = useMemo(
    () => mapLimits(bounds, dimensions.width, dimensions.height),
    [bounds, dimensions.width, dimensions.height]
  );

  const [currentViewState, setCurrentViewState] = useState<ViewState>({
    longitude: 19.145,
    latitude: 51.919,
    zoom: 5.5,
  });

  const updateViewStateForBbox = useCallback(
    (targetBbox: [number, number, number, number] | null) => {
      const { width, height } = dimensions;
      if (width > 0 && height > 0) {
        const activeBbox = targetBbox ?? bounds;
        const newView = initialViewState(activeBbox, Math.max(width - FIT_PADDING, 1), Math.max(height - FIT_PADDING, 1));
        userMovedRef.current = false;
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
        const key = JSON.stringify(drillBbox ?? null);
        if (localityTargetRef.current) {
          setCurrentViewState(localityTargetRef.current);
          localityTargetRef.current = null;
          fittedKeyRef.current = key;
          userMovedRef.current = true;
        } else if (fittedKeyRef.current !== key || !userMovedRef.current) {
          const activeBbox = drillBbox ?? bounds;
          const init = initialViewState(activeBbox, Math.max(clientWidth - FIT_PADDING, 1), Math.max(clientHeight - FIT_PADDING, 1));
          setCurrentViewState(init);
          fittedKeyRef.current = key;
        }
      }
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [bounds, drillBbox]);

  useEffect(() => {
    if (currentViewState.zoom >= 8.5) {
      loadLocalities().then((data) => setLocalities(data));
    }
  }, [currentViewState.zoom]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', '+', '=', '-'].includes(e.key)) {
        userMovedRef.current = true;
      }
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
          zoom: Math.max(limits.minZoom, prev.zoom - zoomStep),
        }));
      }
    },
    [currentViewState.zoom, limits.maxZoom, limits.minZoom]
  );

  return {
    containerRef,
    currentViewState,
    setCurrentViewState,
    limits,
    bounds,
    localities,
    setLocalities,
    localityTargetRef,
    updateViewStateForBbox,
    markUserMoved,
    handleKeyDown,
  };
}
