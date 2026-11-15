import { useEffect } from 'react';
import type { SetStateAction } from 'react';
import { nextZoom, type ZoomLimits } from '@/core/map/zoom-step';

type ZoomState = { zoom: number };

type Options<T extends ZoomState> = {
  setCurrentViewState: (action: SetStateAction<T>) => void;
  limits: ZoomLimits;
  markUserMoved: () => void;
};

/** Nasłuch `atlas:zoom` (+/- z dowolnego miejsca strony): jeden krok zoomu mapy. */
export function useZoomEvents<T extends ZoomState>({ setCurrentViewState, limits, markUserMoved }: Options<T>): void {
  const { minZoom, maxZoom } = limits;
  useEffect(() => {
    const onZoom = (e: Event) => {
      const delta = (e as CustomEvent<{ delta?: unknown }>).detail?.delta;
      if (delta !== 1 && delta !== -1) return;
      markUserMoved();
      setCurrentViewState((prev) => ({ ...prev, zoom: nextZoom(prev.zoom, delta, { minZoom, maxZoom }) }));
    };
    window.addEventListener('atlas:zoom', onZoom);
    return () => window.removeEventListener('atlas:zoom', onZoom);
  }, [setCurrentViewState, minZoom, maxZoom, markUserMoved]);
}
