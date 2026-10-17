import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function Header() {
  const [theme, setTheme] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('faktografia-theme') as Theme | null;
      if (saved) {
        setTheme(saved);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      let activeIsDark = false;
      if (theme === 'dark') {
        activeIsDark = true;
      } else if (theme === 'system' && mediaQuery.matches) {
        activeIsDark = true;
      }

      setIsDark(activeIsDark);

      const html = document.documentElement;
      if (theme !== 'system') {
        html.setAttribute('data-theme', theme);
      } else {
        html.removeAttribute('data-theme');
      }
    };

    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [theme]);

  const cycleTheme = () => {
    const next: Theme = theme === 'system' ? 'light' : (theme === 'light' ? 'dark' : 'system');
    setTheme(next);
    try {
      localStorage.setItem('faktografia-theme', next);
    } catch (e) {}
  };

  const themeText = theme === 'system' ? 'Systemowy' : (theme === 'light' ? 'Jasny' : 'Ciemny');

  return (
    <header className="flex justify-between items-center py-4 px-4 md:px-8 border-b border-linia">
      <div>
        <img
          src={isDark ? "/brand/faktografia-logo-jasne.svg" : "/brand/faktografia-logo-granat.svg"}
          alt="Faktografia"
          className="h-[32px] md:h-[40px]"
        />
      </div>
      <button
        onClick={cycleTheme}
        className="px-3 py-1 border border-linia bg-arkusz hover:bg-linia/20 transition-colors text-tusz text-[13px]"
      >
        Motyw: {themeText}
      </button>
    </header>
  );
}
