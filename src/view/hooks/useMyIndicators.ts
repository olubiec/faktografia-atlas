import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addIndicator,
  removeIndicator,
  resetToBasic,
  type MyIndicators,
} from '../../core/my-indicators/my-indicators';
import {
  loadMyIndicators,
  MY_INDICATORS_KEY,
  saveMyIndicators,
} from '../../core/my-indicators/storage';

/** Zdarzenie okna wysyłane po zapisie: informuje inne instancje hooka w tej samej karcie. */
export const MY_INDICATORS_EVENT = 'faktografia:my-indicators-changed';

const sameList = (a: MyIndicators, b: MyIndicators) =>
  a.length === b.length && a.every((id, i) => id === b[i]);

/** Lista „Moje wskaźniki” z zapisem w pamięci przeglądarki, wspólna dla wszystkich instancji hooka. */
export function useMyIndicators() {
  const [list, setList] = useState<MyIndicators>(() => loadMyIndicators());
  const ref = useRef<MyIndicators>(list);

  const update = useCallback((fn: (prev: MyIndicators) => MyIndicators) => {
    const prev = ref.current;
    const next = fn(prev);
    if (next === prev) return;
    ref.current = next;
    setList(next);
    saveMyIndicators(next);
    // Lista w szczegółach zdarzenia: działa też, gdy zapis w przeglądarce jest zablokowany.
    window.dispatchEvent(new CustomEvent<MyIndicators>(MY_INDICATORS_EVENT, { detail: next }));
  }, []);

  useEffect(() => {
    const apply = (next: MyIndicators) => {
      if (sameList(next, ref.current)) return;
      ref.current = next;
      setList(next);
    };
    const onChanged = (e: Event) => {
      const detail = (e as CustomEvent<MyIndicators>).detail;
      apply(Array.isArray(detail) ? detail : loadMyIndicators());
    };
    // Zdarzenie „storage” przychodzi z innych kart; key === null to wyczyszczenie całej pamięci.
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === MY_INDICATORS_KEY) apply(loadMyIndicators());
    };
    window.addEventListener(MY_INDICATORS_EVENT, onChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(MY_INDICATORS_EVENT, onChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const add = useCallback((id: string) => update((l) => addIndicator(l, id)), [update]);
  const remove = useCallback((id: string) => update((l) => removeIndicator(l, id)), [update]);
  const reset = useCallback(() => update(() => resetToBasic()), [update]);

  return { list, add, remove, reset };
}
