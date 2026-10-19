// Czysta logika osi czasu animacji wejściowej ("kreślenie").

export type IntroStageId = 'outline' | 'fill' | 'annotate';

export interface TimelineStage {
  id: IntroStageId;
  start: number;
  duration: number;
}

export interface MotionTokens {
  drawOutline: number;
  base: number;
  slow: number;
  [key: string]: unknown;
}

export interface BuildIntroTimelineOptions {
  reducedMotion: boolean;
  motion: MotionTokens;
}

/**
 * Buduje sekwencję etapów animacji wejściowej bez nakładania się na siebie.
 * Czasy trwania pobierane są z przekazanego obiektu `motion` z tokenów.
 * Jeśli `reducedMotion` jest true, wszystkie czasy trwania i opóźnienia wynoszą 0.
 */
export function buildIntroTimeline({
  reducedMotion,
  motion,
}: BuildIntroTimelineOptions): TimelineStage[] {
  if (reducedMotion) {
    return [
      { id: 'outline', start: 0, duration: 0 },
      { id: 'fill', start: 0, duration: 0 },
      { id: 'annotate', start: 0, duration: 0 },
    ];
  }

  const outlineDuration = motion.drawOutline;
  const fillDuration = motion.base;
  const annotateDuration = motion.slow;

  const outlineStart = 0;
  const fillStart = outlineStart + outlineDuration;
  const annotateStart = fillStart + fillDuration;

  return [
    { id: 'outline', start: outlineStart, duration: outlineDuration },
    { id: 'fill', start: fillStart, duration: fillDuration },
    { id: 'annotate', start: annotateStart, duration: annotateDuration },
  ];
}

/**
 * Zwraca łączny czas trwania całej osi czasu (sumę czasów wszystkich etapów).
 */
export function totalDuration(timeline: TimelineStage[]): number {
  return timeline.reduce((acc, stage) => acc + stage.duration, 0);
}

/**
 * Zwraca aktywny etap i jego postęp (od 0 do 1) dla podanego czasu `t` w ms.
 * Przed rozpoczęciem zwraca pierwszy etap z progress = 0.
 * Po zakończeniu animacji zwraca ostatni etap z progress = 1.
 */
export function stageAt(
  timeline: TimelineStage[],
  t: number
): { id: IntroStageId; progress: number } {
  if (timeline.length === 0) {
    throw new Error('Timeline is empty');
  }

  const total = totalDuration(timeline);

  if (t < timeline[0].start) {
    return { id: timeline[0].id, progress: 0 };
  }

  if (t >= total) {
    return { id: timeline[timeline.length - 1].id, progress: 1 };
  }

  for (let i = 0; i < timeline.length; i++) {
    const stage = timeline[i];
    const stageEnd = stage.start + stage.duration;

    if (t < stageEnd) {
      const progress = stage.duration > 0 ? (t - stage.start) / stage.duration : 1;
      return { id: stage.id, progress };
    }
  }

  const lastStage = timeline[timeline.length - 1];
  return { id: lastStage.id, progress: 1 };
}
