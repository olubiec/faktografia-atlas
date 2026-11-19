import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Minimalny silnik hooków z wieloma instancjami (środowisko testów to node, bez DOM).
const h = vi.hoisted(() => {
  type Slot = { v?: unknown; deps?: unknown[]; cleanup?: (() => void) | void };
  type Inst = { slots: Slot[]; effects: Array<() => void>; run: () => void };
  return { cur: null as unknown as Inst, idx: 0 };
});

vi.mock('react', () => {
  const same = (a?: unknown[], b?: unknown[]) =>
    !!a && !!b && a.length === b.length && a.every((x, i) => Object.is(x, b[i]));
  return {
    useState: (init: unknown) => {
      const inst = h.cur;
      const i = h.idx++;
      if (!(i in inst.slots)) inst.slots[i] = { v: typeof init === 'function' ? (init as () => unknown)() : init };
      const slot = inst.slots[i];
      return [
        slot.v,
        (n: unknown) => {
          if (Object.is(n, slot.v)) return;
          slot.v = n;
          inst.run();
        },
      ];
    },
    useRef: (init: unknown) => {
      const i = h.idx++;
      if (!(i in h.cur.slots)) h.cur.slots[i] = { v: { current: init } };
      return h.cur.slots[i].v;
    },
    useCallback: (fn: unknown) => fn,
    useEffect: (fn: () => (() => void) | void, deps: unknown[]) => {
      const inst = h.cur;
      const i = h.idx++;
      const slot = inst.slots[i];
      if (slot && same(slot.deps, deps)) return;
      inst.slots[i] = { deps: undefined };
      inst.effects.push(() => {
        inst.slots[i] = { deps, cleanup: fn() };
      });
    },
  };
});

import { useMyIndicators as useHook, MY_INDICATORS_EVENT } from '../../src/view/hooks/useMyIndicators';
import { MY_INDICATORS_KEY } from '../../src/core/my-indicators/storage';

type Api = ReturnType<typeof useHook>;

function mount() {
  const inst = {
    slots: [] as { cleanup?: (() => void) | void }[],
    effects: [] as Array<() => void>,
    run: () => {},
    api: null as unknown as Api,
  };
  // Nazwa z „use”, żeby reguła hooków uznała wywołanie za dozwolone.
  inst.run = function useRender() {
    h.cur = inst as never;
    h.idx = 0;
    inst.api = useHook();
    const pending = inst.effects.splice(0);
    pending.forEach((e) => e());
  };
  inst.run();
  return {
    get api() {
      return inst.api;
    },
    unmount: () => inst.slots.forEach((s) => s?.cleanup?.()),
  };
}

// Prosty window z nasłuchem i licznikiem słuchaczy.
class FakeWindow {
  listeners = new Map<string, Set<(e: unknown) => void>>();
  addEventListener(t: string, fn: (e: unknown) => void) {
    if (!this.listeners.has(t)) this.listeners.set(t, new Set());
    this.listeners.get(t)!.add(fn);
  }
  removeEventListener(t: string, fn: (e: unknown) => void) {
    this.listeners.get(t)?.delete(fn);
  }
  dispatchEvent(e: { type: string }) {
    [...(this.listeners.get(e.type) ?? [])].forEach((fn) => fn(e));
    return true;
  }
  count() {
    return [...this.listeners.values()].reduce((n, s) => n + s.size, 0);
  }
}

describe('useMyIndicators – wspólny stan (QS07)', () => {
  let win: FakeWindow;
  let store: Map<string, string>;

  beforeEach(() => {
    win = new FakeWindow();
    store = new Map();
    vi.stubGlobal('window', win);
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    });
    vi.stubGlobal(
      'CustomEvent',
      class {
        constructor(
          public type: string,
          init?: { detail?: unknown },
        ) {
          this.detail = init?.detail;
        }
        detail: unknown;
      },
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('add w jednej instancji zmienia list w drugiej', () => {
    const a = mount();
    const b = mount();
    a.api.add('nowy-wskaznik-test');
    expect(a.api.list).toContain('nowy-wskaznik-test');
    expect(b.api.list).toContain('nowy-wskaznik-test');
    expect(b.api.list).toEqual(a.api.list);
    b.api.remove('nowy-wskaznik-test');
    expect(a.api.list).not.toContain('nowy-wskaznik-test');
  });

  it('zdarzenie storage odświeża listę', () => {
    const a = mount();
    store.set(MY_INDICATORS_KEY, JSON.stringify(['x1', 'x2']));
    win.dispatchEvent({ type: 'storage', key: MY_INDICATORS_KEY } as never);
    expect(a.api.list).toEqual(['x1', 'x2']);
    // zdarzenie dotyczące innego klucza jest ignorowane
    store.set(MY_INDICATORS_KEY, JSON.stringify(['y']));
    win.dispatchEvent({ type: 'storage', key: 'inny' } as never);
    expect(a.api.list).toEqual(['x1', 'x2']);
  });

  it('po odmontowaniu nasłuch jest zdjęty', () => {
    const a = mount();
    expect(win.count()).toBe(2);
    expect(win.listeners.get(MY_INDICATORS_EVENT)?.size).toBe(1);
    a.unmount();
    expect(win.count()).toBe(0);
  });
});
