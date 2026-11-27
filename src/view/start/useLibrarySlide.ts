import { useCallback, useEffect, useRef, useState } from 'react';
import indicatorsData from '../../../config/indicators.json';
import { loadUnits } from '@/core/data/load-atlas-data';
import { loadAnyValues } from '@/core/indicators/load-any-values';
import { peekAvailable } from '@/core/indicators/load-available';
import { resetLibraryCache } from '@/core/library/load-library';
import { buildRegistry } from '@/core/indicators/registry';
import type { Indicator } from '@/core/profile/profile';
import { listView, mapHref, type ListView } from '@/core/start/discoveries';
import { libraryList } from '@/core/start/library-list';
import { loadGminaSmall } from '@/core/start/load-lists';
import { shortIndicatorName } from '@/core/seo/sentences';

const MAIN = indicatorsData as Indicator[];

export type LibraryStatus = 'loading' | 'ready' | 'failed' | 'empty';

export interface LibrarySlide {
  id: string;
  view: ListView;
  status: LibraryStatus;
}

/**
 * Wskaźnik wybrany w „Więcej danych”: pobiera jednostki i wartości dopiero po wyborze (jak zmiana wskaźnika na mapie),
 * liczy 5 + 5 i oddaje gotowy widok zestawienia. Na końcu paska jest najwyżej jeden taki slajd – nowy wybór zastępuje poprzedni.
 */
export function useLibrarySlide() {
  const [slide, setSlide] = useState<LibrarySlide | null>(null);
  const request = useRef(0);
  const alive = useRef(true);
  useEffect(() => () => void (alive.current = false), []);

  const load = useCallback(async (id: string, base: ListView) => {
    const mine = ++request.current;
    const done = (status: LibraryStatus, view = base) => alive.current && mine === request.current && setSlide({ id, view, status });
    setSlide({ id, view: base, status: 'loading' });
    try {
      const ind = buildRegistry(MAIN, peekAvailable() ?? null).byId.get(id);
      const [units, small] = await Promise.all([loadUnits(), loadGminaSmall()]);
      const values = await loadAnyValues(id, { units });
      if (!ind || !values) return done('failed');
      const list = libraryList({ indicator: { id, name: ind.name, unit: ind.unit }, values, units, small });
      const view = list && listView(list);
      // Klucz slajdu stały od wyboru do wyniku (aktywny slajd karuzeli jest zapamiętany po kluczu).
      done(view ? 'ready' : 'empty', view ? { ...view, key: base.key } : base);
    } catch {
      done('failed');
    }
  }, []);

  /** Wybór wskaźnika z menu; null, gdy wskaźnika nie ma w rejestrze (nic się nie dzieje). */
  const pick = useCallback(
    (id: string) => {
      const ind = buildRegistry(MAIN, peekAvailable() ?? null).byId.get(id);
      if (!ind) return;
      const title = shortIndicatorName(ind.name, ind.unit);
      void load(id, { key: `library-${id}`, title, subtitle: '', rows: [], href: mapHref({ indicatorId: id }) });
    },
    [load],
  );

  // Loader biblioteki zapamiętuje także nieudane pobranie, więc przed ponowieniem czyścimy jego pamięć.
  const retry = useCallback(() => {
    if (!slide) return;
    resetLibraryCache();
    void load(slide.id, slide.view);
  }, [load, slide]);
  return { slide, pick, retry };
}
