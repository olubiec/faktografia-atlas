import { describe, it, expect } from 'vitest';
import { cameraTransition, type CameraView } from '../../src/core/map/camera';
import tokens from '../../config/tokens.json';

describe('cameraTransition (W1.4)', () => {
  const from: CameraView = { longitude: 19, latitude: 52, zoom: 5 };
  const to: CameraView = { longitude: 20, latitude: 50, zoom: 8 };

  it('wejście w głąb (`in`) trwa tyle, ile motion.cameraIn (600)', () => {
    const result = cameraTransition(from, to, 'in', false);
    expect(result.duration).toBe(tokens.motion.cameraIn);
    expect(result.duration).toBe(600);
  });

  it('powrót (`out`) trwa tyle, ile motion.cameraOut (400)', () => {
    const result = cameraTransition(from, to, 'out', false);
    expect(result.duration).toBe(tokens.motion.cameraOut);
    expect(result.duration).toBe(400);
  });

  it('`instant` (wejście z linku, zmiana rozmiaru) → czas 0', () => {
    expect(cameraTransition(from, to, 'instant', false).duration).toBe(0);
  });

  it('reducedMotion → czas 0 dla każdego rodzaju', () => {
    expect(cameraTransition(from, to, 'in', true).duration).toBe(0);
    expect(cameraTransition(from, to, 'out', true).duration).toBe(0);
    expect(cameraTransition(from, to, 'instant', true).duration).toBe(0);
  });

  it('krzywa przyspieszenia pochodzi z tokenów, także przy czasie 0', () => {
    for (const kind of ['in', 'out', 'instant'] as const) {
      expect(cameraTransition(from, to, kind, false).easing).toBe(tokens.motion.easing);
    }
    expect(cameraTransition(from, to, 'in', true).easing).toBe(tokens.motion.easing);
  });
});
