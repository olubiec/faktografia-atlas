import { describe, expect, it } from "vitest";
import {
  OUTLINE_FADE_END,
  OUTLINE_FADE_START,
  outlineOpacity,
  outlineOpacityFor,
  unitScreenFraction,
} from "../../src/core/map/outline-visibility";

const GMINA_DEG = 0.2;
const WOJ_DEG = 4;

describe("outline-visibility", () => {
  it("progi to 2% i 1%", () => {
    expect(OUTLINE_FADE_START).toBe(0.02);
    expect(OUTLINE_FADE_END).toBe(0.01);
  });

  it("gmina przy widoku kraju (zoom 5, mapa 1200 px) jest niewidoczna", () => {
    expect(outlineOpacityFor(GMINA_DEG, 5, 1200)).toBe(0);
  });

  it("ta sama gmina przy zoom 10 ma pełny obrys", () => {
    expect(outlineOpacityFor(GMINA_DEG, 10, 1200)).toBe(1);
  });

  it("punkty graniczne: 0,02 → 1; 0,01 → 0; 0,015 → 0,5", () => {
    expect(outlineOpacity(0.02)).toBe(1);
    expect(outlineOpacity(0.01)).toBe(0);
    expect(Math.abs(outlineOpacity(0.015) - 0.5)).toBeLessThan(0.001);
  });

  it("przezroczystość nie maleje wraz z przybliżeniem (zoom 3…12)", () => {
    let prev = -1;
    for (let zoom = 3; zoom <= 12; zoom += 0.25) {
      const o = outlineOpacityFor(GMINA_DEG, zoom, 1200);
      expect(o).toBeGreaterThanOrEqual(prev);
      prev = o;
    }
  });

  it("szersza mapa → ta sama jednostka zajmuje mniejszy ułamek", () => {
    expect(unitScreenFraction(GMINA_DEG, 8, 2000)).toBeLessThan(
      unitScreenFraction(GMINA_DEG, 8, 1200),
    );
  });

  it("ułamek liczy się z kafla 512 px i może przekraczać 1", () => {
    // 360° przy zoom 0 = jeden kafel 512 px
    expect(unitScreenFraction(360, 0, 512)).toBeCloseTo(1, 6);
    expect(unitScreenFraction(360, 2, 512)).toBeCloseTo(4, 6);
  });

  it("NaN, -1 i Infinity nie rzucają, wynik w [0,1]", () => {
    for (const v of [Number.NaN, -1, Infinity, -Infinity]) {
      expect(() => outlineOpacity(v)).not.toThrow();
      const o = outlineOpacity(v);
      expect(o).toBeGreaterThanOrEqual(0);
      expect(o).toBeLessThanOrEqual(1);
      const f = outlineOpacityFor(v, 5, 1200);
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThanOrEqual(1);
    }
    expect(outlineOpacity(Number.NaN)).toBe(0);
    expect(outlineOpacity(-1)).toBe(0);
    expect(outlineOpacityFor(GMINA_DEG, 5, 0)).toBe(0);
  });

  it("województwo przy widoku kraju nie znika", () => {
    expect(outlineOpacityFor(WOJ_DEG, 5, 1200)).toBe(1);
  });
});
