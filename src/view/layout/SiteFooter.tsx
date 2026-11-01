import { useSyncExternalStore } from 'react';
import { Link } from 'react-router';

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

export function SiteFooter() {
  const isDark = useSyncExternalStore(subscribeTheme, getIsDark, () => false);
  const logoSrc = isDark ? '/brand/faktografia-logo-jasne.svg' : '/brand/faktografia-logo-granat.svg';

  return (
    <footer
      role="contentinfo"
      className="border-t border-linia bg-arkusz text-tusz mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Kolumna 1: Logo, opis misji portalu, licencja CC BY 4.0 */}
          <div className="flex flex-col gap-4">
            <Link
              to="/"
              className="inline-flex items-center min-h-[44px] min-w-[44px] rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              <img
                src={logoSrc}
                alt="Faktografia"
                className="h-[28px] md:h-[32px] w-auto"
                width={160}
                height={32}
              />
            </Link>
            <p className="text-sm font-[400] text-olowek leading-[1.6]">
              Faktografia Atlas to niezależna, interaktywna mapa Polski prezentująca rzetelne statystyki GUS dla każdego województwa, powiatu i gminy.
            </p>
            <p className="text-xs font-[400] text-olowek leading-[1.5]">
              Dane i opracowanie na licencji{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/deed.pl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center min-h-[44px] min-w-[44px] underline hover:text-tusz rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
              >
                CC BY 4.0
              </a>
              .
            </p>
          </div>

          {/* Kolumna 2: Narzędzia */}
          <nav aria-label="Narzędzia" className="flex flex-col gap-1">
            <h2 className="text-sm font-[700] text-tusz mb-2">Narzędzia</h2>
            <Link
              to="/"
              className="flex items-center min-h-[44px] min-w-[44px] text-sm text-olowek hover:text-tusz hover:underline transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Mapa Polski
            </Link>
            <Link
              to="/rankingi"
              className="flex items-center min-h-[44px] min-w-[44px] text-sm text-olowek hover:text-tusz hover:underline transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Rankingi
            </Link>
            <Link
              to="/porownaj"
              className="flex items-center min-h-[44px] min-w-[44px] text-sm text-olowek hover:text-tusz hover:underline transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Porównaj
            </Link>
            <Link
              to="/biblioteka"
              className="flex items-center min-h-[44px] min-w-[44px] text-sm text-olowek hover:text-tusz hover:underline transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Biblioteka
            </Link>
          </nav>

          {/* Kolumna 3: Działy tematyczne GUS (7 głównych wskaźników) */}
          <nav aria-label="Działy tematyczne GUS" className="flex flex-col gap-1">
            <h2 className="text-sm font-[700] text-tusz mb-2">Działy tematyczne GUS</h2>
            <Link
              to="/?i=density"
              className="flex items-center min-h-[44px] min-w-[44px] text-sm text-olowek hover:text-tusz hover:underline transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Ludność (gęstość zaludnienia)
            </Link>
            <Link
              to="/?i=unemployment-rate"
              className="flex items-center min-h-[44px] min-w-[44px] text-sm text-olowek hover:text-tusz hover:underline transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Rynek pracy (stopa bezrobocia)
            </Link>
            <Link
              to="/?i=avg-wage"
              className="flex items-center min-h-[44px] min-w-[44px] text-sm text-olowek hover:text-tusz hover:underline transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Pieniądze (wynagrodzenia)
            </Link>
            <Link
              to="/?i=dwellings-per-1000"
              className="flex items-center min-h-[44px] min-w-[44px] text-sm text-olowek hover:text-tusz hover:underline transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Mieszkania (nowe lokale)
            </Link>
            <Link
              to="/?i=forest-cover"
              className="flex items-center min-h-[44px] min-w-[44px] text-sm text-olowek hover:text-tusz hover:underline transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Środowisko (lesistość)
            </Link>
            <Link
              to="/?i=preschool-3-6"
              className="flex items-center min-h-[44px] min-w-[44px] text-sm text-olowek hover:text-tusz hover:underline transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Edukacja (wychowanie przedszkolne)
            </Link>
            <Link
              to="/?i=cars-per-1000"
              className="flex items-center min-h-[44px] min-w-[44px] text-sm text-olowek hover:text-tusz hover:underline transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Transport (samochody osobowe)
            </Link>
          </nav>

          {/* Kolumna 4: Dokumentacja */}
          <nav aria-label="Dokumentacja" className="flex flex-col gap-1">
            <h2 className="text-sm font-[700] text-tusz mb-2">Dokumentacja</h2>
            <Link
              to="/o-projekcie"
              className="flex items-center min-h-[44px] min-w-[44px] text-sm text-olowek hover:text-tusz hover:underline transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              O projekcie
            </Link>
            <Link
              to="/zrodla"
              className="flex items-center min-h-[44px] min-w-[44px] text-sm text-olowek hover:text-tusz hover:underline transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Skąd są dane
            </Link>
            <Link
              to="/prywatnosc"
              className="flex items-center min-h-[44px] min-w-[44px] text-sm text-olowek hover:text-tusz hover:underline transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Prywatność i zgoda
            </Link>
            <a
              href="https://github.com/olubiec/faktografia-atlas"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center min-h-[44px] min-w-[44px] text-sm text-olowek hover:text-tusz hover:underline transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
