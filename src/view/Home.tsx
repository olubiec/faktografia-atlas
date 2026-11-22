import { lazy, Suspense, useEffect, useState } from 'react';
import { Header } from './Header';
import { AnnotationProvider } from './annotation/AnnotationProvider';
import { PageMeta } from './layout/PageMeta';
import { loadUnits } from '@/core/data/load-atlas-data';
import { mapCanonicalPath } from '@/core/seo/unit-link';

const AtlasMap = lazy(() => import('./map/AtlasMap'));

const MAP_DESCRIPTION = 'Sprawdź dane swojej miejscowości i okolicy na tle całej Polski, na danych GUS.';

/**
 * Adres kanoniczny mapy (D6): przy `?u=<teryt>` strona miejsca, bez `u` – `/mapa`.
 * Lista jednostek to ta sama pamięć, którą wczytuje mapa (jedno żądanie units.json na aplikację).
 */
function useMapCanonical(): string {
  const [canonical, setCanonical] = useState('/mapa');
  useEffect(() => {
    const search = window.location.search;
    if (!new URLSearchParams(search).get('u')) return;
    let active = true;
    loadUnits()
      .then((units) => {
        if (active) setCanonical(mapCanonicalPath(search, units));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return canonical;
}

/**
 * Ekran główny (PRODUKT.md §3): panel wskaźnika po lewej, mapa na resztę szerokości.
 * Tytuł strony jest tylko dla czytników ekranu; opis i źródło są w panelu wskaźnika.
 */
export function Home() {
  const canonical = useMapCanonical();
  return (
    <AnnotationProvider>
      <PageMeta title="Mapa Polski z danymi GUS" description={MAP_DESCRIPTION} canonical={canonical} />
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
