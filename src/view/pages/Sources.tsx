import { Header } from '../Header';
import { Link } from 'react-router';
import { SourcesIndicatorTable } from './SourcesIndicatorTable';

export function Sources() {
  return (
    <div className="min-h-screen flex flex-col bg-kalka text-tusz">
      <Header />
      <main className="flex-grow p-4 md:p-8 max-w-4xl mx-auto w-full">
        <article className="max-w-full space-y-12">
          <header className="flex flex-col gap-4 pb-4">
            <h1 className="text-4xl font-[800] leading-[1.05] tracking-[-0.02em]">
              Skąd są dane
            </h1>
            <p className="text-base font-[400] leading-[1.6] max-w-[70ch]">
              Faktografia Atlas to projekt oparty w całości na otwartych danych publicznych. Poniżej znajduje się pełna lista rejestrów wykorzystywanych w serwisie.
            </p>
          </header>

          <section className="space-y-6 max-w-[70ch]">
            <div className="p-6 border border-linia bg-kalka flex flex-col gap-3">
              <h2 className="text-xl font-[700] leading-[1.3]">
                Bank Danych Lokalnych (GUS)
              </h2>
              <p className="text-sm font-[400] leading-[1.6]">
                Główne źródło danych statystycznych. Są one pobierane automatycznie (robota odpytująca API)
                i udostępniane na licencji{' '}
                <a
                  href="https://bdl.stat.gov.pl"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-olowek text-korekta-tekst font-medium min-h-[44px] inline-flex items-center"
                >
                  CC BY 4.0 (bdl.stat.gov.pl)
                </a>
                .
              </p>
            </div>

            <div className="p-6 border border-linia bg-kalka flex flex-col gap-3">
              <h2 className="text-xl font-[700] leading-[1.3]">
                TERYT SIMC
              </h2>
              <p className="text-sm font-[400] leading-[1.6]">
                System identyfikatorów i nazw miejscowości (SIMC) wykorzystywany do poprawnego nazewnictwa w wyszukiwarce.
                Otwarte dane Głównego Urzędu Statystycznego (eteryt.stat.gov.pl).
              </p>
            </div>

            <div className="p-6 border border-linia bg-kalka flex flex-col gap-3">
              <h2 className="text-xl font-[700] leading-[1.3]">
                GUGiK PRNG
              </h2>
              <p className="text-sm font-[400] leading-[1.6]">
                Państwowy Rejestr Nazw Geograficznych wykorzystywany do określania współrzędnych geograficznych miejscowości
                na mapie. Otwarte dane Głównego Urzędu Geodezji i Kartografii.
              </p>
            </div>

            <div className="p-6 border border-linia bg-kalka flex flex-col gap-3">
              <h2 className="text-xl font-[700] leading-[1.3]">
                Granice TopoJSON
              </h2>
              <p className="text-sm font-[400] leading-[1.6]">
                Geometria podziału administracyjnego Polski (województwa, powiaty, gminy) pochodzi z
                otwartego repozytorium GeoJSON-Polska-Wojewodztwa-Powiaty-Gminy i znajduje się w
                domenie publicznej (Public Domain).
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <header className="max-w-[70ch]">
              <h2 className="text-2xl font-[700] leading-[1.3] mb-4">
                Wskaźniki główne
              </h2>
              <p className="text-sm font-[400] leading-[1.6] mb-6">
                Poniższa tabela przedstawia wykaz 20 wskaźników głównych wbudowanych w aplikację.
              </p>
            </header>

            <SourcesIndicatorTable />
          </section>
        </article>
      </main>
      <footer className="py-8 px-4 border-t border-linia mt-16 text-center text-sm">
        <div className="flex gap-4 justify-center">
          <Link to="/o-projekcie" className="hover:underline">O projekcie</Link>
          <Link to="/zrodla" className="hover:underline">Źródła</Link>
          <Link to="/prywatnosc" className="hover:underline">Prywatność</Link>
        </div>
      </footer>
    </div>
  );
}
