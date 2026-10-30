import React from 'react';
import { Header } from '../Header';
import { SiteFooter } from './SiteFooter';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-kalka text-tusz relative">
      <a
        href="#main-content"
        className="absolute top-0 left-0 -translate-y-full focus:translate-y-0 z-50 bg-tusz text-kalka p-4 font-bold transition-transform"
      >
        Przejdź do treści
      </a>
      <Header />
      <main id="main-content" className="flex-grow flex flex-col w-full">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
