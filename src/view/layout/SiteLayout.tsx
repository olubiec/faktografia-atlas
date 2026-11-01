import type { ReactNode } from 'react';
import { Header } from '../Header';
import { SiteFooter } from './SiteFooter';
import { PageMeta, type PageMetaProps } from './PageMeta';
import { cn } from '@/lib/utils';

export interface SiteLayoutProps {
  children: ReactNode;
  className?: string;
  meta?: PageMetaProps;
}

/**
 * Wspólny układ stron portalu Faktografia Atlas.
 * Zawiera skip-link „Przejdź do treści” w sekcji nawigacji, nagłówek Header, kontener główny main oraz stopkę SiteFooter.
 */
export function SiteLayout({ children, className, meta }: SiteLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-kalka text-tusz">
      <nav aria-label="Nawigacja bezpośrednia">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-tusz focus:text-arkusz focus:min-h-[44px] focus:min-w-[44px] focus:inline-flex focus:items-center rounded-none border border-linia focus:outline-none focus:ring-2 focus:ring-tusz"
        >
          Przejdź do treści
        </a>
      </nav>
      {meta && <PageMeta {...meta} />}
      <Header />
      <main id="main-content" className={cn('flex-grow', className)}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
