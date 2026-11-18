import { planCamera, sampleCamera, type CameraPlan } from "./camera-plan";
import type { ViewState } from "./view";

/** Minimalny interfejs mapy (łatwy do sfałszowania w teście; bez maplibre-gl). */
export type DriverMap = {
  jumpTo(view: ViewState): void;
  getView(): ViewState;
  /** Szerokość widoku w px (do liczenia czasu przy retarget); opcjonalna. */
  getViewportWidthPx?(): number;
};

/** Zegar wstrzykiwany: w aplikacji rAF + performance.now, w teście atrapa. */
export type DriverClock = {
  now(): number;
  /** Zleca jedną klatkę; może zwrócić funkcję anulującą. */
  schedule(cb: () => void): (() => void) | void;
};

export type CameraDriverOptions = {
  map: DriverMap;
  clock: DriverClock;
  onFrame?: (view: ViewState) => void;
  onEnd?: () => void;
};

export type CameraDriver = {
  start(plan: CameraPlan): void;
  cancel(): void;
  retarget(to: ViewState): void;
  isAnimating(): boolean;
  getCurrent(): ViewState;
};

/** Najkrótszy czas przejęcia animacji w locie. */
const MIN_RETARGET_MS = 200;
const FALLBACK_VIEWPORT_PX = 1000;

export function createCameraDriver(opts: CameraDriverOptions): CameraDriver {
  const { map, clock, onFrame, onEnd } = opts;
  let plan: CameraPlan | null = null;
  let startedAt = 0;
  let current: ViewState = map.getView();
  let cancelFrame: (() => void) | void;
  // Znacznik pokolenia: spóźniona klatka anulowanej animacji jest ignorowana.
  let generation = 0;

  const stopPending = () => {
    if (cancelFrame) cancelFrame();
    cancelFrame = undefined;
  };

  const emit = (view: ViewState) => {
    current = view;
    map.jumpTo(view);
    onFrame?.(view);
  };

  const tick = (gen: number) => {
    if (gen !== generation || !plan) return;
    // Bez limitu kroku: po zacięciu pozycja wynika z czasu, nie z licznika klatek.
    const elapsed = clock.now() - startedAt;
    emit(sampleCamera(plan, elapsed));
    if (elapsed >= plan.durationMs) {
      plan = null;
      cancelFrame = undefined;
      onEnd?.();
      return;
    }
    cancelFrame = clock.schedule(() => tick(gen));
  };

  const start = (next: CameraPlan) => {
    stopPending();
    generation += 1;
    plan = next;
    startedAt = clock.now();
    if (next.durationMs <= 0) {
      emit(next.to);
      plan = null;
      onEnd?.();
      return;
    }
    const gen = generation;
    cancelFrame = clock.schedule(() => tick(gen));
  };

  return {
    start,
    cancel() {
      stopPending();
      generation += 1;
      plan = null;
    },
    /**
     * Nowy plan od bieżącego widoku, czas z planCamera skrócony do ≥ 200 ms.
     * Przejęcie w locie jest łagodne, bo krzywa planu startuje z prędkością 0
     * (pierwsza klatka praktycznie stoi w miejscu, więc nie ma skoku).
     */
    retarget(to) {
      const width = map.getViewportWidthPx?.() ?? FALLBACK_VIEWPORT_PX;
      const base = planCamera(current, to, {
        viewportWidthPx: width,
        reducedMotion: false,
      });
      start({ ...base, durationMs: Math.max(MIN_RETARGET_MS, base.durationMs) });
    },
    isAnimating: () => plan !== null,
    getCurrent: () => current,
  };
}
