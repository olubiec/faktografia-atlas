import { useSyncExternalStore } from 'react';
import { Link } from 'react-router';
import { NavArrowDown } from 'iconoir-react';
import { Icon } from '../ui/Icon';
import { useIsMobile } from '../hooks/useIsMobile';

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

const LINK_CLASS =
  'flex items-center min-h-[44px] min-w-[44px] text-sm text-olowek hover:text-tusz hover:underline transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-tusz';

type FooterLink = { to: string; label: string; external?: boolean };

// Trzy grupy linków (kolejność i adresy bez zmian)
const GROUPS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Narzędzia',
    links: [
      { to: '/', label: 'Mapa Polski' },
      { to: '/rankingi', label: 'Rankingi' },
      { to: '/porownaj', label: 'Porównaj' },
      { to: '/biblioteka', label: 'Biblioteka' },
    ],
  },
  {
    // 7 głównych wskaźników GUS
    title: 'Działy tematyczne GUS',
    links: [
      { to: '/?i=density', label: 'Ludność (gęstość zaludnienia)' },
      { to: '/?i=unemployment-rate', label: 'Rynek pracy (stopa bezrobocia)' },
      { to: '/?i=avg-wage', label: 'Pieniądze (wynagrodzenia)' },
      { to: '/?i=dwellings-per-1000', label: 'Mieszkania (nowe lokale)' },
      { to: '/?i=forest-cover', label: 'Środowisko (lesistość)' },
      { to: '/?i=preschool-3-6', label: 'Edukacja (wychowanie przedszkolne)' },
      { to: '/?i=cars-per-1000', label: 'Transport (samochody osobowe)' },
    ],
  },
  {
    title: 'Dokumentacja',
    links: [
      { to: '/o-projekcie', label: 'O projekcie' },
      { to: '/zrodla', label: 'Skąd są dane' },
      { to: '/prywatnosc', label: 'Prywatność i zgoda' },
      { to: 'https://github.com/olubiec/faktografia-atlas', label: 'GitHub', external: true },
    ],
  },
];

/**
 * Grupa linków: na telefonie zwijana <details> (domyślnie zamknięta),
 * od tabletu zawsze rozwinięta, a nagłówek nie jest klikalny.
 */
function FooterGroup({ title, links, isMobile }: { title: string; links: FooterLink[]; isMobile: boolean }) {
  return (
    <nav aria-label={title}>
      <details open={!isMobile} className="group">
        <summary
          tabIndex={isMobile ? 0 : -1}
          onClick={(e) => {
            if (!isMobile) e.preventDefault();
          }}
          className="flex items-center justify-between min-h-[44px] md:min-h-0 list-none [&::-webkit-details-marker]:hidden cursor-pointer md:cursor-default md:pointer-events-none border-b border-linia md:border-b-0 text-tusz rounded-none focus:outline-none focus-visible:ring-2 focus-visible:ring-tusz"
        >
          <h2 className="text-sm font-[700] text-tusz md:mb-2">{title}</h2>
          <Icon
            icon={NavArrowDown}
            aria-hidden
            className="md:hidden group-open:rotate-180"
          />
        </summary>
        <div className="flex flex-col gap-1">
          {links.map((l) =>
            l.external ? (
              <a key={l.to} href={l.to} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                {l.label}
              </a>
            ) : (
              <Link key={l.to} to={l.to} className={LINK_CLASS}>
                {l.label}
              </Link>
            ),
          )}
        </div>
      </details>
    </nav>
  );
}

export function SiteFooter() {
  const isDark = useSyncExternalStore(subscribeTheme, getIsDark, () => false);
  const isMobile = useIsMobile();
  const logoSrc = isDark ? '/brand/faktografia-logo-jasne.svg' : '/brand/faktografia-logo-granat.svg';

  return (
    <footer
      role="contentinfo"
      className="border-t border-linia bg-arkusz text-tusz mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 md:gap-12">
          {/* Kolumna 1: Logo, opis misji portalu, licencja CC BY 4.0 */}
          <div className="flex flex-col gap-4 mb-2 md:mb-0">
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
            {/* Na telefonie opis ukryty, żeby zwinięta stopka była niska */}
            <p className="hidden md:block text-sm font-[400] text-olowek leading-[1.6]">
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

          {GROUPS.map((g) => (
            <FooterGroup key={g.title} title={g.title} links={g.links} isMobile={isMobile} />
          ))}
        </div>
      </div>
    </footer>
  );
}
