import { Link } from 'react-router';
import { SiteLayout } from './layout/SiteLayout';
import { PageMeta } from './layout/PageMeta';

export function NotFound() {
  return (
    <SiteLayout>
      <PageMeta title="Nie znaleziono strony (404)" />
      <div className="p-4 md:p-8 flex flex-col items-center justify-center text-center py-20">
        <h1 className="text-4xl font-[800] mb-4">Błąd 404</h1>
        <p className="text-lg font-[500] mb-8">Nie znaleziono takiej strony.</p>
        <Link
          to="/"
          className="px-6 py-3 border border-tusz bg-tusz text-kalka hover:bg-tusz/90 transition-colors min-h-[44px] flex items-center justify-center"
        >
          Wróć na stronę główną
        </Link>
      </div>
    </SiteLayout>
  );
}
