import { Header } from '../Header';

export function Sources() {
  return (
    <div className="min-h-screen flex flex-col bg-kalka text-tusz">
      <Header />
      <main className="flex-grow p-4 md:p-8 max-w-4xl mx-auto w-full">
        <article className="max-w-[70ch] space-y-6">
          <h1 className="text-3xl font-[800] leading-[1.05] tracking-[-0.02em]">
            Skąd są dane
          </h1>
          <section className="space-y-3">
            <h2 className="text-lg font-[700] leading-[1.3]">
              Dane statystyczne: Główny Urząd Statystyczny (GUS BDL)
            </h2>
            <p className="text-sm font-[400] leading-[1.6]">
              Dane statystyczne pochodzą z Banku Danych Lokalnych Głównego Urzędu Statystycznego
              (BDL GUS). Są one udostępniane na licencji{' '}
              <a
                href="https://bdl.stat.gov.pl"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-olowek"
              >
                CC BY 4.0 (bdl.stat.gov.pl)
              </a>
              . Dane na stronie są aktualizowane automatycznie każdej nocy przez robota.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-[700] leading-[1.3]">
              Granice jednostek administracyjnych
            </h2>
            <p className="text-sm font-[400] leading-[1.6]">
              Geometria podziału administracyjnego Polski (województwa, powiaty, gminy) pochodzi z
              otwartego repozytorium GeoJSON-Polska-Wojewodztwa-Powiaty-Gminy i znajduje się w
              domenie publicznej (Public Domain).
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}
