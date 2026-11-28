import { useEffect, useState } from 'react';
import { parseKalendarium } from '@/core/calendar/days';
import { KALENDARIUM_DATA_URL } from '@/core/calendar/source';
import type { KalendariumDni } from '@/core/calendar/types';

export type KalendariumState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: KalendariumDni };

/** Pobiera mały plik dni jeden raz; błąd sieci albo zły kształt = stan `error` (strona pokazuje komunikat). */
export function useKalendarium(): KalendariumState {
  const [state, setState] = useState<KalendariumState>({ status: 'loading' });
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(KALENDARIUM_DATA_URL, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((raw) => {
        const data = parseKalendarium(raw);
        setState(data ? { status: 'ready', data } : { status: 'error' });
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setState({ status: 'error' });
      });
    return () => ctrl.abort();
  }, []);
  return state;
}
