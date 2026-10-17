import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, Xmark } from 'iconoir-react';
import { Sheet } from '@/view/ui/Sheet';
import { Icon } from '@/view/ui/Icon';

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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const isZnakLogo = searchParams.get('logo') === 'znak';

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

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const cycleTheme = () => {
    const next: Theme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(next);
    try {
      localStorage.setItem('faktografia-theme', next);
    } catch {}
  };

  const themeText = theme === 'system' ? 'Systemowy' : theme === 'light' ? 'Jasny' : 'Ciemny';

  let logoSrc = activeIsDark ? '/brand/faktografia-logo-jasne.svg' : '/brand/faktografia-logo-granat.svg';
  let logoClass = 'h-[28px] md:h-[36px] w-auto';

  if (isZnakLogo) {
    logoSrc = activeIsDark ? '/brand/faktografia-znak-jasne.svg' : '/brand/faktografia-znak-granat.svg';
    logoClass = 'h-[40px] md:h-[48px] w-auto';
  }

  return (
    <header className="h-[72px] flex justify-between items-center px-4 md:px-8 border-b border-linia bg-kalka text-tusz relative z-20">
      <Link to={`/${location.search}`} className="flex items-center min-h-[44px]">
        <img
          src={logoSrc}
          alt="Faktografia"
          className={logoClass}
        />
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-[500]">
        <Link
          to={`/o-projekcie${location.search}`}
          className="hover:underline transition-colors py-2"
        >
          O projekcie
        </Link>
        <Link
          to={`/zrodla${location.search}`}
          className="hover:underline transition-colors py-2"
        >
          Skąd są dane
        </Link>
        <button
          onClick={cycleTheme}
          className="min-w-[44px] min-h-[44px] px-3 py-2 border border-linia bg-arkusz hover:bg-linia/20 transition-colors text-tusz text-xs flex items-center justify-center cursor-pointer"
        >
          Motyw: {themeText}
        </button>
      </nav>

      {/* Mobile Controls */}
      <div className="flex md:hidden items-center gap-2">
        <button
          onClick={cycleTheme}
          className="min-w-[44px] min-h-[44px] px-3 py-2 border border-linia bg-arkusz hover:bg-linia/20 transition-colors text-tusz text-xs flex items-center justify-center cursor-pointer"
        >
          Motyw: {themeText}
        </button>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
          aria-expanded={mobileMenuOpen}
          className="min-w-[44px] min-h-[44px] border border-linia bg-arkusz flex items-center justify-center text-tusz cursor-pointer"
        >
          <Icon icon={mobileMenuOpen ? Xmark : Menu} aria-hidden={true} size={20} />
        </button>
      </div>

      {/* Mobile Menu Sheet */}
      {mobileMenuOpen && (
        <Sheet className="absolute top-[72px] left-0 right-0 z-30 flex flex-col gap-4 border-t-0 shadow-none md:hidden">
          <Link
            to={`/o-projekcie${location.search}`}
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-[500] py-2 hover:underline"
          >
            O projekcie
          </Link>
          <Link
            to={`/zrodla${location.search}`}
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-[500] py-2 hover:underline"
          >
            Skąd są dane
          </Link>
        </Sheet>
      )}
    </header>
  );
}
