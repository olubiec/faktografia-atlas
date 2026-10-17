import { useEffect, useState, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark' | 'system';

function subscribeSystemTheme(callback: () => void) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function getSystemIsDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function Header() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('faktografia-theme') as Theme | null;
      return saved || 'system';
    } catch {
      return 'system';
    }
  });

  const systemIsDark = useSyncExternalStore(subscribeSystemTheme, getSystemIsDark, () => false);

  const activeIsDark = theme === 'dark' || (theme === 'system' && systemIsDark);

  useEffect(() => {
    const html = document.documentElement;
    if (theme !== 'system') {
      html.setAttribute('data-theme', theme);
    } else {
      html.removeAttribute('data-theme');
    }
  }, [theme]);

  const cycleTheme = () => {
    const next: Theme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(next);
    try {
      localStorage.setItem('faktografia-theme', next);
    } catch {}
  };

  const themeText = theme === 'system' ? 'Systemowy' : theme === 'light' ? 'Jasny' : 'Ciemny';

  return (
    <header className="flex justify-between items-center py-4 px-4 md:px-8 border-b border-linia">
      <div>
        <img
          src={activeIsDark ? "/brand/faktografia-naglowek-jasny.svg" : "/brand/faktografia-naglowek-granat.svg"}
          alt="Faktografia Atlas"
          className="h-[40px] w-[40px] md:h-[48px] md:w-[48px]"
        />
      </div>
      <button
        onClick={cycleTheme}
        className="min-w-[44px] min-h-[44px] px-3 py-2 border border-linia bg-arkusz hover:bg-linia/20 transition-colors text-tusz text-xs flex items-center justify-center"
      >
        Motyw: {themeText}
      </button>
    </header>
  );
}
