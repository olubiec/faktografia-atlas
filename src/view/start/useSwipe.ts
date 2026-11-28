import { useRef, type TouchEvent } from 'react';

/** Przewijanie bez animacji, gdy użytkownik wyłączył ruch w systemie. */
export const scrollBehavior = (): ScrollBehavior =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

/** Najmniejsze przesunięcie palcem (px) uznawane za przesunięcie, i największy ruch w pionie (to już przewijanie strony). */
const MIN_DX = 60;
const MAX_DY = 45;

/**
 * Przesunięcie palcem w bok po panelu: w lewo = następny, w prawo = poprzedni. Ruch głównie w pionie to przewijanie
 * strony i nic nie zmienia. Zwraca uchwyty dotyku do wstawienia na element.
 */
export function useSwipe(onPrev: () => void, onNext: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onTouchStart: (e: TouchEvent) => {
      const t = e.touches[0];
      start.current = t ? { x: t.clientX, y: t.clientY } : null;
    },
    onTouchEnd: (e: TouchEvent) => {
      const from = start.current;
      const t = e.changedTouches[0];
      start.current = null;
      if (!from || !t) return;
      const dx = t.clientX - from.x;
      if (Math.abs(dx) < MIN_DX || Math.abs(t.clientY - from.y) > MAX_DY) return;
      if (dx < 0) onNext();
      else onPrev();
    },
  };
}
