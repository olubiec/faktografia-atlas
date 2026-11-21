import { useEffect, useMemo, useState } from 'react';
import indicatorsData from '../../../config/indicators.json';
import { buildCatalogTree, type CatalogTree } from '@/core/catalog/tree';
import { loadAvailable, peekAvailable } from '@/core/indicators/load-available';
import type { AvailableFile } from '@/core/indicators/registry';
import type { Indicator } from '@/core/profile/profile';

const MAIN = indicatorsData as Indicator[];

export type CatalogState = {
  tree: CatalogTree;
  /** true, dopóki lekki spis (available.json) się wczytuje. */
  loading: boolean;
  /** true, gdy spisu nie udało się pobrać (w menu są tylko wskaźniki wbudowane). */
  failed: boolean;
};

/**
 * Drzewo wyboru danych: wbudowane + spis pobranych (jedno żądanie available.json, zapamiętane
 * w loaderze; pełnego index.json nigdy nie pobieramy).
 */
export function useCatalog(): CatalogState {
  const [state, setState] = useState<{ done: boolean; available: AvailableFile | null }>(() => {
    const peeked = peekAvailable();
    return { done: peeked !== undefined, available: peeked ?? null };
  });

  useEffect(() => {
    if (state.done) return;
    let cancelled = false;
    loadAvailable().then((available) => {
      if (!cancelled) setState({ done: true, available });
    });
    return () => {
      cancelled = true;
    };
  }, [state.done]);

  const tree = useMemo(() => buildCatalogTree(MAIN, state.available), [state.available]);
  return { tree, loading: !state.done, failed: state.done && state.available === null };
}
