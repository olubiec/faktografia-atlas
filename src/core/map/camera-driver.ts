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
/** Największy przyrost postępu na klatkę (po pierwszej): animacja ma ≥ 6 klatek nawet przy wolnym renderze. */
const MAX_STEP = 1 / 6;
/** Pierwsza klatka spóźniona o więcej (strona była zablokowana) też podlega limitowi kroku. */
const STALL_MS = 300;

export function createCameraDriver(opts: CameraDriverOptions): CameraDriver {
  const { map, clock, onFrame, onEnd } = opts;
  let plan: CameraPlan | null = null;
  let startedAt = 0;
  let current: ViewState = map.getView();
  let cancelFrame: (() => void) | void;
  // Znacznik pokolenia: spóźniona klatka anulowanej animacji jest ignorowana.
  let generation = 0;
  // Ostatnio pokazany postęp (0..1); null do pierwszej klatki planu.
  let shown: number | null = null;

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
    // Postęp wynika z czasu (po zacięciu pozycja nie zależy od licznika klatek),
    // ale rośnie najwyżej o MAX_STEP, by ruch nie „teleportował się” na koniec.
    const elapsed = clock.now() - startedAt;
    const timeProgress = Math.min(1, elapsed / plan.durationMs);
    const base = shown ?? (elapsed > STALL_MS ? 0 : null);
    const progress = base === null ? timeProgress : Math.min(timeProgress, base + MAX_STEP);
    shown = progress;
    emit(sampleCamera(plan, progress * plan.durationMs));
    if (progress >= 1) {
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
    shown = null;
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
