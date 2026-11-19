// Budżet klatek: z odstępów między klatkami wnioskuje „pełna jakość / oszczędnie”, z histerezą (bez migotania).
import { percentile } from './frame-stats';

export type QualityLevel = 'full' | 'lite';

export interface FrameBudgetOptions {
  window?: number;
  slowP95Ms?: number;
  recoverP95Ms?: number;
  recoverFrames?: number;
}

/** Odstępy dłuższe niż to (karta w tle) nie są pomiarem płynności. */
const MAX_VALID_DT_MS = 500;

export function createFrameBudget(opts: FrameBudgetOptions = {}) {
  const { window: size = 30, slowP95Ms = 33, recoverP95Ms = 22, recoverFrames = 60 } = opts;
  let frames: number[] = [];
  let level: QualityLevel = 'full';
  let goodStreak = 0;

  return {
    record(dtMs: number): void {
      if (!Number.isFinite(dtMs) || dtMs <= 0 || dtMs > MAX_VALID_DT_MS) return;
      frames.push(dtMs);
      if (frames.length > size) frames.shift();
      if (frames.length < size) return; // przed pełnym oknem zostajemy przy „full”
      const p95 = percentile([...frames].sort((a, b) => a - b), 0.95);
      if (level === 'full') {
        if (p95 > slowP95Ms) {
          level = 'lite';
          goodStreak = 0;
        }
      } else {
        goodStreak = p95 < recoverP95Ms ? goodStreak + 1 : 0;
        if (goodStreak >= recoverFrames) {
          level = 'full';
          goodStreak = 0;
        }
      }
    },
    level: (): QualityLevel => level,
    reset(): void {
      frames = [];
      level = 'full';
      goodStreak = 0;
    },
  };
}
