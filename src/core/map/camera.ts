import tokens from '../../../config/tokens.json';

export function cameraTransition(
  _from: any,
  _to: any,
  kind: 'in' | 'out' | 'instant',
  reducedMotion: boolean
): { duration: number; easing: string } {
  const easing = tokens.motion.easing;

  if (kind === 'instant' || reducedMotion) {
    return { duration: 0, easing };
  }

  const duration = kind === 'in' ? tokens.motion.cameraIn : tokens.motion.cameraOut;

  return { duration, easing };
}
