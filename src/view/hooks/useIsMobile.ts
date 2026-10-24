import { useState, useEffect } from 'react';
import tokensJson from '../../../config/tokens.json';

const MOBILE_QUERY = `(max-width: ${tokensJson.breakpoints.tablet - 1}px)`;

/**
 * Hook zwracający informację czy bieżący ekran jest urządzeniem mobilnym (szerokość < tablet breakpoint z tokens.json).
 * Domyślnie zwraca `false` w środowisku bez window / SSR.
 * Reaguje na zmiany rozmiaru okna poprzez zdarzenie 'change' na MediaQueryList.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia(MOBILE_QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isMobile;
}
