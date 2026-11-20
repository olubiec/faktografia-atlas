// Ładowanie wartości wskaźników zestawu: jedno żądanie na wskaźnik, statusy, bezpieczne odmontowanie.
import type { IndicatorValues } from '@/core/profile/profile';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';
export type LoadFn = (id: string) => Promise<IndicatorValues | null>;

export type ValueLoader = {
  request(ids: Iterable<string>): void;
  values(): Map<string, IndicatorValues>;
  statuses(): Map<string, LoadStatus>;
  dispose(): void;
};

export function createValueLoader(opts: {
  load: LoadFn;
  initialValues: Map<string, IndicatorValues>;
  onChange: () => void;
}): ValueLoader {
  const vals = new Map(opts.initialValues);
  const stat = new Map<string, LoadStatus>();
  for (const id of vals.keys()) stat.set(id, 'ready');
  let disposed = false;

  const finish = (id: string, status: LoadStatus, v?: IndicatorValues | null) => {
    if (disposed) return;
    if (v) vals.set(id, v);
    stat.set(id, status);
    opts.onChange();
  };

  return {
    request(ids) {
      let started = false;
      for (const id of ids) {
        // Strażnik: status ≠ idle oznacza, że wskaźnik był już zamówiony – nie ponawiamy.
        if (disposed || vals.has(id) || (stat.get(id) ?? 'idle') !== 'idle') continue;
        stat.set(id, 'loading');
        started = true;
        Promise.resolve()
          .then(() => opts.load(id))
          .then(
            (v) => finish(id, v ? 'ready' : 'error', v),
            () => finish(id, 'error')
          );
      }
      if (started) opts.onChange();
    },
    values: () => new Map(vals),
    statuses: () => new Map(stat),
    dispose() {
      disposed = true;
    },
  };
}
