import { describe, it, expect } from 'vitest';
import { cameraTransition } from '../../src/core/map/camera';
import tokens from '../../config/tokens.json';

describe('cameraTransition', () => {
  const from = {};
  const to = {};

  it('zwraca duration z tokens.motion.cameraIn dla wejścia', () => {
    const result = cameraTransition(from, to, 'in', false);
    expect(result.duration).toBe(tokens.motion.cameraIn); // 600
    expect(result.easing).toBe(tokens.motion.easing);
  });

  it('zwraca duration z tokens.motion.cameraOut dla wyjścia', () => {
    const result = cameraTransition(from, to, 'out', false);
    expect(result.duration).toBe(tokens.motion.cameraOut); // 400
    expect(result.easing).toBe(tokens.motion.easing);
  });

  it('zwraca duration 0 dla instant', () => {
    const result = cameraTransition(from, to, 'instant', false);
    expect(result.duration).toBe(0);
    expect(result.easing).toBe(tokens.motion.easing);
  });

  it('zwraca duration 0 dla reducedMotion', () => {
    const resultIn = cameraTransition(from, to, 'in', true);
    expect(resultIn.duration).toBe(0);

    const resultOut = cameraTransition(from, to, 'out', true);
    expect(resultOut.duration).toBe(0);
  });
});
