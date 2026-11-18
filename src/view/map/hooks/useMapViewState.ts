import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { initialViewState, mapLimits, type ViewState } from '@/core/map/view';
import { loadLocalities } from '@/core/search/load-localities';
import type { Locality } from '@/core/search/types';
import { useSheetInset } from '@/view/map/sheetInset';
import { cameraTransition, type CameraKind } from '@/core/map/camera';
import { parseCubicBezier } from '@/core/map/ease';

// Margines (px) wokół dopasowanego obszaru, żeby mapa nie dotykała krawędzi okna.
const FIT_PADDING = 48;
// Największy krok postępu animacji na jedną klatkę (min. ok. 5 klatek ruchu).
const MAX_STEP = 0.2;

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

/** Szerokość (px) kolumny profilu obok mapy, jeśli jest teraz widoczna. */
function currentSideWidth(): number {
  if (typeof document === 'undefined') return 0;
  return document.querySelector<HTMLElement>('[data-slot="side"]')?.offsetWidth ?? 0;
}

/**
 * Gdy kolumna profilu ma się pojawić (lub zniknąć) razem ze zmianą kamery, kontener mapy
 * zmieni szerokość o `pendingPx`, a środek ekranu przesunie się o połowę tej wartości.
 * Przesuwamy środek kamery o tyle samo, więc mapa nie skacze w chwili zmiany układu.
 */
export function shiftForLayout(view: ViewState, pendingPx: number): ViewState {
  if (pendingPx === 0) return view;
  const degPerPx = 360 / (512 * Math.pow(2, view.zoom));
  return { ...view, longitude: view.longitude - (pendingPx / 2) * degPerPx };
}

export type CameraSeamState = {
  animating: boolean;
  trace: ViewState[];
};

let currentCameraSeamState: CameraSeamState = {
  animating: false,
  trace: [],
};

function isTestMode(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('e2e');
}

export function getCameraState(): CameraSeamState {
  if (!isTestMode()) {
    return { animating: false, trace: [] };
  }
  return currentCameraSeamState;
}

function syncCameraSeam(
  animating: boolean,
  action?: { type: 'reset'; view: ViewState } | { type: 'push'; view: ViewState }
) {
  if (!isTestMode()) {
    currentCameraSeamState = { animating: false, trace: [] };
    return;
  }
  let trace = currentCameraSeamState.trace;
  if (action?.type === 'reset') {
    trace = [{ ...action.view }];
  } else if (action?.type === 'push') {
    trace = [...currentCameraSeamState.trace, { ...action.view }];
  }
  currentCameraSeamState = {
    animating,
    trace,
  };
}

/**
 * `sidePanelPx` = szerokość kolumny profilu, która ma być zajęta przy tym widoku (0, gdy jej nie będzie).
 * Miejsce na panel jest rezerwowane już w pierwszym dopasowaniu kamery, dzięki czemu
 * otwarcie profilu to jeden ciągły ruch, bez drugiego przesunięcia po wczytaniu panelu.
 */
export function useMapViewState(drillBbox?: Bbox | null, countryBbox: Bbox = POLAND_BBOX, sidePanelPx = 0) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sheetInset = useSheetInset();
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [localities, setLocalities] = useState<Locality[]>([]);
  const localityTargetRef = useRef<ViewState | null>(null);
  const sideExpectedRef = useRef(sidePanelPx);
  const lastSideRef = useRef(sidePanelPx);

  const fittedKeyRef = useRef<string | null>(null);
  const fittedBboxRef = useRef<string | null>(null);
  const userMovedRef = useRef(false);
  const animRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);
  // Cel trwającej animacji; zmiana rozmiaru w jej trakcie tylko podmienia cel, nie przerywa ruchu.
  const animTargetRef = useRef<ViewState | null>(null);

  const bounds = countryBbox;
  const limits = useMemo(
    () => mapLimits(bounds, dimensions.width, dimensions.height),
    [bounds, dimensions.width, dimensions.height]
  );

  const [currentViewState, _setCurrentViewState] = useState<ViewState>({
    longitude: 19.145,
    latitude: 51.919,
    zoom: 5.5,
  });

  const currentViewStateRef = useRef<ViewState>(currentViewState);

  const setCurrentViewState = useCallback((action: React.SetStateAction<ViewState>) => {
    _setCurrentViewState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      currentViewStateRef.current = next;
      return next;
    });
  }, []);

  const markUserMoved = useCallback(() => {
    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    isAnimatingRef.current = false;
    userMovedRef.current = true;
    syncCameraSeam(false);
  }, []);

  const animateToView = useCallback(
    (targetView: ViewState, kind: CameraKind = 'in', fromOverride?: ViewState) => {
      if (animRef.current !== null) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }

      const reducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const fromView = fromOverride ? { ...fromOverride } : { ...currentViewStateRef.current };
      if (fromOverride) {
        // Punkt startu skorygowany o zmianę układu: ustawiamy go od razu, w tym samym renderze co układ.
        currentViewStateRef.current = fromView;
        setCurrentViewState(fromView);
      }
      const { duration, easing } = cameraTransition(fromView, targetView, kind, reducedMotion);

      if (duration <= 0) {
        userMovedRef.current = false;
        isAnimatingRef.current = false;
        setCurrentViewState(targetView);
        syncCameraSeam(false, { type: 'push', view: targetView });
        return;
      }

      userMovedRef.current = false;
      isAnimatingRef.current = true;
      animTargetRef.current = targetView;
      syncCameraSeam(true, { type: 'reset', view: fromView });

      let startTime: number | null = null;
      let progress = 0;
      const easeFn = parseCubicBezier(easing);

      const animate = (now: number) => {
        if (userMovedRef.current) {
          animRef.current = null;
          isAnimatingRef.current = false;
          syncCameraSeam(false);
          return;
        }

        if (startTime === null) {
          startTime = now;
        }

        const elapsed = now - startTime;
        const timeProgress = Math.min(1, elapsed / duration);
        // Postęp wynika z czasu: pierwsza klatka = 0 (bez skoku na starcie), a po zacięciu
        // strony ruch nie przeskakuje na koniec, tylko rusza w krokach po najwyżej 1/5 drogi.
        progress = Math.min(timeProgress, progress + MAX_STEP);
        const finished = progress >= 1;
        const eased = easeFn(progress);

        const to = animTargetRef.current ?? targetView;
        const nextView: ViewState = {
          longitude: fromView.longitude + (to.longitude - fromView.longitude) * eased,
          latitude: fromView.latitude + (to.latitude - fromView.latitude) * eased,
          zoom: fromView.zoom + (to.zoom - fromView.zoom) * eased,
        };

        setCurrentViewState(nextView);
        syncCameraSeam(!finished, { type: 'push', view: nextView });

        if (!finished) {
          animRef.current = requestAnimationFrame(animate);
        } else {
          animRef.current = null;
          isAnimatingRef.current = false;
          syncCameraSeam(false);
        }
      };

      animRef.current = requestAnimationFrame(animate);
    },
    [setCurrentViewState]
  );

  const updateViewStateForBbox = useCallback(
    (targetBbox: Bbox | null, explicitKind?: CameraKind, sideOverride?: number) => {
      const width = containerRef.current?.clientWidth ?? dimensions.width;
      const height = containerRef.current?.clientHeight ?? dimensions.height;
      if (width > 0 && height > 0) {
        const side = sideOverride ?? sideExpectedRef.current;
        sideExpectedRef.current = side;
        // Dopasowujemy do szerokości, jaką mapa będzie miała po ustawieniu się układu (z panelem lub bez).
        const sideNow = currentSideWidth();
        const fitWidth = Math.max(1, width + sideNow - side);
        const activeBbox = targetBbox ?? bounds;
        const newView = viewStateWithInset(activeBbox, fitWidth, height, sheetInset);

        const bboxKey = JSON.stringify(targetBbox ?? null);
        const key = JSON.stringify({ bbox: targetBbox ?? null, inset: Math.round(sheetInset), side });

        let kind: CameraKind = explicitKind ?? 'in';
        if (!explicitKind) {
          if (newView.zoom < currentViewStateRef.current.zoom - 0.05) {
            kind = 'out';
          } else if (Math.abs(newView.zoom - currentViewStateRef.current.zoom) < 0.05) {
            kind = 'instant';
          }
        }

        if (fittedBboxRef.current === bboxKey && isAnimatingRef.current) {
          fittedKeyRef.current = key;
          return;
        }

        fittedBboxRef.current = bboxKey;
        fittedKeyRef.current = key;
        const pending = side - sideNow;
        animateToView(newView, kind, pending !== 0 ? shiftForLayout(currentViewStateRef.current, pending) : undefined);
      }
    },
    [animateToView, bounds, dimensions, sheetInset]
  );

  useEffect(() => {
    if (!containerRef.current) return;
    sideExpectedRef.current = sidePanelPx;

    const measure = (isResizeEvent = false) => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth > 0 && clientHeight > 0) {
        setDimensions({ width: clientWidth, height: clientHeight });
        const side = sideExpectedRef.current;
        const fitWidth = Math.max(1, clientWidth + currentSideWidth() - side);
        const bboxKey = JSON.stringify(drillBbox ?? null);
        const key = JSON.stringify({ bbox: drillBbox ?? null, inset: Math.round(sheetInset), side });

        if (localityTargetRef.current) {
          if (animRef.current !== null) {
            cancelAnimationFrame(animRef.current);
            animRef.current = null;
          }
          isAnimatingRef.current = false;
          syncCameraSeam(false);
          setCurrentViewState(localityTargetRef.current);
          localityTargetRef.current = null;
          fittedBboxRef.current = bboxKey;
          fittedKeyRef.current = key;
          userMovedRef.current = true;
        } else if (fittedKeyRef.current === null) {
          const activeBbox = drillBbox ?? bounds;
          const init = viewStateWithInset(activeBbox, fitWidth, clientHeight, sheetInset);
          if (animRef.current !== null) {
            cancelAnimationFrame(animRef.current);
            animRef.current = null;
          }
          isAnimatingRef.current = false;
          userMovedRef.current = false;
          syncCameraSeam(false);
          setCurrentViewState(init);
          fittedBboxRef.current = bboxKey;
          fittedKeyRef.current = key;
        } else if (fittedKeyRef.current !== key) {
          const activeBbox = drillBbox ?? bounds;
          const targetView = viewStateWithInset(activeBbox, fitWidth, clientHeight, sheetInset);
          let kind: CameraKind = 'in';
          if (targetView.zoom < currentViewStateRef.current.zoom - 0.05) {
            kind = 'out';
          }
          // Sama zmiana układu (panel profilu pojawia się lub znika, np. zmiana szerokości okna) – bez animacji.
          if (fittedBboxRef.current === bboxKey && lastSideRef.current !== side) kind = 'instant';
          fittedBboxRef.current = bboxKey;
          fittedKeyRef.current = key;
          animateToView(targetView, kind);
        } else if (isResizeEvent && !userMovedRef.current) {
          const activeBbox = drillBbox ?? bounds;
          const targetView = viewStateWithInset(activeBbox, fitWidth, clientHeight, sheetInset);
          fittedBboxRef.current = bboxKey;
          fittedKeyRef.current = key;
          if (isAnimatingRef.current) {
            // Zmiana rozmiaru w trakcie animacji (np. otwarcie lub zamknięcie panelu profilu)
            // nie może jej ucinać skokiem: zmieniamy tylko cel, a ruch płynnie go dogania.
            animTargetRef.current = targetView;
          } else {
            animateToView(targetView, 'instant');
          }
        }
      }
    };

    measure(false);
    lastSideRef.current = sidePanelPx;
    const resizeObserver = new ResizeObserver(() => measure(true));
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [animateToView, bounds, drillBbox, setCurrentViewState, sheetInset, sidePanelPx]);

  // Efekt zależy od progu, nie od zoomu: nie uruchamia się na każdej klatce płynnego zoomu.
  const needsLocalities = currentViewState.zoom >= 8.5;
  useEffect(() => {
    if (needsLocalities) {
      loadLocalities().then((data) => setLocalities(data));
    }
  }, [needsLocalities]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', '+', '=', '-'].includes(e.key)) {
        markUserMoved();
      }
      const panStep = 0.5 / Math.pow(2, currentViewStateRef.current.zoom - 5);
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
    [limits.maxZoom, limits.minZoom, markUserMoved, setCurrentViewState]
  );

  return {
    containerRef,
    currentViewState,
    currentViewStateRef,
    setCurrentViewState,
    limits,
    bounds,
    localities,
    setLocalities,
    localityTargetRef,
    updateViewStateForBbox,
    markUserMoved,
    handleKeyDown,
    isAnimatingRef,
  };
}
