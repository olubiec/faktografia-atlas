import { describe, expect, it } from "vitest";
import { createCameraDriver } from "../../src/core/map/camera-driver";
import { planCamera } from "../../src/core/map/camera-plan";
import { withReducedMotion } from "../../src/view/map/hooks/useCameraDriver";
import type { ViewState } from "../../src/core/map/view";

const A: ViewState = { longitude: 19, latitude: 52, zoom: 5.5 };
const B: ViewState = { longitude: 21, latitude: 50, zoom: 9 };

function setup() {
  let scheduled = 0;
  const jumps: ViewState[] = [];
  let ends = 0;
  const driver = createCameraDriver({
    map: { jumpTo: (v) => void jumps.push(v), getView: () => A, getViewportWidthPx: () => 1000 },
    clock: {
      now: () => 0,
      schedule: () => {
        scheduled += 1;
      },
    },
    onEnd: () => {
      ends += 1;
    },
  });
  return { driver, jumps, stats: () => ({ scheduled, ends }) };
}

describe("reduced motion kamery", () => {
  it("planCamera z reducedMotion daje czas 0", () => {
    const p = planCamera(A, B, { viewportWidthPx: 1000, reducedMotion: true });
    expect(p.durationMs).toBe(0);
  });

  it("plan o czasie 0: jedno jumpTo na cel, onEnd raz, bez klatek", () => {
    const { driver, jumps, stats } = setup();
    driver.start(planCamera(A, B, { viewportWidthPx: 1000, reducedMotion: true }));
    expect(jumps).toEqual([B]);
    expect(stats().ends).toBe(1);
    expect(stats().scheduled).toBeLessThanOrEqual(1);
    expect(driver.isAnimating()).toBe(false);
  });

  it("retarget przy reduced motion też skacze jednym jumpTo", () => {
    const { driver, jumps, stats } = setup();
    const wrapped = withReducedMotion(driver, () => true);
    wrapped.retarget(B);
    expect(jumps).toEqual([B]);
    expect(stats().ends).toBe(1);
    expect(stats().scheduled).toBe(0);
  });

  it("retarget bez reduced motion animuje (zleca klatkę)", () => {
    const { driver, jumps, stats } = setup();
    withReducedMotion(driver, () => false).retarget(B);
    expect(jumps).toEqual([]);
    expect(stats().scheduled).toBe(1);
  });
});
