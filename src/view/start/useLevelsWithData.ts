import { useEffect, useState } from 'react';
import indicatorsData from '../../../config/indicators.json';
import { loadUnits } from '@/core/data/load-atlas-data';
import type { Level } from '@/core/facts/types';
import { loadAnyValues } from '@/core/indicators/load-any-values';
import { peekAvailable } from '@/core/indicators/load-available';
import { sharedRegistry } from '@/core/indicators/shared-registry';
import type { Indicator } from '@/core/profile/profile';
import { libraryList } from '@/core/start/library-list';
import { loadGminaSmall } from '@/core/start/load-lists';

const MAIN = indicatorsData as Indicator[];
const LEVELS: Level[] = ['woj', 'pow', 'gmi'];

/**
 * Poziomy, na których wskaźnik ma dość danych na zestawienie (te same reguły co samo zestawienie).
 * Spis GUS bywa łaskawszy niż rzeczywiste wartości, więc przycisk poziomu bez danych ma być nieklikalny.
 * `null` = jeszcze nie wiadomo (albo nie udało się sprawdzić) – wtedy nic nie blokujemy.
 */
export function useLevelsWithData(id: string | null, enabled: boolean): { id: string; levels: Level[] } | null {
  const [found, setFound] = useState<{ id: string; levels: Level[] } | null>(null);
  useEffect(() => {
    if (!id || !enabled) return;
    let cancelled = false;
    void (async () => {
      try {
        const ind = sharedRegistry(MAIN, peekAvailable() ?? null).byId.get(id);
        const [units, small] = await Promise.all([loadUnits(), loadGminaSmall()]);
        const values = await loadAnyValues(id, { units });
        if (!ind || !values) return;
        const levels = LEVELS.filter(
          (level) => libraryList({ indicator: { id, name: ind.name, unit: ind.unit }, values, units, small, level }) !== null,
        );
        if (!cancelled) setFound({ id, levels });
      } catch {
        // Bez sprawdzenia przyciski zostają według spisu; panel pokaże komunikat, jeśli danych brak.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, enabled]);
  return found && found.id === id ? found : null;
}
