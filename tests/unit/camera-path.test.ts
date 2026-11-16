import { describe, it, expect } from 'vitest';
import { flyView, flyDuration } from '../../src/core/map/camera-path';
import tokens from '../../config/tokens.json';

const size = { width: 900, height: 700 };
const country = { longitude: 19.1, latitude: 52, zoom: 5.5 };
const gmina = { longitude: 21.0, latitude: 52.2, zoom: 10.5 };

describe('camera-path (płynny lot kamery)', () => {
  it('początek i koniec to dokładnie widok startowy i docelowy', () => {
    expect(flyView(country, gmina, 0, size)).toEqual(country);
    expect(flyView(country, gmina, 1, size)).toEqual(gmina);
  });

  it('w środku lotu wartości są skończone, a zoom nie wychodzi poza pas rozsądku', () => {
    for (let t = 0.05; t < 1; t += 0.05) {
      const v = flyView(country, gmina, t, size);
      expect(Number.isFinite(v.longitude + v.latitude + v.zoom)).toBe(true);
      expect(v.zoom).toBeGreaterThan(country.zoom - 2);
      expect(v.zoom).toBeLessThan(gmina.zoom + 0.5);
    }
  });

  it('cel nie ucieka z ekranu: środek zbliża się do celu monotonicznie', () => {
    let prev = Infinity;
    for (let t = 0; t <= 1.0001; t += 0.1) {
      const v = flyView(country, gmina, Math.min(t, 1), size);
      const d = Math.hypot(v.longitude - gmina.longitude, v.latitude - gmina.latitude);
      expect(d).toBeLessThanOrEqual(prev + 1e-9);
      prev = d;
    }
  });

  it('czas lotu mieści się w widełkach z tokenów; powrót nie jest wolniejszy niż wejście', () => {
    const inMs = flyDuration(country, gmina, 'in', size);
    const outMs = flyDuration(gmina, country, 'out', size);
    expect(inMs).toBeGreaterThanOrEqual(tokens.motion.cameraFlyMin);
    expect(inMs).toBeLessThanOrEqual(tokens.motion.cameraFlyMax);
    expect(outMs).toBeLessThanOrEqual(inMs);
    expect(flyDuration(country, gmina, 'instant', size)).toBe(0);
  });
});
