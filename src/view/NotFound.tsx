import { Header } from './Header';
import { Link } from 'react-router';

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow p-4 md:p-8 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-[800] mb-4">Błąd 404</h1>
        <p className="text-lg font-[500] mb-8">Nie znaleziono takiej strony.</p>
        <Link
          to="/"
          className="px-6 py-3 border border-tusz bg-tusz text-kalka hover:bg-tusz/90 transition-colors"
        >
          Wróć na stronę główną
        </Link>
      </main>
    </div>
  );
}
