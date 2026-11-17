import { useEffect, type MutableRefObject } from 'react';
import type { ViewState } from '@/core/map/view';
import { ZOOM_END_DELAY_MS, ZOOM_END_EVENT } from '@/core/map/zoom-level';

// Koniec ruchu z gestu (szczypanie, kółko, +/−, strzałki): zgłaszamy zoom, żeby poziom mapy poszedł za nim.
// Lot kamery po kliknięciu jednostki (animateToView) zeruje userMovedRef, więc go nie zgłaszamy.
export function useZoomEndReport(
  viewState: ViewState,
  userMovedRef: MutableRefObject<boolean>,
  isAnimatingRef: MutableRefObject<boolean>
) {
  useEffect(() => {
    if (!userMovedRef.current || isAnimatingRef.current) return;
    const zoom = viewState.zoom;
    const timer = window.setTimeout(() => {
      if (!userMovedRef.current || isAnimatingRef.current) return;
      window.dispatchEvent(new CustomEvent(ZOOM_END_EVENT, { detail: { zoom } }));
    }, ZOOM_END_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [viewState, userMovedRef, isAnimatingRef]);
}
