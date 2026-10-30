import { Link } from 'react-router';

export function SiteFooter() {
  return (
    <footer className="border-t border-linia bg-arkusz text-tusz p-4 md:p-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Kolumna 1: Logo i misja */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center min-h-[44px]">
            <img
              src="/brand/faktografia-logo-granat.svg"
              alt="Faktografia"
              className="h-[28px] w-auto block dark:hidden"
            />
            <img
              src="/brand/faktografia-logo-jasne.svg"
              alt="Faktografia"
              className="h-[28px] w-auto hidden dark:block"
            />
          </Link>
          <p className="text-sm">
            Faktografia Atlas to prosta w obsłudze interaktywna mapa Polski przedstawiająca dane z GUS na poziomie gmin i powiatów.
          </p>
          <p className="text-xs">
            Dane z Banku Danych Lokalnych GUS na licencji{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/deed.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-korekta min-h-[44px] inline-flex items-center"
            >
              CC BY 4.0
            </a>.
          </p>
        </div>

        {/* Kolumna 2: Narzędzia */}
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-sm mb-2">Narzędzia</h2>
          <Link to="/" className="text-sm hover:underline min-h-[44px] flex items-center">
            Mapa Polski
          </Link>
          <Link to="/rankingi" className="text-sm hover:underline min-h-[44px] flex items-center">
            Rankingi
          </Link>
          <Link to="/porownaj" className="text-sm hover:underline min-h-[44px] flex items-center">
            Porównaj
          </Link>
          <Link to="/biblioteka" className="text-sm hover:underline min-h-[44px] flex items-center">
            Biblioteka
          </Link>
        </div>

        {/* Kolumna 3: Działy tematyczne GUS */}
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-sm mb-2">Tematy</h2>
          <Link to="/?i=population" className="text-sm hover:underline min-h-[44px] flex items-center">
            Ludność ogółem
          </Link>
          <Link to="/?i=density" className="text-sm hover:underline min-h-[44px] flex items-center">
            Gęstość zaludnienia
          </Link>
          <Link to="/?i=unemployment-rate" className="text-sm hover:underline min-h-[44px] flex items-center">
            Stopa bezrobocia
          </Link>
          <Link to="/?i=avg-wage" className="text-sm hover:underline min-h-[44px] flex items-center">
            Przeciętne wynagrodzenie
          </Link>
          <Link to="/?i=dwellings-per-1000" className="text-sm hover:underline min-h-[44px] flex items-center">
            Nowe mieszkania
          </Link>
          <Link to="/?i=forest-cover" className="text-sm hover:underline min-h-[44px] flex items-center">
            Lesistość
          </Link>
          <Link to="/?i=cars-per-1000" className="text-sm hover:underline min-h-[44px] flex items-center">
            Samochody osobowe
          </Link>
        </div>

        {/* Kolumna 4: Dokumentacja */}
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-sm mb-2">Projekt</h2>
          <Link to="/o-projekcie" className="text-sm hover:underline min-h-[44px] flex items-center">
            O projekcie
          </Link>
          <Link to="/zrodla" className="text-sm hover:underline min-h-[44px] flex items-center">
            Skąd są dane
          </Link>
          <Link to="/prywatnosc" className="text-sm hover:underline min-h-[44px] flex items-center">
            Prywatność i zgoda
          </Link>
          <a
            href="https://github.com/olubiec/faktografia-atlas"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:underline min-h-[44px] flex items-center"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
