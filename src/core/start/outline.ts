// Obrys Polski na stronie startowej: pola z pliku obrysu i pętla animacji (jedna na całą stronę).
// Ruch (tryby, wygładzanie, fala) liczy idle-motion.ts; tu tylko sklejamy go z czasem i klatkami.
import {
  DEFAULT_MOTION, createMotion, cycleIndex, glowAt, pointerMove, tickMotion, waveAt,
  type MotionMode, type MotionState, type Point,
} from './idle-motion';

export const OUTLINE_URL = '/geo/start-outline.json';
/** Co ile ms zmienia się wskaźnik (odpowiedź właściciela: cykl co 5 s). */
export const CYCLE_MS = 5000;
const GLOW_RADIUS = 0.4;
const WAVE_PERIOD_MS = 2400;
const WAVE_REACH = 0.5;

export type OutlineFile = {
  version: number;
  viewBox: [number, number];
  /** Granice kraju [zachód, południe, wschód, północ] w stopniach: ten sam kadr co mapa (poster-frame.ts). */
  bbox: [number, number, number, number];
  paths: { teryt: string; d: string }[] };
export type Cell = { teryt: string; d: string; center: Point };

export async function loadOutline(fetchImpl: typeof fetch = (...a) => fetch(...a)): Promise<OutlineFile> {
  const res = await fetchImpl(OUTLINE_URL);
  if (!res.ok) throw new Error(`Nie udało się wczytać ${OUTLINE_URL}: HTTP ${res.status}`);
  return (await res.json()) as OutlineFile;
}

/** Pola z obrysu; środek pola (0..1 w ramce obrysu) służy do podświetlenia i wyboru najbliższego. */
export function outlineCells(file: OutlineFile): Cell[] {
  const [w, h] = file.viewBox;
  return file.paths.map((p) => {
    const nums = (p.d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    let sx = 0;
    let sy = 0;
    const n = Math.floor(nums.length / 2);
    for (let i = 0; i < n; i++) {
      sx += nums[2 * i];
      sy += nums[2 * i + 1];
    }
    const center: Point = n ? [sx / n / w, sy / n / h] : [0.5, 0.5];
    return { teryt: p.teryt, d: p.d, center };
  });
}

/** TERYT pola najbliższego punktowi; null, gdy nie ma punktu. */
export function nearestCell(cells: Cell[], focus: Point | null): string | null {
  if (!focus) return null;
  let best: { d: number; teryt: string | null } = { d: Infinity, teryt: null };
  for (const c of cells) {
    const d = Math.hypot(c.center[0] - focus[0], c.center[1] - focus[1]);
    if (d < best.d) best = { d, teryt: c.teryt };
  }
  return best.teryt;
}

export type Frame = {
  /** Który wskaźnik jest na ekranie (0 = ludność). */
  index: number;
  mode: MotionMode;
  nearest: string | null;
  /** Dla każdego pola (w kolejności `cells`): przezroczystość i grubość obrysu. */
  strokes: { opacity: number; width: number }[];
};

export type LoopEnv = {
  now: () => number;
  raf: (cb: (t: number) => void) => number;
  caf: (id: number) => void;
  rand: () => number;
};

export type StartLoop = {
  start: () => void;
  stop: () => void;
  pointer: (p: Point) => void;
  /** Pauza z powodu (karta ukryta, tło poza ekranem); pętla rusza dopiero, gdy żadnego powodu nie ma. */
  setPaused: (reason: string, on: boolean) => void;
  running: () => boolean;
};

export type LoopOptions = {
  cells: Cell[];
  count: number;
  reduced: boolean;
  env: LoopEnv;
  onFrame: (f: Frame) => void;
};

/** Jedna pętla requestAnimationFrame. Przy reduced-motion nie rusza w ogóle: jeden statyczny kadr. */
export function createStartLoop({ cells, count, reduced, env, onFrame }: LoopOptions): StartLoop {
  const opts = { ...DEFAULT_MOTION, reducedMotion: reduced };
  let state: MotionState = createMotion(env.now(), opts, env.rand);
  let elapsed = 0; // czas biegnący cyklu: stoi, gdy animacja reaguje na kursor
  let last = env.now();
  let id: number | null = null;
  let started = false;
  const paused = new Set<string>();

  const emit = (now: number) => {
    const strokes = cells.map((c) => {
      const g = Math.max(
        glowAt(c.center, state.focus, GLOW_RADIUS),
        waveAt(c.center, state.focus, now, WAVE_PERIOD_MS, WAVE_REACH) * 0.8,
      );
      return { opacity: 0.55 + 0.45 * g, width: 0.5 + 2.5 * g };
    });
    onFrame({
      index: reduced ? 0 : cycleIndex(elapsed, CYCLE_MS, count),
      mode: state.mode,
      nearest: reduced ? null : nearestCell(cells, state.focus),
      strokes,
    });
  };

  const frame = (now: number) => {
    const dt = Math.max(0, now - last);
    last = now;
    state = tickMotion(state, now, opts, env.rand);
    if (state.mode !== 'react') elapsed += dt;
    emit(now);
    id = env.raf(frame);
  };

  const halt = () => {
    if (id !== null) env.caf(id);
    id = null;
  };
  const run = () => {
    if (!started || reduced || id !== null || paused.size > 0) return;
    last = env.now();
    state = { ...state, lastTickAt: last };
    id = env.raf(frame);
  };

  return {
    start() {
      started = true;
      emit(env.now());
      run();
    },
    stop() {
      started = false;
      halt();
    },
    pointer(p) {
      state = pointerMove(state, p, env.now(), opts);
    },
    setPaused(reason, on) {
      if (on) paused.add(reason);
      else paused.delete(reason);
      if (paused.size > 0) halt();
      else run();
    },
    running: () => id !== null,
  };
}

type VisibilityDoc = {
  hidden: boolean;
  addEventListener: (type: 'visibilitychange', cb: () => void) => void;
  removeEventListener: (type: 'visibilitychange', cb: () => void) => void;
};

/** Pauzuje pętlę, gdy karta jest ukryta. Zwraca funkcję sprzątającą. */
export function bindVisibility(doc: VisibilityDoc, loop: StartLoop): () => void {
  const on = () => loop.setPaused('hidden', doc.hidden);
  doc.addEventListener('visibilitychange', on);
  on();
  return () => doc.removeEventListener('visibilitychange', on);
}
