import tokens from '../../../config/tokens.json';

/** Minimalny opis widoku kamery (bez podpinania do mapy – to zadanie W3.2). */
export type CameraView = {
  longitude: number;
  latitude: number;
  zoom: number;
};

export type CameraKind = 'in' | 'out' | 'instant';

export type CameraTransition = {
  /** Czas przejścia w milisekundach (0 = bez animacji). */
  duration: number;
  /** Krzywa przyspieszenia z tokenów (motion.easing). */
  easing: string;
};

/**
 * Jak ma przebiec przejście kamery.
 * Wejście w głąb i powrót mają czasy z tokenów; wejście z linku / zmiana rozmiaru
 * (`instant`) oraz `prefers-reduced-motion` dają czas 0.
 */
export function cameraTransition(
  _from: CameraView,
  _to: CameraView,
  kind: CameraKind,
  reducedMotion: boolean,
): CameraTransition {
  const easing = tokens.motion.easing;

  if (kind === 'instant' || reducedMotion) {
    return { duration: 0, easing };
  }

  const duration = kind === 'in' ? tokens.motion.cameraIn : tokens.motion.cameraOut;
  return { duration, easing };
}
