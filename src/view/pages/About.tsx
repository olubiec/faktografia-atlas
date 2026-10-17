import { Header } from '../Header';

export function About() {
  return (
    <div className="min-h-screen flex flex-col bg-kalka text-tusz">
      <Header />
      <main className="flex-grow p-4 md:p-8 max-w-4xl mx-auto w-full">
        <article className="max-w-[70ch] space-y-6">
          <h1 className="text-3xl font-[800] leading-[1.05] tracking-[-0.02em]">
            O projekcie
          </h1>
          <p className="text-sm font-[400] leading-[1.6]">
            Faktografia Atlas to interaktywna mapa Polski przedstawiająca dane statystyczne
            z Banku Danych Lokalnych Głównego Urzędu Statystycznego na poziomie województw,
            powiatów i gmin.
          </p>
          <p className="text-sm font-[400] leading-[1.6]">
            Projekt powstał z myślą o zapewnieniu rzetelnego i przystępnego dostępu do wiedzy
            o społecznościach lokalnych. Językiem wizualnym serwisu jest prostota i przejrzystość:
            dane są czyste i spokojne, a uwagę użytkownika kieruje pojedynczy, ręczny akcent.
          </p>
          <p className="text-sm font-[400] leading-[1.6]">
            Aplikacja umożliwia swobodne przeglądanie wskaźników społeczno-gospodarczych,
            wyszukiwanie jednostek administracyjnych oraz analizę zmian zachodzących w regionach.
          </p>
        </article>
      </main>
    </div>
  );
}
