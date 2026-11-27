import { useCallback, useEffect, useRef, useState } from 'react';
import indicatorsData from '../../../config/indicators.json';
import { loadUnits } from '@/core/data/load-atlas-data';
import { loadAnyValues } from '@/core/indicators/load-any-values';
import { peekAvailable } from '@/core/indicators/load-available';
import { resetLibraryCache } from '@/core/library/load-library';
import { buildRegistry } from '@/core/indicators/registry';
import type { Level } from '@/core/facts/types';
import type { Indicator } from '@/core/profile/profile';
import { listView, type ListView } from '@/core/start/discoveries';
import { libraryList } from '@/core/start/library-list';
import { loadGminaSmall } from '@/core/start/load-lists';

const MAIN = indicatorsData as Indicator[];

export type ListStatus = 'loading' | 'ready' | 'failed' | 'empty';

/** Poziom zestawienia liczonego w przeglądarce: wybrany albo „auto” (najgłębszy z danymi, dla wskaźników z biblioteki). */
export type LevelWish = Level | 'auto';

export interface ComputedList {
  status: ListStatus;
  view: ListView | null;
}

/**
 * Zestawienie 5 + 5 liczone w przeglądarce dla wskaźnika i poziomu, których nie ma w gotowych plikach
 * (wskaźnik z biblioteki albo inny poziom niż w zestawieniu redakcyjnym). Wartości pobiera dopiero ten wybór,
 * tak jak zmiana wskaźnika na mapie; wynik zostaje w pamięci na czas wizyty. `null` = nic do liczenia.
 */
export function useLevelList(id: string | null, wish: LevelWish | null) {
  const [cache, setCache] = useState<Record<string, ComputedList>>({});
  const inflight = useRef(new Set<string>());
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => void (alive.current = false);
  }, []);
  const key = id && wish ? `${id}|${wish}` : null;
  const entry = key ? cache[key] : undefined;

  useEffect(() => {
    if (!key || !id || !wish || entry || inflight.current.has(key)) return;
    inflight.current.add(key);
    const done = (value: ComputedList) => {
      inflight.current.delete(key);
      if (alive.current) setCache((c) => ({ ...c, [key]: value }));
    };
    void (async () => {
      try {
        const ind = buildRegistry(MAIN, peekAvailable() ?? null).byId.get(id);
        const [units, small] = await Promise.all([loadUnits(), loadGminaSmall()]);
        const values = await loadAnyValues(id, { units });
        if (!ind || !values) return done({ status: 'failed', view: null });
        const list = libraryList({ indicator: { id, name: ind.name, unit: ind.unit }, values, units, small, ...(wish === 'auto' ? {} : { level: wish }) });
        const view = list && listView(list);
        done(view ? { status: 'ready', view } : { status: 'empty', view: null });
      } catch {
        done({ status: 'failed', view: null });
      }
    })();
  }, [key, id, wish, entry]);

  /** Ponowienie po błędzie: loader biblioteki pamięta także nieudane pobranie, więc czyścimy jego pamięć. */
  const retry = useCallback(() => {
    if (!key) return;
    resetLibraryCache();
    setCache((c) => {
      const next = { ...c };
      delete next[key];
      return next;
    });
  }, [key]);

  const result: ComputedList | null = key ? (entry ?? { status: 'loading', view: null }) : null;
  return { result, retry };
}
