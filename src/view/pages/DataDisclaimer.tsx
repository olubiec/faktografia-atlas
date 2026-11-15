import { Link } from 'react-router';
import { SiteLayout } from '../layout/SiteLayout';

const LINK_CLASS =
  'inline-flex items-center min-h-[44px] underline hover:text-tusz rounded-none focus:outline-none focus:ring-2 focus:ring-tusz';

/** Zastrzeżenie o danych: źródło, licencja i brak gwarancji. */
export default function DataDisclaimer() {
  return (
    <SiteLayout
      className="p-4 md:p-8 pb-24 md:pb-32 max-w-4xl mx-auto w-full"
      meta={{
        title: 'Zastrzeżenie o danych',
        description: 'Źródło danych GUS Bank Danych Lokalnych, licencja CC BY 4.0 oraz zastrzeżenie o kompletności i aktualności danych w Faktografia Atlas.',
      }}
    >
      <article className="max-w-[70ch] space-y-6 text-tusz">
        <h1 className="text-3xl font-[800] leading-[1.05] tracking-[-0.02em]">Zastrzeżenie o danych</h1>

        <section className="space-y-3">
          <h2 className="text-lg font-[700] leading-[1.3]">Źródło i licencja</h2>
          <p className="text-sm text-olowek leading-[1.6]">
            Liczby pochodzą z Banku Danych Lokalnych (BDL) Głównego Urzędu Statystycznego. Dane GUS udostępniane są na
            licencji CC BY 4.0, a Faktografia Atlas zachowuje wymagane wskazanie źródła.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-[700] leading-[1.3]">Brak gwarancji</h2>
          <p className="text-sm text-olowek leading-[1.6]">
            Dane prezentujemy w stanie, w jakim je pobraliśmy, bez gwarancji kompletności i aktualności. Mogą zawierać
            braki, być zaokrąglone lub zostać skorygowane przez GUS po naszym ostatnim pobraniu. Przed ważną decyzją
            sprawdź wartość w źródle.
          </p>
          <p className="text-sm text-olowek leading-[1.6]">
            Datę ostatniego odświeżenia danych pokazuje wskaźnik daty odświeżenia w stopce serwisu.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-[700] leading-[1.3]">Jak zgłosić błąd</h2>
          <p className="text-sm text-olowek leading-[1.6]">
            Zauważyłeś nieprawidłową liczbę? Zgłoś to na stronie Kontakt.
          </p>
          <Link to="/kontakt" viewTransition className={LINK_CLASS}>
            Przejdź do strony Kontakt
          </Link>
        </section>
      </article>
    </SiteLayout>
  );
}
