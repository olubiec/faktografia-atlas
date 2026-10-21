import { lazy, Suspense } from 'react';
import { Header } from './Header';
import { AnnotationProvider } from './annotation/AnnotationProvider';

const AtlasMap = lazy(() => import('./map/AtlasMap'));

/**
 * Ekran główny (PRODUKT.md §3): panel wskaźnika po lewej, mapa na resztę szerokości.
 * Tytuł strony jest tylko dla czytników ekranu; opis i źródło są w panelu wskaźnika.
 */
export function Home() {
  return (
    <AnnotationProvider>
      <div className="h-screen h-dvh flex flex-col bg-kalka text-tusz overflow-hidden relative">
        <Header />
        <main className="flex-1 min-h-0 flex flex-col">
          <h1 className="sr-only">Mapa Polski z danymi GUS</h1>
          <Suspense fallback={<div className="w-full flex-1 bg-kalka" />}>
            <AtlasMap />
          </Suspense>
        </main>

        <div data-slot="bottom" />
        <div data-slot="overlay" />
      </div>
    </AnnotationProvider>
  );
}
