import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { initialViewState, mapLimits, type ViewState } from '@/core/map/view';
import { loadLocalities } from '@/core/search/load-localities';
import type { Locality } from '@/core/search/types';
import { useSheetInset } from '@/view/map/sheetInset';
import { cameraTransition, type CameraKind } from '@/core/map/camera';
import { resizeCameraAction } from '@/core/map/camera-resize';
import { flyView, flyDuration } from '@/core/map/camera-path';
import tokensJson from '../../../../config/tokens.json';

// Margines (px) wokół dopasowanego obszaru, żeby mapa nie dotykała krawędzi okna.
const FIT_PADDING = 48;

type Bbox = [number, number, number, number];
// Przybliżony obrys Polski; używany tylko, gdy lista jednostek nie jest jeszcze wczytana.
const POLAND_BBOX: Bbox = [14.12, 49.0, 24.15, 54.84];

const mercatorLat = (latDeg: number): number => Math.log(Math.tan(Math.PI / 4 + (latDeg * Math.PI) / 360));

const mercatorLatToDeg = (m: number): number => (360 / Math.PI) * Math.atan(Math.exp(m)) - 90;

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

function parseCubicBezier(easingStr: string): (t: number) => number {
  const match = easingStr.match(/cubic-bezier\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/);
  if (!match) {
    return (t: number) => t;
  }
  const x1 = parseFloat(match[1]);
  const y1 = parseFloat(match[2]);
  const x2 = parseFloat(match[3]);
  const y2 = parseFloat(match[4]);

  return function ease(x: number): number {
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    let tLo = 0;
    let tHi = 1;
    let t = x;

    for (let i = 0; i < 12; i++) {
      const currentX = 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
      if (currentX < x) {
        tLo = t;
      } else {
        tHi = t;
      }
      t = (tLo + tHi) / 2;
    }

    return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
  };
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

export function useMapViewState(drillBbox?: Bbox | null, countryBbox: Bbox = POLAND_BBOX) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sheetInset = useSheetInset();
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [localities, setLocalities] = useState<Locality[]>([]);
  const localityTargetRef = useRef<ViewState | null>(null);

  const fittedKeyRef = useRef<string | null>(null);
  const fittedBboxRef = useRef<string | null>(null);
  const userMovedRef = useRef(false);
  const animRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);
  // Aktualny cel biegnącej animacji; czytany w każdej klatce, więc można go podmienić w trakcie.
  const animTargetRef = useRef<ViewState | null>(null);
  // Ostatni postęp (po krzywej) biegnącej animacji oraz prośba o przeliczenie punktu startu po zmianie celu.
  const animEasedRef = useRef(0);
  // Koniec ostatniej animacji (performance.now); null = brak.
  const animEndRef = useRef<number | null>(null);
  const animRebaseRef = useRef<ViewState | null>(null);

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
    (targetView: ViewState, kind: CameraKind = 'in') => {
      if (animRef.current !== null) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      let fromView = { ...currentViewStateRef.current };
      animEasedRef.current = 0;
      animRebaseRef.current = null;
      animTargetRef.current = targetView;
      const base = cameraTransition(fromView, targetView, kind, reducedMotion);
      const size = { width: containerRef.current?.clientWidth || 800, height: containerRef.current?.clientHeight || 600 };
      // Czas lotu dobrany do odległości; 0 zostaje 0 (link, reduced motion).
      let duration = base.duration > 0 ? flyDuration(fromView, targetView, kind, size) : 0;
      const easing = base.duration > 0 ? tokensJson.motion.cameraFlyEasing : base.easing;

      if (duration <= 0) {
        userMovedRef.current = false;
        isAnimatingRef.current = false;
        setCurrentViewState(targetView);
        syncCameraSeam(false, { type: 'push', view: targetView });
        return;
      }

      userMovedRef.current = false;
      isAnimatingRef.current = true;
      syncCameraSeam(true, { type: 'reset', view: fromView });

      let startTime: number | null = null;
      let frameCount = 0;
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

        frameCount++;
        const elapsed = now - startTime;
        const timeProgress = Math.min(1, elapsed / duration);
        const frameProgress = Math.min(1, frameCount / 6);
        const progress = Math.min(1, Math.min(timeProgress, frameProgress));

        const finished = timeProgress >= 1 && frameProgress >= 1;
        const eased = easeFn(finished ? 1 : progress);

        const goal = animTargetRef.current ?? targetView;
        if (animRebaseRef.current) {
          // Cel się zmienił w trakcie (np. kolumna profilu): lecimy dalej z bieżącego widoku, bez skoku.
          fromView = { ...animRebaseRef.current };
          duration = Math.max(400, duration * (1 - timeProgress));
          startTime = now;
          animRebaseRef.current = null;
          animRef.current = requestAnimationFrame(animate);
          return;
        }
        const nextView: ViewState = flyView(fromView, goal, eased, size);

        animEasedRef.current = eased;
        setCurrentViewState(nextView);
        syncCameraSeam(!finished, { type: 'push', view: nextView });

        if (!finished) {
          animRef.current = requestAnimationFrame(animate);
        } else {
          animEndRef.current = performance.now();
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
    (targetBbox: Bbox | null, explicitKind?: CameraKind) => {
      const width = containerRef.current?.clientWidth ?? dimensions.width;
      const height = containerRef.current?.clientHeight ?? dimensions.height;
      if (width > 0 && height > 0) {
        const activeBbox = targetBbox ?? bounds;
        const newView = viewStateWithInset(activeBbox, width, height, sheetInset);

        const bboxKey = JSON.stringify(targetBbox ?? null);
        const key = JSON.stringify({ bbox: targetBbox ?? null, inset: Math.round(sheetInset) });

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
        animateToView(newView, kind);
      }
    },
    [animateToView, bounds, dimensions, sheetInset]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const measure = (isResizeEvent = false) => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth > 0 && clientHeight > 0) {
        setDimensions({ width: clientWidth, height: clientHeight });
        const bboxKey = JSON.stringify(drillBbox ?? null);
        const key = JSON.stringify({ bbox: drillBbox ?? null, inset: Math.round(sheetInset) });

        const action = resizeCameraAction({
          hasLocalityTarget: localityTargetRef.current !== null,
          fittedKey: fittedKeyRef.current,
          nextKey: key,
          isResize: isResizeEvent,
          animating: isAnimatingRef.current,
          userMoved: userMovedRef.current,
          msSinceAnimationEnd:
            animEndRef.current === null ? undefined : performance.now() - animEndRef.current,
          reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        });
        const activeBbox = drillBbox ?? bounds;

        if (action === 'locality' && localityTargetRef.current) {
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
        } else if (action === 'init') {
          const init = viewStateWithInset(activeBbox, clientWidth, clientHeight, sheetInset);
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
        } else if (action === 'animate') {
          const targetView = viewStateWithInset(activeBbox, clientWidth, clientHeight, sheetInset);
          let kind: CameraKind = 'in';
          if (targetView.zoom < currentViewStateRef.current.zoom - 0.05) {
            kind = 'out';
          }
          fittedBboxRef.current = bboxKey;
          fittedKeyRef.current = key;
          animateToView(targetView, kind);
        } else if (action === 'retarget') {
          // Trwającej animacji nie anulujemy: podmieniamy tylko cel dla nowych wymiarów.
          animTargetRef.current = viewStateWithInset(activeBbox, clientWidth, clientHeight, sheetInset);
          animRebaseRef.current = { ...currentViewStateRef.current };
          fittedBboxRef.current = bboxKey;
          fittedKeyRef.current = key;
        } else if (action === 'settle') {
          // Kolumna pojawiła się tuż po animacji: krótki dojazd (czas ruchu wstecz) zamiast skoku.
          fittedBboxRef.current = bboxKey;
          fittedKeyRef.current = key;
          animateToView(viewStateWithInset(activeBbox, clientWidth, clientHeight, sheetInset), 'out');
        } else if (action === 'instant') {
          const targetView = viewStateWithInset(activeBbox, clientWidth, clientHeight, sheetInset);
          fittedBboxRef.current = bboxKey;
          fittedKeyRef.current = key;
          animateToView(targetView, 'instant');
        }
      }
    };

    measure(false);
    const resizeObserver = new ResizeObserver(() => measure(true));
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [animateToView, bounds, drillBbox, setCurrentViewState, sheetInset]);

  useEffect(() => {
    if (currentViewState.zoom >= 8.5) {
      loadLocalities().then((data) => setLocalities(data));
    }
  }, [currentViewState.zoom]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', '+', '=', '-'].includes(e.key)) {
        markUserMoved();
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
    [currentViewState.zoom, limits.maxZoom, limits.minZoom, markUserMoved, setCurrentViewState]
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
