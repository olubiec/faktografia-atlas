// Decyzja, co zrobić z kamerą przy pomiarze kontenera mapy (start, zmiana celu, zmiana rozmiaru).

export type ResizeCameraInput = {
  /** Jest zapisany cel w miejscowości (skok bez animacji). */
  hasLocalityTarget: boolean;
  /** Klucz ostatniego dopasowania (null = jeszcze nie dopasowano). */
  fittedKey: string | null;
  /** Klucz dla bieżącego obszaru i marginesu. */
  nextKey: string;
  /** Pomiar wywołała zmiana rozmiaru kontenera. */
  isResize: boolean;
  /** Animacja kamery właśnie trwa. */
  animating: boolean;
  /** Użytkownik sam poruszył mapą. */
  userMoved: boolean;
};

export type ResizeCameraAction = 'locality' | 'init' | 'animate' | 'retarget' | 'instant' | 'none';

export function resizeCameraAction(input: ResizeCameraInput): ResizeCameraAction {
  if (input.hasLocalityTarget) return 'locality';
  if (input.fittedKey === null) return 'init';
  if (input.fittedKey !== input.nextKey) return 'animate';
  if (input.isResize && !input.userMoved) {
    // Zmiana szerokości w trakcie animacji (np. kolumna profilu): nie przerywamy, tylko podmieniamy cel.
    return input.animating ? 'retarget' : 'instant';
  }
  return 'none';
}
