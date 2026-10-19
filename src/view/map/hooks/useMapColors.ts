import { useState, useEffect, useCallback } from 'react';
import { getMapColorsFromCss, type MapColors } from '../layers';

export function useMapColors() {
  const [colors, setColors] = useState<MapColors | null>(getMapColorsFromCss);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const updateColorsAndTheme = useCallback(() => {
    const newColors = getMapColorsFromCss();
    if (newColors) {
      setColors(newColors);
    }

    const isDark =
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      (document.documentElement.classList.contains('dark') &&
        document.documentElement.getAttribute('data-theme') !== 'light');

    setTheme(isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    updateColorsAndTheme();

    const observer = new MutationObserver(() => {
      updateColorsAndTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    return () => observer.disconnect();
  }, [updateColorsAndTheme]);

  return { colors, theme };
}
