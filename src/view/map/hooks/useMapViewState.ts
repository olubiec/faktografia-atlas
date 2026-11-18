import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { initialViewState, mapLimits, type MapLimits, type ViewState } from '@/core/map/view';
import { loadLocalities } from '@/core/search/load-localities';
import type { Locality } from '@/core/search/types';
import { useSheetInset } from '@/view/map/sheetInset';
import type { CameraKind } from '@/core/map/camera';
import { planCamera } from '@/core/map/camera-plan';
import type { DriverMap } from '@/core/map/camera-driver';
import { layersZoomBucket } from '@/core/map/localities-layer';
import { useCameraDriver } from '@/view/map/hooks/useCameraDriver';
import type { MapRef } from 'react-map-gl/maplibre';

// Margines (px) wokół dopasowanego obszaru, żeby mapa nie dotykała krawędzi okna.
const FIT_PADDING = 48;
// Tolerancja (stopnie / poziomy zoomu), poniżej której widoki uznajemy za równe.
const SAME_EPS = 1e-9;

function sameView(a: ViewState, b: ViewState): boolean {
  return (
    Math.abs(a.longitude - b.longitude) < SAME_EPS &&
    Math.abs(a.latitude - b.latitude) < SAME_EPS &&
    Math.abs(a.zoom - b.zoom) < SAME_EPS
  );
}

function readMapView(map: MapRef): ViewState {
  const c = map.getCenter();
  return { longitude: c.lng, latitude: c.lat, zoom: map.getZoom() };
}

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
  const baseView = initialViewState(bounds, Math.max(1, width - FIT_PADDING), Math.max(1, height - insetPx - FIT_PADDING));
  const mShift = insetPx * Math.PI / (512 * Math.pow(2, baseView.zoom));
  return { longitude: baseView.longitude, latitude: mercatorLatToDeg(mercatorLat(baseView.latitude) - mShift), zoom: baseView.zoom };
}

/**
 * MapLibre nie pozwala oddalić się dalej, niż mieści maxBounds. Na wysokim ekranie (telefon)
 * to uniemożliwiałoby dojście do minZoom, więc maxBounds obejmuje też okno widoku przy minZoom.
 */
function widenToViewport(l: MapLimits, b: Bbox, { width, height }: { width: number; height: number }): MapLimits {
  if (width <= 0 || height <= 0) return l;
  const worldPx = 512 * Math.pow(2, l.minZoom);
  const halfLon = (width / 2 / worldPx) * 360;
  const halfMerc = (height / 2 / worldPx) * 2 * Math.PI;
  const cLon = (b[0] + b[2]) / 2;
  const cMerc = (mercatorLat(b[1]) + mercatorLat(b[3])) / 2;
  const [w, s, e, n] = l.maxBounds;
  return {
    ...l,
    maxBounds: [
      Math.min(w, cLon - halfLon),
      Math.min(s, mercatorLatToDeg(cMerc - halfMerc)),
      Math.max(e, cLon + halfLon),
      Math.max(n, mercatorLatToDeg(cMerc + halfMerc)),
    ],
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
  if (action?.type === 'reset') trace = [{ ...action.view }];
  else if (action?.type === 'push') trace = [...trace, { ...action.view }];
  currentCameraSeamState = { animating, trace };
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
  const isAnimatingRef = useRef(false);
  // Mapa niekontrolowana: kamerą steruje sterownik (jump na klatkę), bez setState.
  const mapRef = useRef<MapRef>(null);
  const bounds = countryBbox;
  const limits = useMemo(
    () => widenToViewport(mapLimits(bounds, dimensions.width, dimensions.height), bounds, dimensions),
    [bounds, dimensions]
  );

  // „Widok spoczynkowy”: stan Reacta zmienia się na koniec ruchu i przy zmianie koszyka warstw, nie na klatkę.
  const [currentViewState, _setCurrentViewState] = useState<ViewState>({
    longitude: 19.145,
    latitude: 51.919,
    zoom: 5.5,
  });

  // Źródło prawdy o bieżącym widoku (także w trakcie animacji i gestu).
  const currentViewStateRef = useRef<ViewState>(currentViewState);
  const restRef = useRef<ViewState>(currentViewState);

  const commitRest = useCallback((view: ViewState) => {
    if (sameView(restRef.current, view)) return;
    restRef.current = view;
    _setCurrentViewState(view);
  }, []);

  /** Ustawia widok od razu (bez animacji): stan, ref i kamera mapy. */
  const setCurrentViewState = useCallback(
    (action: React.SetStateAction<ViewState>) => {
      const next = typeof action === 'function' ? action(currentViewStateRef.current) : action;
      currentViewStateRef.current = next;
      commitRest(next);
      mapRef.current?.jumpTo({ center: [next.longitude, next.latitude], zoom: next.zoom });
    },
    [commitRest]
  );
  /** Po załadowaniu mapy: ustawia kamerę, jeśli widok wyznaczono przed jej powstaniem. */
  const syncMap = useCallback(() => {
    const map = mapRef.current;
    const want = currentViewStateRef.current;
    if (map && !sameView(readMapView(map), want)) {
      map.jumpTo({ center: [want.longitude, want.latitude], zoom: want.zoom });
    }
  }, []);

  /** Zapisuje widok z mapy do refa; jeden setState tylko przy przekroczeniu progu koszyka warstw. */
  const trackView = useCallback(
    (view: ViewState) => {
      currentViewStateRef.current = view;
      if (layersZoomBucket(view.zoom) !== layersZoomBucket(restRef.current.zoom)) commitRest(view);
    },
    [commitRest]
  );

  // Adapter mapy dla sterownika; mapa może jeszcze nie istnieć, wtedy klatki nic nie robią.
  const driverMap = useMemo<DriverMap>(
    () => ({
      jumpTo: (v) => mapRef.current?.jumpTo({ center: [v.longitude, v.latitude], zoom: v.zoom }),
      getView: () => currentViewStateRef.current,
      getViewportWidthPx: () => containerRef.current?.clientWidth ?? 0,
    }),
    []
  );

  const driverRef = useCameraDriver({
    map: driverMap,
    onFrame: (view) => {
      trackView(view);
      syncCameraSeam(true, { type: 'push', view });
    },
    onEnd: () => {
      isAnimatingRef.current = false;
      const last = currentViewStateRef.current;
      syncCameraSeam(false, { type: 'push', view: last });
      commitRest(last);
    },
  });

  const markUserMoved = useCallback(() => {
    driverRef.current?.cancel();
    isAnimatingRef.current = false;
    userMovedRef.current = true;
    syncCameraSeam(false);
  }, [driverRef]);

  /** Ruch zgłaszany przez mapę (gest użytkownika albo nasz jump); koniec ruchu zapisuje widok spoczynkowy. */
  const handleMapMove = useCallback(
    (view: ViewState, byUser: boolean) => {
      if (byUser) markUserMoved();
      trackView(view);
    },
    [markUserMoved, trackView]
  );
  const handleMapMoveEnd = useCallback(
    (view: ViewState) => {
      if (isAnimatingRef.current) return;
      currentViewStateRef.current = view;
      commitRest(view);
    },
    [commitRest]
  );

  const animateToView = useCallback(
    (targetView: ViewState, kind: CameraKind = 'in', fromOverride?: ViewState) => {
      const driver = driverRef.current;
      driver?.cancel();

      const reducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const fromView = fromOverride ? { ...fromOverride } : { ...currentViewStateRef.current };
      if (fromOverride) {
        // Punkt startu skorygowany o zmianę układu: ustawiamy go od razu, w tym samym renderze co układ.
        setCurrentViewState(fromView);
      }
      const plan = planCamera(fromView, targetView, {
        viewportWidthPx: containerRef.current?.clientWidth ?? 0,
        reducedMotion: reducedMotion || kind === 'instant',
      });

      userMovedRef.current = false;
      if (plan.durationMs <= 0 || !driver) {
        isAnimatingRef.current = false;
        setCurrentViewState(targetView);
        syncCameraSeam(false, { type: 'push', view: targetView });
        return;
      }

      isAnimatingRef.current = true;
      syncCameraSeam(true, { type: 'reset', view: fromView });
      driver.start(plan);
    },
    [driverRef, setCurrentViewState]
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
          driverRef.current?.cancel();
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
          driverRef.current?.cancel();
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
            driverRef.current?.retarget(targetView);
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
  }, [animateToView, bounds, drillBbox, driverRef, setCurrentViewState, sheetInset, sidePanelPx]);

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

      const move = (patch: (prev: ViewState) => Partial<ViewState>) => {
        e.preventDefault();
        setCurrentViewState((prev) => ({ ...prev, ...patch(prev) }));
      };
      if (e.key === 'ArrowRight') move((p) => ({ longitude: p.longitude + panStep }));
      else if (e.key === 'ArrowLeft') move((p) => ({ longitude: p.longitude - panStep }));
      else if (e.key === 'ArrowUp') move((p) => ({ latitude: p.latitude + panStep }));
      else if (e.key === 'ArrowDown') move((p) => ({ latitude: p.latitude - panStep }));
      else if (e.key === '+' || e.key === '=') move((p) => ({ zoom: Math.min(limits.maxZoom, p.zoom + zoomStep) }));
      else if (e.key === '-') move((p) => ({ zoom: Math.max(limits.minZoom, p.zoom - zoomStep) }));
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
    mapRef,
    syncMap,
    handleMapMove,
    handleMapMoveEnd,
  };
}
