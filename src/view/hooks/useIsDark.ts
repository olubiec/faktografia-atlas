import { useSyncExternalStore } from 'react';

function subscribeTheme(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', callback);

  let observer: MutationObserver | null = null;
  if (typeof MutationObserver !== 'undefined') {
    observer = new MutationObserver(callback);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  return () => {
    mediaQuery.removeEventListener('change', callback);
    if (observer) {
      observer.disconnect();
    }
  };
}

function getIsDark(): boolean {
  if (typeof document === 'undefined') return false;
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
}

/** Czy aktywny jest ciemny motyw (wybór ręczny albo systemowy). */
export function useIsDark(): boolean {
  return useSyncExternalStore(subscribeTheme, getIsDark, () => false);
}
