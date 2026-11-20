// Czysta logika ruchu animowanej mapy na stronie startowej (prototyp U07).
// Bez Reacta i bez DOM: czas i losowość są podawane z zewnątrz, więc wszystko da się przetestować.

/** Punkt w przestrzeni obrysu: x i y w zakresie 0..1. */
export type Point = [number, number];

/** random = ruch losowy w spoczynku, react = podąża za kursorem lub palcem, static = brak ruchu. */
export type MotionMode = 'random' | 'react' | 'static';

export type MotionOptions = {
  /** Po tylu ms bez ruchu kursora wracamy do trybu losowego. */
  idleMs: number;
  /** Co tyle ms tryb losowy wybiera nowy punkt zainteresowania. */
  jumpMs: number;
  /** Stała czasu wygładzania (ms): po tylu ms punkt pokonuje ok. 63% drogi do celu. */
  smoothMs: number;
  reducedMotion: boolean;
};

export type MotionState = {
  mode: MotionMode;
  /** Punkt, wokół którego świeci animacja (wygładzony). Null = nie ma ruchu. */
  focus: Point | null;
  /** Dokąd focus zmierza. */
  target: Point | null;
  lastInputAt: number;
  lastJumpAt: number;
  lastTickAt: number;
};

export const DEFAULT_MOTION: MotionOptions = {
  idleMs: 4000,
  jumpMs: 2200,
  smoothMs: 350,
  reducedMotion: false,
};

/** Stan początkowy: bez kursora od razu ruch losowy (na telefonie nikt nie „najeżdża”). */
export function createMotion(now: number, options: MotionOptions, rand: () => number): MotionState {
  if (options.reducedMotion) {
    return { mode: 'static', focus: null, target: null, lastInputAt: now, lastJumpAt: now, lastTickAt: now };
  }
  const p: Point = [rand(), rand()];
  return { mode: 'random', focus: p, target: p, lastInputAt: -Infinity, lastJumpAt: now, lastTickAt: now };
}

/** Ruch kursora lub dotyk: przechodzimy do trybu reakcji. Przy reduced-motion nic się nie zmienia. */
export function pointerMove(state: MotionState, point: Point, now: number, options: MotionOptions): MotionState {
  if (options.reducedMotion) return state;
  return {
    ...state,
    mode: 'react',
    target: point,
    focus: state.focus ?? point,
    lastInputAt: now,
  };
}

/** Jeden krok animacji (wołany z requestAnimationFrame). */
export function tickMotion(state: MotionState, now: number, options: MotionOptions, rand: () => number): MotionState {
  if (options.reducedMotion) {
    if (state.mode === 'static' && state.focus === null) return state;
    return { ...state, mode: 'static', focus: null, target: null, lastTickAt: now };
  }
  let { mode, target, lastJumpAt } = state;
  if (mode === 'react' && now - state.lastInputAt >= options.idleMs) {
    mode = 'random';
    lastJumpAt = -Infinity; // od razu wybierz nowy cel
  }
  if (mode === 'random' && now - lastJumpAt >= options.jumpMs) {
    target = [rand(), rand()];
    lastJumpAt = now;
  }
  const dt = Math.max(0, now - state.lastTickAt);
  const k = 1 - Math.exp(-dt / options.smoothMs);
  const from = state.focus ?? target;
  const focus: Point | null =
    from && target ? [from[0] + (target[0] - from[0]) * k, from[1] + (target[1] - from[1]) * k] : null;
  return { ...state, mode, target, focus, lastJumpAt, lastTickAt: now };
}

/**
 * Siła podświetlenia 0..1 dla pola w odległości od punktu zainteresowania.
 * Spadek jest płynny (cosinus); poza promieniem jest 0. Bez punktu: 0.
 */
export function glowAt(cell: Point, focus: Point | null, radius: number): number {
  if (!focus || radius <= 0) return 0;
  const d = Math.hypot(cell[0] - focus[0], cell[1] - focus[1]);
  if (d >= radius) return 0;
  return (1 + Math.cos((Math.PI * d) / radius)) / 2;
}

/** Fala wokół punktu: pierścień, który rozchodzi się co periodMs. Zwraca 0..1. */
export function waveAt(cell: Point, focus: Point | null, now: number, periodMs: number, reach: number): number {
  if (!focus || periodMs <= 0 || reach <= 0) return 0;
  const d = Math.hypot(cell[0] - focus[0], cell[1] - focus[1]);
  const front = (((now % periodMs) + periodMs) % periodMs) / periodMs * reach;
  const w = reach / 6;
  return Math.exp(-(((d - front) / w) ** 2)) * (1 - front / reach);
}

/** Który wskaźnik jest na ekranie po upływie elapsedMs (wariant „zmieniające się wskaźniki”). */
export function cycleIndex(elapsedMs: number, periodMs: number, count: number): number {
  if (count <= 0 || periodMs <= 0) return 0;
  return Math.floor(Math.max(0, elapsedMs) / periodMs) % count;
}

/** Rzut długości i szerokości geograficznej na płaszczyznę (jednostki ok. 1/100 stopnia szerokości). */
export function projectLonLat(lon: number, lat: number): Point {
  const k = Math.cos((52 * Math.PI) / 180);
  return [(lon - 14) * k * 100, (55 - lat) * 100];
}

function distToSegment(p: Point, a: Point, b: Point): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = dx * dx + dy * dy;
  if (len === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const u = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len));
  return Math.hypot(p[0] - (a[0] + u * dx), p[1] - (a[1] + u * dy));
}

/** Upraszcza łamaną (Douglas–Peucker): zostają punkty odchylone od linii o więcej niż eps. */
export function simplifyLine(points: Point[], eps: number): Point[] {
  if (points.length < 3) return points;
  let max = 0;
  let idx = 0;
  const a = points[0];
  const b = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i++) {
    const d = distToSegment(points[i], a, b);
    if (d > max) {
      max = d;
      idx = i;
    }
  }
  if (max <= eps) return [a, b];
  return [...simplifyLine(points.slice(0, idx + 1), eps).slice(0, -1), ...simplifyLine(points.slice(idx), eps)];
}

/** Zamienia pierścień na tekst ścieżki SVG (jedna cyfra po przecinku). */
export function ringToPath(points: Point[]): string {
  if (points.length === 0) return '';
  return `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}Z`;
}
