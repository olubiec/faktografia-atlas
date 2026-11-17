import { useCallback, useState } from 'react';
import {
  addIndicator,
  removeIndicator,
  resetToBasic,
  type MyIndicators,
} from '../../core/my-indicators/my-indicators';
import { loadMyIndicators, saveMyIndicators } from '../../core/my-indicators/storage';

/** Lista „Moje wskaźniki” z zapisem w pamięci przeglądarki. */
export function useMyIndicators() {
  const [list, setList] = useState<MyIndicators>(() => loadMyIndicators());

  const update = useCallback((fn: (prev: MyIndicators) => MyIndicators) => {
    setList((prev) => {
      const next = fn(prev);
      if (next !== prev) saveMyIndicators(next);
      return next;
    });
  }, []);

  const add = useCallback((id: string) => update((l) => addIndicator(l, id)), [update]);
  const remove = useCallback((id: string) => update((l) => removeIndicator(l, id)), [update]);
  const reset = useCallback(() => update(() => resetToBasic()), [update]);

  return { list, add, remove, reset };
}
