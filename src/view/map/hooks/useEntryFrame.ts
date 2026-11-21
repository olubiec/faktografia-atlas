import { useCallback, useRef, type RefObject } from 'react';
import { entryViewState } from '@/core/map/entry-frame';
import { takeEntry, type Entry } from '@/core/map/entry-handoff';
import type { ViewState } from '@/core/map/view';
import { posterRect } from '@/core/start/poster-frame';

/**
 * Wejście ze strony `/`: mapa startuje w kadrze plakatu (`entryView`), a po gotowości
 * kamera płynnie dojeżdża do zwykłego widoku (`finishEntry`). Bez wejścia hook nic nie robi.
 */
export function useEntryFrame(
  containerRef: RefObject<HTMLElement | null>,
  userMovedRef: RefObject<boolean>,
  animateToView: (target: ViewState, kind: 'in') => void
) {
  // Wejście czytamy raz (odczyt je kasuje); owijka pozwala odróżnić „jeszcze nie czytano” od „brak wejścia”.
  const holderRef = useRef<{ entry: Entry | null; pending: boolean } | null>(null);
  if (holderRef.current === null) {
    const entry = takeEntry();
    holderRef.current = { entry, pending: entry !== null };
  }
  const liveTargetRef = useRef<ViewState | null>(null);

  /** Kadr plakatu przeliczony na bieżący kontener mapy; null, gdy nie ma wejścia (albo już się skończyło). */
  const entryView = useCallback((): ViewState | null => {
    const holder = holderRef.current;
    const entry = holder?.entry;
    const el = containerRef.current;
    if (!entry || !el || !holder?.pending) return null;
    const r = el.getBoundingClientRect();
    const poster = posterRect(entry.bbox, entry.viewport.width, entry.viewport.height);
    return entryViewState(entry.bbox, poster, { left: r.left, top: r.top, width: r.width, height: r.height });
  }, [containerRef]);

  /** Mapa gotowa: dojazd z kadru plakatu do zwykłego widoku (bez ruchu przy reduced-motion robi to animateToView). */
  const finishEntry = useCallback(() => {
    const holder = holderRef.current;
    if (!holder?.pending) return;
    holder.pending = false;
    const target = liveTargetRef.current;
    if (target && !userMovedRef.current) animateToView(target, 'in');
  }, [animateToView, userMovedRef]);

  return { entryView, liveTargetRef, finishEntry };
}
