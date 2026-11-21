import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from 'react';
import { Link, useLocation } from 'react-router';
import type { MouseEvent } from 'react';
import { Menu, Search } from 'iconoir-react';
import { DialogTrigger } from '@/components/ui/dialog';
import { Window } from '@/view/ui/Window';
import { LinkList } from '@/view/ui/LinkList';
import { Icon } from '@/view/ui/Icon';
import { CopyLinkButton } from '@/view/layout/CopyLinkButton';
import { ATLAS_RESET_EVENT, homeSearch } from '@/core/url/home';
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
  const isStartActive = location.pathname === '/';
  const isMapActive = location.pathname === '/mapa';
  // Start i Mapa niosą tylko parametry techniczne (e2e, tune, logo); stan widoku zostaje na mapie.
  const startTo = `/${homeSearch(location.search)}`;
  const mapTo = `/mapa${homeSearch(location.search)}`;

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

  const cycleTheme = () => {
    const next: Theme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(next);
    try {
      localStorage.setItem('faktografia-theme', next);
    } catch {}
  };

  const themeText = theme === 'system' ? 'Systemowy' : theme === 'light' ? 'Jasny' : 'Ciemny';

  let logoSrc = activeIsDark ? '/brand/faktografia-logo-jasne.svg' : '/brand/faktografia-logo-granat.svg';
  // STYL §4: logo w nagłówku 40 px (telefon) i 48 px (komputer); ujemne -ml i -top cofają margines wewnątrz pliku SVG (litery są w nim przesunięte w dół i w prawo), więc litery stoją równo.
  let logoClass = 'relative -top-1.5 md:-top-2 h-10 md:h-12 w-auto -ml-3 md:-ml-3.5';

  if (isZnakLogo) {
    logoSrc = activeIsDark ? '/brand/faktografia-znak-jasne.svg' : '/brand/faktografia-znak-granat.svg';
    logoClass = 'h-10 md:h-12 w-auto';
  }

  // Menu telefonu: Start i Mapa jak na komputerze + strony opisowe; każdy link raz.
  const desktopItems = [
    { to: startTo, label: 'Start' },
    { to: mapTo, label: 'Mapa' },
  ];
  const menuItems = [...desktopItems, { to: '/o-projekcie', label: 'O projekcie' }, { to: '/zrodla', label: 'Skąd są dane' }];
  const activePath = isStartActive ? startTo : isMapActive ? mapTo : location.pathname;
  // Ponowne „Mapa” na mapie zeruje widok; w menu telefonu dodatkowo zamyka okno.
  const onNavClick = (e: MouseEvent<HTMLElement>) => {
    const link = (e.target as HTMLElement).closest('a');
    if (!link) return;
    setMobileMenuOpen(false);
    if (isMapActive && link.getAttribute('href') === mapTo) window.dispatchEvent(new Event(ATLAS_RESET_EVENT));
  };
  const themeButton = (className: string) => (
    <button
      type="button"
      onClick={cycleTheme}
      className={`min-w-11 min-h-11 px-3 py-2 border border-linia bg-arkusz hover:bg-linia/20 transition-colors text-tusz text-xs flex items-center cursor-pointer rounded-none ${className}`}
    >
      Motyw: {themeText}
    </button>
  );

  return (
    <header className="h-14 md:h-18 flex justify-between items-center gap-2 px-4 md:px-8 border-b border-linia bg-kalka text-tusz relative z-20 shrink-0">
      <Link to={startTo} aria-label="Faktografia – strona główna" className="flex items-center min-h-11 shrink-0">
        <img src={logoSrc} alt="Faktografia" className={logoClass} />
      </Link>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Komputer: nawigacja (Start, Mapa) */}
        <div className="hidden md:block" onClick={onNavClick}>
          <LinkList items={desktopItems} activePath={activePath} label="Menu główne" />
        </div>
        {/* „Kopiuj link”: jedno miejsce na komputerze i telefonie */}
        {isMapActive && <CopyLinkButton />}
        <button
          type="button"
          onClick={() => changeSearchOpen(true)}
          aria-label="Szukaj miejsca"
          className="min-w-11 min-h-11 gap-2 px-3 border border-linia bg-arkusz hover:bg-linia/20 transition-colors text-tusz text-sm flex items-center justify-center cursor-pointer rounded-none"
        >
          <Icon icon={Search} aria-hidden={true} size={20} />
          <span className="hidden lg:inline text-olowek">Szukaj miejsca...</span>
          <span className="hidden lg:inline-block px-1.5 py-0.5 border border-linia bg-kalka text-olowek text-xs font-mono">Ctrl K</span>
        </button>
        {themeButton('hidden md:flex')}
        {/* Telefon: menu w oknie (wspólny Window + LinkList) */}
        <div className="md:hidden">
          <Window
            open={mobileMenuOpen}
            onOpenChange={setMobileMenuOpen}
            title="Menu"
            description="Strony serwisu i motyw"
            mode="dialog"
            slot="mobile-menu"
            trigger={
              <DialogTrigger asChild>
                <button
                  type="button"
                  aria-label="Menu"
                  aria-haspopup="dialog"
                  className="min-w-11 min-h-11 border border-linia bg-arkusz flex items-center justify-center text-tusz cursor-pointer rounded-none hover:bg-linia/20 transition-colors"
                >
                  <Icon icon={Menu} aria-hidden={true} size={20} />
                </button>
              </DialogTrigger>
            }
          >
            <div className="flex flex-col gap-4" onClick={onNavClick}>
              <LinkList items={menuItems} variant="menu" activePath={activePath} label="Menu główne (telefon)" />
              {themeButton('justify-start')}
            </div>
          </Window>
        </div>
      </div>

      {/* Search Modal */}
      {searchMounted && (
        <Suspense fallback={null}>
          <SearchDialog open={searchOpen} onOpenChange={changeSearchOpen} />
        </Suspense>
      )}
    </header>
  );
}
