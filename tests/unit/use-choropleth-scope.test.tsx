import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Minimalny silnik hooków (środowisko testów to node, bez DOM i bez renderHook).
const h = vi.hoisted(() => {
  type Slot = { v?: unknown; deps?: unknown[]; cleanup?: (() => void) | void };
  const e = {
    slots: [] as Slot[],
    idx: 0,
    effects: [] as Array<() => void>,
    rerender: () => {},
  };
  return e;
});

vi.mock('react', () => {
  const same = (a?: unknown[], b?: unknown[]) =>
    !!a && !!b && a.length === b.length && a.every((x, i) => Object.is(x, b[i]));
  return {
    useState: (init: unknown) => {
      const i = h.idx++;
      if (!(i in h.slots)) h.slots[i] = { v: typeof init === 'function' ? (init as () => unknown)() : init };
      const slot = h.slots[i];
      return [
        slot.v,
        (n: unknown) => {
          const next = typeof n === 'function' ? (n as (p: unknown) => unknown)(slot.v) : n;
          if (Object.is(next, slot.v)) return;
          slot.v = next;
          h.rerender();
        },
      ];
    },
    useRef: (init: unknown) => {
      const i = h.idx++;
      if (!(i in h.slots)) h.slots[i] = { v: { current: init } };
      return h.slots[i].v;
    },
    useMemo: (fn: () => unknown, deps: unknown[]) => {
      const i = h.idx++;
      const slot = h.slots[i];
      if (slot && same(slot.deps, deps)) return slot.v;
      h.slots[i] = { v: fn(), deps };
      return h.slots[i].v;
    },
    useEffect: (fn: () => (() => void) | void, deps: unknown[]) => {
      const i = h.idx++;
      const slot = h.slots[i];
      if (slot && same(slot.deps, deps)) return;
      h.effects.push(() => {
        if (slot) slot.cleanup?.();
        const cleanup = fn();
        h.slots[i] = { ...(h.slots[i] ?? {}), deps, cleanup };
      });
      if (!slot) h.slots[i] = { deps: undefined };
    },
  };
});

import { useChoropleth, type ChoroplethData } from '../../src/view/map/hooks/useChoropleth';
import type { Unit } from '../../src/core/units/types';

const units = [
  { teryt: '12', level: 'woj', centroid: [20, 50] },
  { teryt: '1201', level: 'pow', centroid: [20.1, 50.1] },
  { teryt: '1203', level: 'pow', centroid: [20.2, 50.2] },
  { teryt: '14', level: 'woj', centroid: [21, 52] },
  { teryt: '1465', level: 'pow', centroid: [21.1, 52.1] },
] as unknown as Unit[];

const view = {
  indicator: { id: 'ind' },
  values: { indicatorId: 'ind', years: [2020], values: {}, fetchedAt: '' },
  year: 2020,
  level: 'pow',
} as never;

const out: { data: ChoroplethData | null } = { data: null };
let current: { sel: string | null };

function mount(sel: string | null) {
  current = { sel };
  h.slots = [];
  h.idx = 0;
  h.effects = [];
  let busy = false;
  function Probe() {
    return useChoropleth(view, units, current.sel);
  }
  const run = () => {
    if (busy) return;
    busy = true;
    do {
      h.idx = 0;
      out.data = Probe();
      const fx = h.effects;
      h.effects = [];
      fx.forEach((f) => f());
    } while (h.effects.length > 0);
    busy = false;
  };
  h.rerender = run;
  run();
  return {
    setSel(s: string | null) {
      current = { sel: s };
      run();
    },
  };
}

describe('useChoropleth: zakres z selectedTeryt', () => {
  let raf: ReturnType<typeof vi.fn<() => number>>;

  beforeEach(() => {
    vi.useFakeTimers();
    raf = vi.fn<() => number>(() => 1);
    vi.stubGlobal('requestAnimationFrame', raf);
    vi.stubGlobal('cancelAnimationFrame', vi.fn<() => void>());
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('nie uruchamia setInterval co 100 ms po zamontowaniu', () => {
    const spy = vi.spyOn(globalThis, 'setInterval');
    mount(null);
    expect(spy.mock.calls.filter((c) => c[1] === 100)).toHaveLength(0);
    vi.advanceTimersByTime(1000);
    expect(spy.mock.calls.filter((c) => c[1] === 100)).toHaveLength(0);
  });

  it('zmiana selectedTeryt null -> 12 -> 1201 zmienia activeScope', () => {
    const m = mount(null);
    expect(out.data?.activeScope.activeWojTeryt).toBeNull();
    m.setSel('12');
    expect(out.data?.activeScope).toMatchObject({ activeWojTeryt: '12', activePowTeryt: null });
    m.setSel('1201');
    expect(out.data?.activeScope).toMatchObject({ activeWojTeryt: '12', activePowTeryt: '1201' });
  });

  it('reveal startuje dokładnie raz na zmianę zakresu', () => {
    const m = mount(null);
    expect(raf).toHaveBeenCalledTimes(0);
    m.setSel('12');
    expect(raf).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1000);
    expect(raf).toHaveBeenCalledTimes(1);
    m.setSel('1201');
    expect(raf).toHaveBeenCalledTimes(2);
  });

  it('zmiana selectedTeryt w tym samym zakresie nie restartuje reveal', () => {
    const m = mount('120101');
    m.setSel('120102');
    expect(out.data?.activeScope).toMatchObject({ activeWojTeryt: '12', activePowTeryt: '1201' });
    expect(raf).toHaveBeenCalledTimes(0);
  });
});
