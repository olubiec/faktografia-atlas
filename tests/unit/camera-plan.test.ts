import { describe, expect, it } from "vitest";
import {
  easeInOutCubic,
  planCamera,
  planDuration,
  sampleCamera,
} from "../../src/core/map/camera-plan";
import type { ViewState } from "../../src/core/map/view";

const VP = 400;
const view = (zoom: number, longitude = 19, latitude = 52): ViewState => ({
  longitude,
  latitude,
  zoom,
});

describe("easeInOutCubic", () => {
  it("ma wartości graniczne i środek", () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 12);
  });
  it("jest monotoniczna na 101 punktach", () => {
    for (let i = 1; i <= 100; i++) {
      expect(easeInOutCubic(i / 100)).toBeGreaterThanOrEqual(
        easeInOutCubic((i - 1) / 100),
      );
    }
  });
  it("ma zerową pochodną na końcach", () => {
    expect(Math.abs(easeInOutCubic(0.001) - easeInOutCubic(0))).toBeLessThan(
      1e-5,
    );
    expect(Math.abs(easeInOutCubic(1) - easeInOutCubic(0.999))).toBeLessThan(
      1e-5,
    );
  });
});

describe("planDuration", () => {
  it("bez zmiany zoomu i przesunięcia daje 400 ms", () => {
    expect(planDuration(view(6), view(6), VP)).toBe(400);
  });
  it("Δzoom 4 jest przycięte do 900 ms", () => {
    expect(planDuration(view(5), view(9), VP)).toBe(900);
  });
  it("Δzoom 1 mieści się między 400 a 900", () => {
    const d = planDuration(view(6), view(7), VP);
    expect(d).toBeGreaterThan(400);
    expect(d).toBeLessThan(900);
  });
  it("reduced motion daje 0", () => {
    expect(planDuration(view(5), view(9), VP, true)).toBe(0);
    expect(
      planCamera(view(5), view(9), { viewportWidthPx: VP, reducedMotion: true })
        .durationMs,
    ).toBe(0);
  });
  it("rośnie monotonicznie z dystansem", () => {
    let prev = 0;
    for (let dLon = 0; dLon <= 8; dLon += 1) {
      const d = planDuration(view(6), view(6, 19 + dLon), VP);
      expect(d).toBeGreaterThanOrEqual(prev);
      prev = d;
    }
    expect(prev).toBeGreaterThan(400);
  });
});

describe("sampleCamera", () => {
  const plan = planCamera(view(5, 18, 50), view(9, 21, 53), {
    viewportWidthPx: VP,
    reducedMotion: false,
  });

  it("t=0 daje dokładnie from, t>=duration dokładnie to", () => {
    expect(sampleCamera(plan, 0)).toBe(plan.from);
    expect(sampleCamera(plan, plan.durationMs)).toBe(plan.to);
    expect(sampleCamera(plan, plan.durationMs + 5000).zoom).toBe(9);
  });
  it("czas ujemny lub NaN traktuje jak 0", () => {
    expect(sampleCamera(plan, -10)).toEqual(plan.from);
    expect(sampleCamera(plan, Number.NaN)).toEqual(plan.from);
  });
  it("zoom jest monotoniczny w górę i w dół", () => {
    const down = planCamera(view(9), view(5), {
      viewportWidthPx: VP,
      reducedMotion: false,
    });
    for (const p of [plan, down]) {
      const sign = Math.sign(p.to.zoom - p.from.zoom);
      let prev = p.from.zoom;
      for (let i = 1; i <= 100; i++) {
        const z = sampleCamera(p, (p.durationMs * i) / 100).zoom;
        expect((z - prev) * sign).toBeGreaterThanOrEqual(0);
        prev = z;
      }
    }
  });
  it("skok zoomu na klatkę (60 fps, Δzoom 4, 900 ms) ≤ 0,25, a w ostatniej klatce ≤ 1% maksimum", () => {
    const frame = 1000 / 60;
    let prev = plan.from.zoom;
    let maxStep = 0;
    let lastStep = 0;
    for (let t = frame; t < plan.durationMs + frame; t += frame) {
      const z = sampleCamera(plan, t).zoom;
      lastStep = Math.abs(z - prev);
      maxStep = Math.max(maxStep, lastStep);
      prev = z;
    }
    expect(maxStep).toBeLessThanOrEqual(0.25);
    // Ostatnia pełna klatka przed lądowaniem.
    const before = sampleCamera(plan, plan.durationMs - 2 * frame).zoom;
    const last = sampleCamera(plan, plan.durationMs - frame).zoom;
    expect(Math.abs(last - before)).toBeLessThanOrEqual(0.01 * maxStep);
  });
  it("waga van Wijk: z0=5, z1=9 w połowie czasu środek jest już w 80% drogi", () => {
    const p = { from: view(5, 10, 50), to: view(9, 20, 50), durationMs: 900 };
    // z(0.5)=7 → u = (2^-7 − 2^-5)/(2^-9 − 2^-5) = 0,8 (dla stałej szerokości geogr. lon jest liniowy)
    expect(sampleCamera(p, 450).longitude).toBeCloseTo(10 + 10 * 0.8, 9);
  });
  it("waga monotoniczna od 0 do 1; dla z0=z1 u = easeInOutCubic(t)", () => {
    const p = { from: view(5, 10, 50), to: view(9, 20, 50), durationMs: 900 };
    let prev = 10;
    for (let i = 1; i <= 100; i++) {
      const lon = sampleCamera(p, (900 * i) / 100).longitude;
      expect(lon).toBeGreaterThanOrEqual(prev);
      prev = lon;
    }
    const flat = {
      from: view(7, 10, 50),
      to: view(7, 20, 50),
      durationMs: 900,
    };
    expect(sampleCamera(flat, 300).longitude).toBeCloseTo(
      10 + 10 * easeInOutCubic(300 / 900),
      9,
    );
  });
});
