import { describe, expect, it } from "vitest";
import { createCameraDriver } from "../../src/core/map/camera-driver";
import { planCamera } from "../../src/core/map/camera-plan";
import { popView, pushView, stackStep, VIEW_STACK_LIMIT } from "../../src/core/map/camera-retarget";
import type { ViewState } from "../../src/core/map/view";

const v = (zoom: number, longitude = 19): ViewState => ({ longitude, latitude: 52, zoom });

describe("stos widoków", () => {
  it("jest LIFO", () => {
    let s = pushView([], v(5.5));
    s = pushView(s, v(7));
    const a = popView(s, v(7));
    expect(a.view?.zoom).toBe(7);
    const b = popView(a.stack, v(5.5));
    expect(b.view?.zoom).toBe(5.5);
    expect(b.stack).toHaveLength(0);
  });

  it("ma limit 20, najstarsze odpadają", () => {
    let s: ViewState[] = [];
    for (let i = 0; i < 25; i += 1) s = pushView(s, v(5 + i * 0.1, i));
    expect(s).toHaveLength(VIEW_STACK_LIMIT);
    expect(s[0].longitude).toBe(5);
  });

  it("pomija wpisy głębsze niż cel (skok o kilka poziomów)", () => {
    const s = [v(5.5), v(7), v(9)];
    const r = popView(s, v(5.5));
    expect(r.view?.zoom).toBe(5.5);
    expect(r.stack).toHaveLength(0);
  });

  it("gdy nic nie pasuje do celu, zwraca null (dopasowanie do bbox)", () => {
    expect(popView([], v(6)).view).toBeNull();
    expect(popView([v(9)], v(5.5)).view).toBeNull();
    expect(popView([v(5.5)], v(8)).view).toBeNull();
  });

  it("nie modyfikuje wejścia", () => {
    const s = [v(5.5)];
    popView(s, v(5.5));
    pushView(s, v(7));
    expect(s).toHaveLength(1);
  });
});

describe("zmiana celu w locie (driver.retarget)", () => {
  function run() {
    let t = 0;
    let pending: (() => void) | null = null;
    let cur = v(5.5);
    const frames: ViewState[] = [];
    const driver = createCameraDriver({
      map: { jumpTo: (x) => void (cur = x), getView: () => cur, getViewportWidthPx: () => 1000 },
      clock: { now: () => t, schedule: (cb) => void (pending = cb) },
      onFrame: (x) => void frames.push(x),
    });
    const step = (dt: number) => {
      t += dt;
      const cb = pending;
      pending = null;
      cb?.();
    };
    return { driver, frames, step };
  }

  it("pierwsza próbka nowego planu nie skacze, a koniec zwalnia do zera", () => {
    const r = run();
    r.driver.start(planCamera(v(5.5), v(9, 21), { viewportWidthPx: 1000, reducedMotion: false }));
    for (let i = 0; i < 15; i += 1) r.step(16);
    const before = r.frames[r.frames.length - 1];
    const n = r.frames.length;
    r.driver.retarget(v(6.5, 18));
    r.step(16);
    const first = r.frames[n];
    expect(Math.abs(first.zoom - before.zoom)).toBeLessThanOrEqual(0.25);
    // Szerokość 1000 px przy zoomie 5.5: 8% = 80 px
    const pxPerDeg = (512 * 2 ** before.zoom) / 360;
    expect(Math.abs(first.longitude - before.longitude) * pxPerDeg).toBeLessThanOrEqual(80);

    for (let i = 0; i < 200 && r.driver.isAnimating(); i += 1) r.step(16);
    const f = r.frames;
    const steps = f.slice(1).map((x, i) => Math.abs(x.zoom - f[i].zoom));
    const maxStep = Math.max(...steps);
    expect(steps[steps.length - 1]).toBeLessThanOrEqual(0.01 * Math.max(maxStep, 1e-9) + 1e-9);
    expect(f[f.length - 1]).toEqual(v(6.5, 18));
  });
});

describe("stackStep", () => {
  it("wejście zapamiętuje widok, „Wróć” go zwraca jako cel", () => {
    const entered = stackStep([], "in", v(7), v(5.5));
    expect(entered.target.zoom).toBe(7);
    const back = stackStep(entered.stack, "out", v(5.5), v(7));
    expect(back.target).toEqual(v(5.5));
    expect(back.stack).toHaveLength(0);
  });

  it("instant i pusty stos zostawiają dopasowanie do bbox", () => {
    expect(stackStep([], "out", v(5.5), v(7)).target).toEqual(v(5.5));
    expect(stackStep([v(5.5)], "instant", v(6), v(6)).stack).toHaveLength(1);
  });
});
