// Kolejka odroczeń: zadania zgłoszone w trakcie ruchu mapy czekają, aż ruch ustanie.

export interface DeferQueueOptions {
  settleMs?: number;
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (handle: unknown) => void;
}

export function createDeferQueue(opts: DeferQueueOptions = {}) {
  const {
    settleMs = 120,
    setTimer = (fn, ms) => setTimeout(fn, ms),
    clearTimer = (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
  } = opts;
  // Map zachowuje kolejność pierwszego zgłoszenia klucza; nowsze zadanie zastępuje starsze.
  const tasks = new Map<string, () => void>();
  let moving = false;
  let timer: unknown = null;

  const flush = () => {
    timer = null;
    const batch = [...tasks.values()];
    tasks.clear();
    for (const task of batch) {
      try {
        task();
      } catch {
        // błąd jednego zadania nie blokuje pozostałych
      }
    }
  };

  return {
    setMoving(next: boolean): void {
      moving = next;
      if (timer !== null) {
        clearTimer(timer);
        timer = null;
      }
      if (!next && tasks.size > 0) timer = setTimer(flush, settleMs);
    },
    run(key: string, task: () => void): void {
      if (!moving) {
        try {
          task();
        } catch {
          // jak wyżej: wyjątek nie wychodzi poza kolejkę
        }
        return;
      }
      tasks.set(key, task);
    },
    pending: (): number => tasks.size,
  };
}
