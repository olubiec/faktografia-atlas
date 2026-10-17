import { lazy, Suspense } from 'react';
import { Header } from './Header';
import { SearchField } from './ui/SearchField';
import { Annotate } from './annotation/Annotate';
import { AnnotationProvider } from './annotation/AnnotationProvider';
import { UNIT_COUNTS } from '@/core/units/counts';

const AtlasMap = lazy(() => import('./map/AtlasMap'));

export function Home() {
  return (
    <AnnotationProvider>
      <div className="min-h-screen flex flex-col bg-kalka text-tusz overflow-x-hidden">
        <Header />

        <main className="flex-grow flex flex-col md:flex-row items-center justify-between p-6 md:p-12 lg:px-16 gap-8 max-w-[1440px] mx-auto w-full">
          {/* Left section (max-w-[560px]) */}
          <section className="w-full md:max-w-[560px] flex flex-col gap-6 z-10">
            <h1 className="text-3xl md:text-5xl font-[800] leading-[1.05] tracking-[-0.02em]">
              Mapa Polski z danymi GUS
            </h1>

            <p className="text-md md:text-lg font-[500] leading-[1.3]">
              {UNIT_COUNTS.woj} województw, {UNIT_COUNTS.pow} powiatów i{' '}
              <span className="whitespace-nowrap">
                <Annotate type="underline">{UNIT_COUNTS.gmi} gmin</Annotate>
              </span>
              . Dane z Banku Danych Lokalnych, aktualizowane co noc.
            </p>

            <div className="flex flex-col gap-2 w-full max-w-[560px] pt-2">
              <div className="relative flex items-center w-full">
                <SearchField
                  id="home-search-field"
                  label="Szukaj miejsca"
                  placeholder="Gmina, powiat albo miejscowość"
                  className="pr-20"
                  readOnly
                />
                <span className="absolute right-3 bottom-2.5 hidden md:inline pointer-events-none px-1.5 py-0.5 border border-linia bg-arkusz text-olowek text-xs font-mono">
                  Ctrl K
                </span>
              </div>
              <p className="text-xs text-olowek">albo kliknij region na mapie</p>
            </div>

            <p className="text-xs font-[400] text-olowek leading-[1.5] pt-6 md:pt-12">
              Źródło: GUS, Bank Danych Lokalnych. Licencja CC BY 4.0. Granice jednostek: domena publiczna.
            </p>
          </section>

          {/* Right section (interactive map) */}
          <div className="w-full md:flex-1 h-[320px] md:h-[min(780px,calc(100vh-150px))] flex-shrink-0 relative">
            <Suspense fallback={<div className="w-full h-full bg-kalka" />}>
              <AtlasMap />
            </Suspense>
          </div>
        </main>
      </div>
    </AnnotationProvider>
  );
}
