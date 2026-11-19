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

import { useMyIndicators as useHook } from '../../src/view/hooks/useMyIndicators';
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


describe('useMyIndicators.move (PX01)', () => {
  let store: Map<string, string>;
  beforeEach(() => {
    store = new Map();
    const noop = () => {};
    vi.stubGlobal('window', { addEventListener: noop, removeEventListener: noop, dispatchEvent: () => true });
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    });
    vi.stubGlobal('CustomEvent', class { constructor(public type: string, init?: { detail?: unknown }) { this.detail = init?.detail; } detail: unknown; });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('zamienia z poprzednikiem i zapisuje w pamięci przeglądarki', () => {
    const m = mount();
    m.api.move('density', -1);
    expect(m.api.list.slice(0, 2)).toEqual(['density', 'population']);
    expect(JSON.parse(store.get(MY_INDICATORS_KEY)!).slice(0, 2)).toEqual(['density', 'population']);
  });
  it('pierwszy w górę i ostatni w dół nic nie zmieniają (ta sama referencja)', () => {
    const m = mount();
    const before = m.api.list;
    m.api.move(before[0], -1);
    m.api.move(before[before.length - 1], 1);
    expect(m.api.list).toBe(before);
  });
  it('steps przesuwa o kilka miejsc (pomija ukryte wskaźniki)', () => {
    const m = mount();
    m.api.move('population', 1, 2);
    expect(m.api.list.slice(0, 3)).toEqual(['density', 'natural-increase', 'population']);
  });
});
