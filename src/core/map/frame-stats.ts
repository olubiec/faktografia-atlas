// Statystyki płynności klatek (znaczniki rAF) – czysta logika, bez zależności od przeglądarki.

export type FrameSummary = {
  frames: number;
  durationMs: number;
  p50: number;
  p95: number;
  max: number;
  longFrames: number;
  droppedShare: number;
};

const EMPTY: FrameSummary = {
  frames: 0,
  durationMs: 0,
  p50: 0,
  p95: 0,
  max: 0,
  longFrames: 0,
  droppedShare: 0,
};

/** Odstęp powyżej tej wartości (ms) uznajemy za długą klatkę. */
const LONG_FRAME_MS = 50;
/** Klatka jest „zgubiona”, gdy trwa dłużej niż tyle budżetów. */
const DROPPED_FACTOR = 1.5;

/** Percentyl metodą najbliższej pozycji; `sorted` rosnąco, p w zakresie 0..1. */
export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const clamped = Math.min(1, Math.max(0, p));
  const rank = Math.ceil(clamped * sorted.length);
  const index = Math.min(sorted.length - 1, Math.max(0, rank - 1));
  return sorted[index];
}

/** Z kolejnych znaczników czasu rAF (ms) liczy odstępy i podsumowuje płynność. */
export function summarizeFrames(
  timestampsMs: number[],
  budgetMs: number = 1000 / 60
): FrameSummary {
  if (timestampsMs.length < 2) return { ...EMPTY };

  const gaps: number[] = [];
  for (let i = 1; i < timestampsMs.length; i += 1) {
    gaps.push(timestampsMs[i] - timestampsMs[i - 1]);
  }
  const sorted = [...gaps].sort((a, b) => a - b);

  return {
    frames: gaps.length,
    durationMs: timestampsMs[timestampsMs.length - 1] - timestampsMs[0],
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    max: sorted[sorted.length - 1],
    longFrames: gaps.filter((g) => g > LONG_FRAME_MS).length,
    droppedShare: gaps.filter((g) => g > DROPPED_FACTOR * budgetMs).length / gaps.length,
  };
}
