import { useEffect, useMemo, useState } from 'react';
import type { Indicator } from '@/core/profile/profile';
import { loadAvailable, peekAvailable } from '@/core/indicators/load-available';
import { buildRegistry, type AvailableFile, type Registry } from '@/core/indicators/registry';
import indicatorsData from '../../../config/indicators.json';

const MAIN_INDICATORS = indicatorsData as Indicator[];

export type IndicatorRegistryState = {
  registry: Registry;
  /** true, gdy spis (available.json) jest już wczytany albo pewnie go nie będzie (404/błąd). */
  ready: boolean;
};

/**
 * Ładuje spis pobranych wskaźników raz (cache w loaderze) i buduje wspólny rejestr.
 * Przed wczytaniem rejestr = tylko wskaźniki główne; brak spisu = też tylko główne, ale `ready`.
 */
export function useIndicatorRegistry(): IndicatorRegistryState {
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

  const registry = useMemo(() => buildRegistry(MAIN_INDICATORS, state.available), [state.available]);
  return { registry, ready: state.done };
}
