import { Link } from 'react-router';
import { SiteLayout } from './layout/SiteLayout';

export function NotFound() {
  return (
    <SiteLayout
      className="p-4 md:p-8 flex flex-col items-center justify-center text-center"
      meta={{
        title: 'Błąd 404',
        description: 'Nie znaleziono żądanej strony w serwisie Faktografia Atlas.',
      }}
    >
      <div className="max-w-md mx-auto py-12 flex flex-col items-center">
        <h1 className="text-4xl font-[800] mb-4 text-tusz">Błąd 404</h1>
        <p className="text-lg font-[500] mb-4 text-tusz">Nie znaleziono takiej strony w serwisie.</p>
        <p className="text-sm text-olowek mb-8">
          Ustawienia motywu (<code className="font-mono bg-arkusz px-1 border border-linia">faktografia-theme</code>) oraz zgody (<code className="font-mono bg-arkusz px-1 border border-linia">fa-consent-v1</code>) w Twojej przeglądarce pozostają bez zmian.
        </p>
        <Link
          to="/"
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-6 py-3 border border-tusz bg-tusz text-arkusz hover:bg-tusz/90 transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
        >
          Wróć na stronę główną
        </Link>
      </div>
    </SiteLayout>
  );
}
