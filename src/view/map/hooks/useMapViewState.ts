import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { initialViewState, mapLimits, type ViewState } from '@/core/map/view';
import { loadLocalities } from '@/core/search/load-localities';
import type { Locality } from '@/core/search/types';
import { useSheetInset } from '@/view/map/sheetInset';

// Margines (px) wokół dopasowanego obszaru, żeby mapa nie dotykała krawędzi okna.
const FIT_PADDING = 48;

type Bbox = [number, number, number, number];
// Przybliżony obrys Polski; używany tylko, gdy lista jednostek nie jest jeszcze wczytana.
const POLAND_BBOX: Bbox = [14.12, 49.0, 24.15, 54.84];

function mercatorLat(latDeg: number): number {
  return Math.log(Math.tan(Math.PI / 4 + (latDeg * Math.PI) / 360));
}

function mercatorLatToDeg(m: number): number {
  return (360 / Math.PI) * Math.atan(Math.exp(m)) - 90;
}

/**
 * Oblicza stan widoku kamery uwzględniając dolny margines (wysokość arkusza w px).
 * Jeśli dolny arkusz jest widoczny (insetPx > 0), środek dopasowywanego obszaru
 * zostaje przesunięty w pionie tak, aby mieścił się w widocznej części mapy nad arkuszem.
 */
function viewStateWithInset(
  bounds: Bbox,
  width: number,
  height: number,
  insetPx: number
): ViewState {
  if (insetPx <= 0) {
    return initialViewState(bounds, Math.max(width - FIT_PADDING, 1), Math.max(height - FIT_PADDING, 1));
  }

  const fitWidth = Math.max(1, width - FIT_PADDING);
  const fitHeight = Math.max(1, height - insetPx - FIT_PADDING);

  const baseView = initialViewState(bounds, fitWidth, fitHeight);

  const tileSize = 512;
  const offsetY = insetPx / 2;
  const mBaseLat = mercatorLat(baseView.latitude);
  const mShift = (offsetY * 2 * Math.PI) / (tileSize * Math.pow(2, baseView.zoom));
  const mCamLat = mBaseLat - mShift;
  const latitude = mercatorLatToDeg(mCamLat);

  return {
    longitude: baseView.longitude,
    latitude,
    zoom: baseView.zoom,
  };
}

export function useMapViewState(drillBbox?: Bbox | null, countryBbox: Bbox = POLAND_BBOX) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sheetInset = useSheetInset();
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [localities, setLocalities] = useState<Locality[]>([]);
  const localityTargetRef = useRef<ViewState | null>(null);
  // Dla którego obszaru i marginesu arkusza widok został już dopasowany. Sama zmiana rozmiaru kontenera
  // nie może resetować przybliżenia ani przesunięcia ustawionego przez użytkownika.
  const fittedKeyRef = useRef<string | null>(null);
  // Czy użytkownik sam przesunął lub przybliżył mapę.
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
        const newView = viewStateWithInset(activeBbox, width, height, sheetInset);
        userMovedRef.current = false;
        setCurrentViewState(newView);
      }
    },
    [bounds, dimensions, sheetInset]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const measure = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth > 0 && clientHeight > 0) {
        setDimensions({ width: clientWidth, height: clientHeight });
        const key = JSON.stringify({ bbox: drillBbox ?? null, inset: sheetInset });
        if (localityTargetRef.current) {
          setCurrentViewState(localityTargetRef.current);
          localityTargetRef.current = null;
          fittedKeyRef.current = key;
          userMovedRef.current = true;
        } else if (fittedKeyRef.current !== key || !userMovedRef.current) {
          const activeBbox = drillBbox ?? bounds;
          const init = viewStateWithInset(activeBbox, clientWidth, clientHeight, sheetInset);
          setCurrentViewState(init);
          fittedKeyRef.current = key;
        }
      }
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [bounds, drillBbox, sheetInset]);

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
