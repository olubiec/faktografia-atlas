import { Link } from 'react-router';
import { SiteFooter } from '../layout/SiteFooter';
import { FeaturedComparisons } from './FeaturedComparisons';

export function PortalSections() {
  return (
    <div className="flex flex-col border-t border-linia">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-10 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Szybki start */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-tusz tracking-tight">Szybki start</h2>
          <p className="text-sm text-olowek">Wybierz miejsce, żeby zobaczyć jego profil na tle Polski:</p>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/?u=1465011"
              className="inline-flex items-center justify-center min-h-[44px] px-4 bg-arkusz border border-linia text-tusz font-medium hover:bg-linia/20 focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Warszawa
            </Link>
            <Link
              to="/?u=1261011"
              className="inline-flex items-center justify-center min-h-[44px] px-4 bg-arkusz border border-linia text-tusz font-medium hover:bg-linia/20 focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Kraków
            </Link>
            <Link
              to="/?u=1217"
              className="inline-flex items-center justify-center min-h-[44px] px-4 bg-arkusz border border-linia text-tusz font-medium hover:bg-linia/20 focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Powiat tatrzański
            </Link>
            <Link
              to="/?u=1001042"
              className="inline-flex items-center justify-center min-h-[44px] px-4 bg-arkusz border border-linia text-tusz font-medium hover:bg-linia/20 focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Kleszczów
            </Link>
            <Link
              to="/?u=2264011"
              className="inline-flex items-center justify-center min-h-[44px] px-4 bg-arkusz border border-linia text-tusz font-medium hover:bg-linia/20 focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Sopot
            </Link>
            <Link
              to="/?u=3217011"
              className="inline-flex items-center justify-center min-h-[44px] px-4 bg-arkusz border border-linia text-tusz font-medium hover:bg-linia/20 focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Wałcz
            </Link>
          </div>
        </section>

        {/* Działy tematyczne */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-tusz tracking-tight">Działy tematyczne GUS</h2>
          <p className="text-sm text-olowek">Zmień wskaźnik widoczny na mapie Polski:</p>
          <div className="flex flex-col gap-2">
            <Link
              to="/?i=density"
              className="flex items-center min-h-[44px] px-4 bg-arkusz border border-linia text-tusz hover:bg-linia/20 focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Ludność: Gęstość zaludnienia
            </Link>
            <Link
              to="/?i=unemployment-rate"
              className="flex items-center min-h-[44px] px-4 bg-arkusz border border-linia text-tusz hover:bg-linia/20 focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Praca: Stopa bezrobocia
            </Link>
            <Link
              to="/?i=avg-wage"
              className="flex items-center min-h-[44px] px-4 bg-arkusz border border-linia text-tusz hover:bg-linia/20 focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Pieniądze: Przeciętne wynagrodzenie
            </Link>
            <Link
              to="/?i=dwellings-per-1000"
              className="flex items-center min-h-[44px] px-4 bg-arkusz border border-linia text-tusz hover:bg-linia/20 focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Mieszkania: Nowe lokale
            </Link>
            <Link
              to="/?i=forest-cover"
              className="flex items-center min-h-[44px] px-4 bg-arkusz border border-linia text-tusz hover:bg-linia/20 focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Środowisko: Lesistość
            </Link>
            <Link
              to="/?i=preschool-3-6"
              className="flex items-center min-h-[44px] px-4 bg-arkusz border border-linia text-tusz hover:bg-linia/20 focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Życie: Wychowanie przedszkolne
            </Link>
            <Link
              to="/?i=cars-per-1000"
              className="flex items-center min-h-[44px] px-4 bg-arkusz border border-linia text-tusz hover:bg-linia/20 focus:outline-none focus:ring-2 focus:ring-tusz"
            >
              Transport: Samochody osobowe
            </Link>
          </div>
        </section>

        {/* Pojedynki miejsc */}
        <section className="flex flex-col gap-4 md:col-span-2">
          <h2 className="text-xl font-bold text-tusz tracking-tight">Pojedynki miejsc</h2>
          <p className="text-sm text-olowek">Porównaj ze sobą dwa wybrane miejsca jednym kliknięciem:</p>
          <FeaturedComparisons />
        </section>

        {/* Biblioteka */}
        <section className="flex flex-col gap-4 md:col-span-2 border border-linia bg-arkusz p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-tusz tracking-tight">Brama do Biblioteki GUS</h2>
              <p className="text-sm text-olowek max-w-2xl">
                Szukasz innych danych? W Bibliotece Faktografii znajdziesz ponad 64 000 zmiennych z Banku Danych Lokalnych.
              </p>
            </div>
            <Link
              to="/biblioteka"
              className="inline-flex items-center justify-center min-h-[44px] px-6 bg-tusz text-arkusz font-bold hover:bg-tusz/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tusz focus:ring-offset-kalka shrink-0"
            >
              Przeszukaj Bibliotekę
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
