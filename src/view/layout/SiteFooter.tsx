import { useRef, useSyncExternalStore } from 'react';
import type { DataStatus } from '../../core/data/load-status';
import { LinkList, type LinkListItem } from '../ui/LinkList';
import { PageSection } from '../ui/PageSection';
import { DataFreshness } from './DataFreshness';
import { useDataStatus } from './useDataStatus';

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

/** Stopka: najwyżej 6 linków, bez powtórzeń nagłówka i bez działów tematycznych. */
const FOOTER_LINKS: LinkListItem[] = [
  { to: '/mapa', label: 'Mapa' },
  { to: '/o-projekcie', label: 'O projekcie' },
  { to: '/zrodla', label: 'Skąd są dane' },
  { to: '/prywatnosc', label: 'Prywatność i zgoda' },
  { to: 'https://github.com/olubiec/faktografia-atlas', label: 'GitHub' },
  { to: 'https://creativecommons.org/licenses/by/4.0/deed.pl', label: 'CC BY 4.0' },
];

interface SiteFooterProps {
  /** Na stronie głównej logo jest już w nagłówku – w stopce ma być dekoracyjne (alt=""), by nie dublować go dla czytników. */
  decorativeLogo?: boolean;
  /** Status danych podany z góry (testy); gdy brak, stopka pobiera `status.json` po zamontowaniu. */
  initialStatus?: DataStatus | null;
}

export function SiteFooter({ decorativeLogo = false, initialStatus }: SiteFooterProps = {}) {
  const footerRef = useRef<HTMLElement>(null);
  const status = useDataStatus(footerRef, initialStatus);
  const isDark = useSyncExternalStore(subscribeTheme, getIsDark, () => false);
  const logoSrc = isDark ? '/brand/faktografia-logo-jasne.svg' : '/brand/faktografia-logo-granat.svg';

  return (
    <footer
      ref={footerRef}
      role="contentinfo"
      className="border-t border-linia bg-arkusz text-tusz mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-12">
        <img
          src={logoSrc}
          alt={decorativeLogo ? '' : 'Faktografia'}
          className="h-10 md:h-12 w-auto -ml-3"
          width={160}
          height={32}
        />
        <p className="mt-4 max-w-prose text-sm font-[400] text-olowek leading-[1.6]">
          Faktografia to niezależna, interaktywna mapa Polski prezentująca rzetelne statystyki GUS dla każdego województwa, powiatu i gminy. Dane i opracowanie na licencji CC BY 4.0.
        </p>
        <PageSection title="Strony" variant="panel">
          <LinkList items={FOOTER_LINKS} label="Stopka" />
        </PageSection>
        <DataFreshness status={status} className="mt-6" />
      </div>
    </footer>
  );
}
