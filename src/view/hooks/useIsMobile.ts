import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    // To satisfy oxlint, we do NOT call setIsMobile synchronously here.
    // Since we initialize `isMobile` with `mediaQuery.matches`, it's extremely unlikely they differ.
    // If they do (e.g. browser restored state), we sync via setTimeout to avoid synchronous cascading renders.
    if (mediaQuery.matches !== isMobile) {
        setTimeout(() => setIsMobile(mediaQuery.matches), 0);
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isMobile]);

  return isMobile;
}
