import { useEffect, useState } from 'react';
import { buildProfile, type ProfileIndicatorItem } from '@/core/profile/profile';
import { loadAnyValues } from '@/core/indicators/load-any-values';
import type { Unit } from '@/core/units/types';
import { useIndicatorRegistry } from '@/view/hooks/useIndicatorRegistry';

/**
 * Wiersze profilu dla dodanych przez użytkownika wskaźników (także z biblioteki GUS, których
 * nie ma w pliku profilu): pobiera wartości wskaźnika i liczy wiersz dla jednostki.
 * Wskaźnik bez danych dla tego miejsca wraca jako wiersz z pustą wartością (nie znika po cichu).
 */
export function useExtraItems(teryt: string, ids: string[], units: Unit[], skip: Set<string>) {
  const { registry } = useIndicatorRegistry();
  const [loaded, setLoaded] = useState<Record<string, ProfileIndicatorItem>>({});

  const key = ids.filter((id) => !skip.has(id)).join(',');
  useEffect(() => {
    let cancelled = false;
    for (const id of key ? key.split(',') : []) {
      const indicator = registry.byId.get(id);
      if (!indicator) continue;
      const cacheKey = `${teryt}|${id}`;
      void loadAnyValues(id, { units, levels: registry.levels.get(id) }).then((values) => {
        if (cancelled || !values) return;
        const item = buildProfile(teryt, [indicator], { [id]: values }, units).indicators[0];
        if (item) setLoaded((prev) => ({ ...prev, [cacheKey]: item }));
      });
    }
    return () => {
      cancelled = true;
    };
  }, [key, teryt, units, registry]);

  return ids
    .map((id) => loaded[`${teryt}|${id}`])
    .filter((i): i is ProfileIndicatorItem => Boolean(i));
}
