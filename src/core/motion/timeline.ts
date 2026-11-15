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
  /** Wersja skrócona (telefon). Domyślnie wyłączona. */
  compact?: boolean;
}

/** Telefon: czas całkowity intra <= 0,6 × czas na desktopie. */
export const PHONE_DURATION_RATIO = 0.6;

/** Szerokość (px), poniżej której uznajemy ekran za telefon. */
export const PHONE_MAX_WIDTH = 768;

/** Klucz w sessionStorage: intro pokazujemy raz na sesję. */
export const INTRO_SESSION_KEY = 'atlas-intro-seen';

/** Czy intro było już pokazane w tej sesji (błąd storage = traktuj jak „nie”). */
export function hasSeenIntro(storage: Storage | undefined): boolean {
  try {
    return storage?.getItem(INTRO_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

/** Zapamiętuje pokazanie intra w sesji (ciche przy błędzie storage). */
export function markIntroSeen(storage: Storage | undefined): void {
  try {
    storage?.setItem(INTRO_SESSION_KEY, '1');
  } catch {
    // storage niedostępny – intro po prostu może pokazać się ponownie
  }
}

/**
 * Buduje sekwencję etapów animacji wejściowej bez nakładania się na siebie.
 * Czasy trwania pobierane są z przekazanego obiektu `motion` z tokenów.
 * Jeśli `reducedMotion` jest true, wszystkie czasy trwania i opóźnienia wynoszą 0.
 */
export function buildIntroTimeline({
  reducedMotion,
  motion,
  compact = false,
}: BuildIntroTimelineOptions): TimelineStage[] {
  if (reducedMotion) {
    return [
      { id: 'outline', start: 0, duration: 0 },
      { id: 'fill', start: 0, duration: 0 },
      { id: 'annotate', start: 0, duration: 0 },
    ];
  }

  // floor gwarantuje, że suma etapów nie przekroczy PHONE_DURATION_RATIO × desktop
  const scale = (ms: number) => (compact ? Math.floor(ms * PHONE_DURATION_RATIO) : ms);
  const outlineDuration = scale(motion.drawOutline);
  const fillDuration = scale(motion.base);
  const annotateDuration = scale(motion.slow);

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
