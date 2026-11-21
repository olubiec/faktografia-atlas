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

/**
 * Strefy układu nad mapą (C08): jedno źródło położeń, żeby pasek, okienko miejsca i przyciski się nie nakładały.
 * Dół = pasek wskaźnika (odstęp od krawędzi ekranu), nad nim okienko miejsca; góra = okruszki i „Wróć”.
 */
/** Odstęp dolny w pikselach (= klasa `mb-3`/`bottom-3`, 0,75 rem przy 16 px). */
export const BOTTOM_GAP_PX = 12;
/** Odstęp dolny paska wskaźnika na telefonie. */
export const BOTTOM_GAP_CLASS = 'mb-3';
/** Okienko miejsca na telefonie: nad dolnym odstępem, z bokami jak reszta strony. */
export const TOOLTIP_ZONE_CLASS = 'absolute z-30 inset-x-3 bottom-3 mx-auto max-w-[360px]';
/** Przycisk „Wróć do wyższego poziomu” przy górnej krawędzi mapy (pod okruszkami). */
export const TOP_ZONE_CLASS = 'absolute top-4 left-4 z-10';

/**
 * Odsunięcie okienka od dołu mapy: tyle, ile przeszkoda (pasek, zgoda) wchodzi w mapę, plus jeden odstęp dolny.
 */
export function tooltipBottomOffset(mapBottom: number, obstacleTop: number): number {
  return Math.max(0, mapBottom - obstacleTop) + BOTTOM_GAP_PX;
}
