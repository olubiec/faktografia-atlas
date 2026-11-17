import { lazy, Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, Search, Xmark } from 'iconoir-react';
import { Sheet } from '@/view/ui/Sheet';
import { Icon } from '@/view/ui/Icon';
import { useMenuDismiss } from '@/view/hooks/useMenuDismiss';
const SearchDialog = lazy(() => import('@/view/search/SearchDialog').then((m) => ({ default: m.SearchDialog })));

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

// Kolejność linków w menu telefonu (hamburger). Każdy adres to trasa z src/App.tsx.
const MOBILE_MENU_LINKS = [
  { to: '/biblioteka', label: 'Biblioteka' },
  { to: '/rankingi', label: 'Rankingi' },
  { to: '/porownaj', label: 'Porównaj' },
  { to: '/o-projekcie', label: 'O projekcie' },
  { to: '/zrodla', label: 'Skąd są dane' },
  { to: '/prywatnosc', label: 'Prywatność' },
] as const;

// Linki w menu telefonu. Zachowują parametry adresu (np. ?i=…) i podświetlają bieżącą podstronę.
export function MobileMenuLinks({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation();
  return (
    <>
      {MOBILE_MENU_LINKS.map((link) => {
        const isActive = location.pathname.startsWith(link.to);
        return (
          <Link
          viewTransition
            key={link.to}
            to={`${link.to}${location.search}`}
            onClick={onNavigate}
            className={`text-sm font-[500] py-2 hover:underline min-h-[44px] flex items-center ${
              isActive ? 'font-bold text-korekta-tekst' : ''
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

// Parametry, które przeżywają klik w logo: wskaźnik i rok (oraz wariant logo). Reszta (l, u, c, compare…) znika.
// Flagi trybu testowego (e2e, tune) zostają, bo bez nich szew testowy przestaje się odświeżać.
const LOGO_KEEP_PARAMS = ['i', 'y', 'wsk', 'rok', 'logo', 'e2e', 'tune'] as const;

function logoHomeTarget(search: string): string {
  const from = new URLSearchParams(search);
  const to = new URLSearchParams();
  for (const key of LOGO_KEEP_PARAMS) {
    const value = from.get(key);
    if (value !== null) to.set(key, value);
  }
  const query = to.toString();
  return query ? `/?${query}` : '/';
}

export function Header() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('faktografia-theme') as Theme | null;
      return saved || 'system';
    } catch {
      return 'system';
    }
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // Okno ładujemy dopiero przy pierwszym otwarciu (kod i dane poza głównym pakietem).
  const [searchMounted, setSearchMounted] = useState(false);

  const changeSearchOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    setSearchMounted(true);
    setSearchOpen(value);
  };
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const isZnakLogo = searchParams.get('logo') === 'znak';
  const isLibraryActive = location.pathname.startsWith('/biblioteka');
  const isHomeActive = location.pathname === '/';
  const isRankingsActive = location.pathname.startsWith('/rankingi');
  const isCompareActive = location.pathname.startsWith('/porownaj');

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        changeSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  useMenuDismiss({ open: mobileMenuOpen, onClose: closeMobileMenu, menuRef, triggerRef: menuButtonRef });

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
    <header className="h-[56px] md:h-[72px] flex justify-between items-center px-4 md:px-8 border-b border-linia bg-kalka text-tusz relative z-20 shrink-0">
      <Link
        viewTransition
        to={logoHomeTarget(location.search)}
        onClick={(e) => {
          if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          navigate(logoHomeTarget(location.search), { viewTransition: true });
          // Hooki mapy czytają adres po zdarzeniu historii; sama zmiana trasy go nie wysyła.
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
        className="flex items-center min-h-[44px]"
      >
        <img
          src={logoSrc}
          alt="Faktografia"
          className={logoClass}
        />
      </Link>

      {/* Desktop Header Search Trigger Button */}
      <button
        type="button"
        onClick={() => changeSearchOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-2 border border-linia bg-arkusz hover:bg-linia/20 transition-colors text-tusz text-xs md:text-sm min-h-[44px] cursor-pointer rounded-none"
      >
        <Icon icon={Search} aria-hidden={true} size={20} />
        <span className="hidden sm:inline text-olowek">Szukaj miejsca...</span>
        <span className="hidden md:inline-block px-1.5 py-0.5 border border-linia bg-kalka text-olowek text-xs font-mono ml-1">
          Ctrl K
        </span>
      </button>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-[500]">
        <Link
          viewTransition
          to={`/${location.search}`}
          className={`hover:underline transition-colors py-2 flex items-center min-h-[44px] ${isHomeActive ? 'font-bold text-korekta-tekst' : ''}`}
          aria-current={isHomeActive ? 'page' : undefined}
        >
          Mapa
        </Link>
        <Link
          viewTransition
          to={`/rankingi${location.search}`}
          className={`hover:underline transition-colors py-2 flex items-center min-h-[44px] ${isRankingsActive ? 'font-bold text-korekta-tekst' : ''}`}
          aria-current={isRankingsActive ? 'page' : undefined}
        >
          Rankingi
        </Link>
        <Link
          viewTransition
          to={`/porownaj${location.search}`}
          className={`hover:underline transition-colors py-2 flex items-center min-h-[44px] ${isCompareActive ? 'font-bold text-korekta-tekst' : ''}`}
          aria-current={isCompareActive ? 'page' : undefined}
        >
          Porównaj
        </Link>
        <Link
          viewTransition
          to={`/biblioteka${location.search}`}
          className={`hover:underline transition-colors py-2 flex items-center min-h-[44px] ${
            isLibraryActive ? 'font-bold text-korekta-tekst' : ''
          }`}
          aria-current={isLibraryActive ? 'page' : undefined}
        >
          Biblioteka
        </Link>
        <Link
          viewTransition
          to={`/o-projekcie${location.search}`}
          className="hover:underline transition-colors py-2"
        >
          O projekcie
        </Link>
        <Link
          viewTransition
          to={`/zrodla${location.search}`}
          className="hover:underline transition-colors py-2"
        >
          Skąd są dane
        </Link>
        <button
          type="button"
          onClick={cycleTheme}
          className="min-w-[44px] min-h-[44px] px-3 py-2 border border-linia bg-arkusz hover:bg-linia/20 transition-colors text-tusz text-xs flex items-center justify-center cursor-pointer rounded-none"
        >
          Motyw: {themeText}
        </button>
      </nav>

      {/* Mobile Controls: Search (lupa) + Menu */}
      <div className="flex md:hidden items-center gap-2">
        <button
          type="button"
          onClick={() => changeSearchOpen(true)}
          aria-label="Szukaj miejsca"
          className="min-w-[44px] min-h-[44px] border border-linia bg-arkusz flex items-center justify-center text-tusz cursor-pointer rounded-none hover:bg-linia/20 transition-colors"
        >
          <Icon icon={Search} aria-hidden={true} size={20} />
        </button>
        <button
          type="button"
          ref={menuButtonRef}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          className="min-w-[44px] min-h-[44px] border border-linia bg-arkusz flex items-center justify-center text-tusz cursor-pointer rounded-none hover:bg-linia/20 transition-colors"
        >
          <Icon icon={mobileMenuOpen ? Xmark : Menu} aria-hidden={true} size={20} />
        </button>
      </div>

      {/* Mobile Menu Sheet */}
      {mobileMenuOpen && (
        <div ref={menuRef} id="mobile-menu" className="absolute top-[56px] md:top-[72px] left-0 right-0 z-30 md:hidden">
        <Sheet className="flex flex-col gap-4 border-t-0 shadow-none">
          <button
            type="button"
            onClick={cycleTheme}
            className="min-w-[44px] min-h-[44px] px-3 py-2 border border-linia bg-arkusz hover:bg-linia/20 transition-colors text-tusz text-xs flex items-center justify-start cursor-pointer rounded-none text-left"
          >
            Motyw: {themeText}
          </button>
          <MobileMenuLinks onNavigate={() => setMobileMenuOpen(false)} />
        </Sheet>
        </div>
      )}

      {/* Search Modal */}
      {searchMounted && (
        <Suspense fallback={null}>
          <SearchDialog open={searchOpen} onOpenChange={changeSearchOpen} />
        </Suspense>
      )}
    </header>
  );
}
