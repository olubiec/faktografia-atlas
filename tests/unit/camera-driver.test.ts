import { describe, expect, it } from "vitest";
import { createCameraDriver } from "../../src/core/map/camera-driver";
import { sampleCamera, type CameraPlan } from "../../src/core/map/camera-plan";
import type { ViewState } from "../../src/core/map/view";

const A: ViewState = { longitude: 19, latitude: 52, zoom: 5.5 };
const B: ViewState = { longitude: 21, latitude: 50, zoom: 9 };
const plan: CameraPlan = { from: A, to: B, durationMs: 600 };

function setup() {
  let t = 0;
  let pending: (() => void) | null = null;
  let scheduled = 0;
  const jumps: ViewState[] = [];
  const map = {
    jumpTo: (v: ViewState) => void jumps.push(v),
    getView: () => A,
    getViewportWidthPx: () => 1000,
  };
  let frames = 0;
  let ends = 0;
  const driver = createCameraDriver({
    map,
    clock: {
      now: () => t,
      schedule: (cb) => {
        scheduled += 1;
        pending = cb;
      },
    },
    onFrame: () => void (frames += 1),
    onEnd: () => void (ends += 1),
  });
  const step = (dt: number) => {
    t += dt;
    const cb = pending;
    pending = null;
    cb?.();
  };
  return {
    driver,
    jumps,
    step,
    stats: () => ({ frames, ends, scheduled, pending: pending !== null }),
  };
}

describe("camera-driver", () => {
  it("60 klatek: ≥ 50 jumpTo, ostatni = plan.to, potem cisza", () => {
    const s = setup();
    // Plan 900 ms (górna klamra) = ok. 54 klatek przy 16,7 ms.
    s.driver.start({ ...plan, durationMs: 900 });
    for (let i = 0; i < 60; i++) s.step(16.7);
    expect(s.jumps.length).toBeGreaterThanOrEqual(50);
    expect(s.jumps.at(-1)).toEqual(B);
    expect(s.driver.isAnimating()).toBe(false);
    const before = s.stats().scheduled;
    s.step(16.7);
    expect(s.stats().scheduled).toBe(before);
    expect(s.stats().pending).toBe(false);
  });

  it("zacięcie: klatka po 300 ms daje pozycję z krzywej", () => {
    const s = setup();
    s.driver.start(plan);
    s.step(300);
    expect(s.jumps[0]).toEqual(sampleCamera(plan, 300));
  });

  it("cancel w środku zatrzymuje wywołania i zachowuje ostatni widok", () => {
    const s = setup();
    s.driver.start(plan);
    s.step(100);
    s.step(100);
    const count = s.jumps.length;
    const last = s.jumps.at(-1);
    s.driver.cancel();
    s.step(100);
    expect(s.jumps.length).toBe(count);
    expect(s.driver.isAnimating()).toBe(false);
    expect(s.driver.getCurrent()).toEqual(last);
  });

  it("retarget w locie: brak skoku i koniec na nowym celu", () => {
    const s = setup();
    s.driver.start(plan);
    s.step(250);
    const prev = s.jumps.at(-1)!;
    const target: ViewState = { longitude: 15, latitude: 54, zoom: 6 };
    s.driver.retarget(target);
    s.step(16.7);
    const next = s.jumps.at(-1)!;
    expect(Math.abs(next.zoom - prev.zoom)).toBeLessThanOrEqual(0.25);
    const widthDeg = 360 / 2 ** prev.zoom;
    expect(Math.abs(next.longitude - prev.longitude)).toBeLessThanOrEqual(
      0.08 * widthDeg,
    );
    for (let i = 0; i < 80; i++) s.step(16.7);
    expect(s.jumps.at(-1)).toEqual(target);
    expect(s.driver.isAnimating()).toBe(false);
  });

  it("onFrame co klatkę, onEnd raz", () => {
    const s = setup();
    s.driver.start(plan);
    for (let i = 0; i < 60; i++) s.step(16.7);
    expect(s.stats().frames).toBe(s.jumps.length);
    expect(s.stats().ends).toBe(1);
  });

  it("opcje sterownika to tylko map, clock, onFrame, onEnd (bez settera)", () => {
    const keys: (keyof Parameters<typeof createCameraDriver>[0])[] = [
      "map",
      "clock",
      "onFrame",
      "onEnd",
    ];
    expect(keys).toHaveLength(4);
    // Kompilator odrzuca dodatkowe pole (np. setState) w literale opcji.
    createCameraDriver({
      map: { jumpTo() {}, getView: () => A },
      clock: { now: () => 0, schedule() {} },
      // @ts-expect-error brak miejsca na setter Reacta
      setState: () => {},
    });
  });
});
