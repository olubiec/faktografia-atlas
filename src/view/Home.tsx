import { lazy, Suspense } from 'react';
import { Header } from './Header';
import { AnnotationProvider } from './annotation/AnnotationProvider';
import { MapCanonical } from './layout/MapCanonical';

const AtlasMap = lazy(() => import('./map/AtlasMap'));

/**
 * Ekran główny (PRODUKT.md §3): panel wskaźnika po lewej, mapa na resztę szerokości.
 * Tytuł strony jest tylko dla czytników ekranu; opis i źródło są w panelu wskaźnika.
 */
export function Home() {
  return (
    <AnnotationProvider>
      <MapCanonical />
      <div className="h-screen h-dvh flex flex-col bg-kalka text-tusz overflow-hidden relative" style={{ overflowY: 'auto' }}>
        <Header />
        <main className="flex-1 min-h-0 flex flex-col relative min-h-[calc(100dvh-56px)] md:min-h-[calc(100dvh-72px)]">
          <h1 className="sr-only">Mapa Polski z danymi GUS</h1>
          <div className="absolute inset-0 flex flex-col">
            <Suspense fallback={<div className="w-full flex-1 bg-kalka" />}>
              <AtlasMap />
            </Suspense>
          </div>
        </main>
      </div>
    </AnnotationProvider>
  );
}
