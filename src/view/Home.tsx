import { lazy, Suspense } from 'react';
import { Header } from './Header';
import { AnnotationProvider } from './annotation/AnnotationProvider';

const AtlasMap = lazy(() => import('./map/AtlasMap'));

/**
 * Ekran główny (PRODUKT.md §3): panel wskaźnika po lewej, mapa na resztę szerokości.
 * Tytuł strony jest tylko dla czytników ekranu; opis i źródło są w panelu wskaźnika.
 */
import { PortalSections } from './home/PortalSections';
import { IntroOverlay } from './map/IntroOverlay';

export function Home() {
  return (
    <AnnotationProvider>
      <div className="h-screen h-dvh flex flex-col bg-kalka text-tusz overflow-hidden relative" style={{ overflowY: 'auto' }}>
        <Header />
        <main className="flex-1 min-h-0 flex flex-col relative min-h-[calc(100vh-64px)]">
          <h1 className="sr-only">Mapa Polski z danymi GUS</h1>
          <div className="absolute inset-0 flex flex-col">
            <Suspense fallback={<div className="w-full flex-1 bg-kalka" />}>
              <AtlasMap />
            </Suspense>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-arkusz/90 border border-linia px-4 py-2 text-sm text-olowek pointer-events-none text-center shadow-sm whitespace-nowrap hidden md:block z-[60]">
            Przewiń w dół: Działy tematyczne · Rekordy Polski · Pojedynki miejsc · Biblioteka
          </div>
        </main>

        <PortalSections />
        <IntroOverlay />
      </div>
    </AnnotationProvider>
  );
}
