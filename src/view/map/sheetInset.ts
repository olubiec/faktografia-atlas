import { useSyncExternalStore } from 'react';

let currentInset = 0;
const listeners = new Set<() => void>();

/**
 * Ustawia bieżącą wysokość (w pikselach) dolnego arkusza zasłaniającego mapę.
 */
export function setSheetInset(insetPx: number): void {
  const rounded = Math.max(0, Math.round(insetPx));
  if (currentInset !== rounded) {
    currentInset = rounded;
    listeners.forEach((listener) => listener());
  }
}

/**
 * Zwraca bieżącą wysokość (w pikselach) dolnego arkusza.
 */
export function getSheetInset(): number {
  return currentInset;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Reaktywny hook zwracający bieżący margines dolny mapy (wysokość arkusza w px).
 */
export function useSheetInset(): number {
  return useSyncExternalStore(subscribe, getSheetInset, () => 0);
}
