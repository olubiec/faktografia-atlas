import { Header } from './Header';
import { SearchField } from './ui/SearchField';
import { Annotate } from './annotation/Annotate';
import { AnnotationProvider } from './annotation/AnnotationProvider';
import { UNIT_COUNTS } from '@/core/units/counts';

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
              <Annotate type="underline">{UNIT_COUNTS.gmi} gmin</Annotate>. Dane z Banku Danych Lokalnych, aktualizowane co noc.
            </p>

            <div className="flex flex-col gap-2 w-full max-w-[480px] pt-2">
              <div className="relative flex items-center w-full">
                <SearchField
                  id="home-search-field"
                  label="Szukaj miejsca"
                  placeholder="Wpisz nazwę gminy, powiatu albo miejscowości"
                  className="pr-20"
                  readOnly
                />
                <span className="absolute right-3 bottom-2.5 pointer-events-none px-1.5 py-0.5 border border-linia bg-arkusz text-olowek text-xs font-mono">
                  Ctrl K
                </span>
              </div>
              <p className="text-xs text-olowek">albo kliknij region na mapie</p>
            </div>

            <p className="text-xs font-[400] text-olowek leading-[1.5] pt-6 md:pt-12">
              Źródło: GUS, Bank Danych Lokalnych. Licencja CC BY 4.0. Granice jednostek: domena publiczna.
            </p>
          </section>

          {/* Right section (kalka SVG mask) */}
          <div
            className="w-full md:w-[calc(100%-560px)] h-[320px] md:h-[580px] bg-tusz flex-shrink-0"
            style={{
              maskImage: 'url(/geo/kalka.svg)',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              maskSize: 'contain',
              WebkitMaskImage: 'url(/geo/kalka.svg)',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              WebkitMaskSize: 'contain',
            }}
            aria-hidden="true"
          />
        </main>
      </div>
    </AnnotationProvider>
  );
}
