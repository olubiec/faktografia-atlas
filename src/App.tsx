import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { Home } from './view/Home';
import { NotFound } from './view/NotFound';
import { ErrorBoundary } from './view/layout/ErrorBoundary';
import { routeKeyFromHref, prefetchRoute, routeChunks } from './view/layout/route-chunks';
import { ConsentBar } from './view/consent/ConsentBar';

// Strony inne niż Home ładowane na żądanie (mniejszy start).
const About = lazy(() => routeChunks.About().then((m) => ({ default: m.About })));
const Sources = lazy(() => routeChunks.Sources().then((m) => ({ default: m.Sources })));
const Privacy = lazy(() => routeChunks.Privacy().then((m) => ({ default: m.Privacy })));
const Rankings = lazy(() => routeChunks.Rankings().then((m) => ({ default: m.Rankings })));
const ComparePage = lazy(() => routeChunks.ComparePage().then((m) => ({ default: m.ComparePage })));
// Library zostaje z literalnym importem (pilnuje tego startup-weight.test.ts); to ten sam moduł co w routeChunks.
const Library = lazy(() => import('./view/pages/Library').then((m) => ({ default: m.Library })));
const LibraryVariable = lazy(() =>
  routeChunks.LibraryVariable().then((m) => ({ default: m.LibraryVariable })),
);
const Contact = lazy(() => routeChunks.Contact());
const DataDisclaimer = lazy(() => routeChunks.DataDisclaimer());
const DesignPage = lazy(() =>
  import('./view/design/DesignPage').then((m) => ({ default: m.DesignPage })),
);
const AnnotationTestPage = lazy(() =>
  import('./view/test/AnnotationTestPage').then((m) => ({ default: m.AnnotationTestPage })),
);
const UiTestPage = lazy(() => import('./view/test/UiTestPage'));
const InteractiveTestPage = lazy(() =>
  import('./view/test/InteractiveTestPage').then((m) => ({ default: m.InteractiveTestPage })),
);

/** Zajmuje stałe miejsce na czas ładowania strony (bez skakania układu). */
export function PageFallback() {
  // Landmark main i h1 od pierwszej chwili: czytnik ekranu i axe nie trafiają na pustą stronę.
  return (
    <main
      id="main-content"
      tabIndex={-1}
      data-testid="page-fallback"
      className="min-h-[50vh] bg-arkusz"
      aria-busy="true"
    >
      <h1 className="sr-only">Wczytywanie strony…</h1>
      <p role="status" aria-live="polite" className="sr-only">
        Wczytywanie strony…
      </p>
    </main>
  );
}

/** Strona 404 z blokadą indeksowania (tag meta trafia do <head>). */
function NotFoundRoute() {
  return (
    <>
      <meta name="robots" content="noindex" />
      <NotFound />
    </>
  );
}

/** Prefetch kodu podstrony po najechaniu lub fokusie na link (nie przy saveData). */
function usePrefetchOnIntent() {
  useEffect(() => {
    const onIntent = (e: Event) => {
      const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      if (conn?.saveData === true) return;
      if (!(e.target instanceof Element)) return;
      const a = e.target.closest('a[href]');
      if (!a) return;
      const key = routeKeyFromHref(a.getAttribute('href') ?? '', window.location.origin);
      if (key) void prefetchRoute(key);
    };
    document.addEventListener('pointerover', onIntent);
    document.addEventListener('focusin', onIntent);
    return () => {
      document.removeEventListener('pointerover', onIntent);
      document.removeEventListener('focusin', onIntent);
    };
  }, []);
}

export function AppRoutes() {
  usePrefetchOnIntent();
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/o-projekcie" element={<About />} />
          <Route path="/zrodla" element={<Sources />} />
          <Route path="/prywatnosc" element={<Privacy />} />
          <Route path="/kontakt" element={<Contact />} />
          <Route path="/zastrzezenie" element={<DataDisclaimer />} />
          <Route path="/rankingi" element={<Rankings />} />
          <Route path="/porownaj" element={<ComparePage />} />
          <Route path="/biblioteka" element={<Library />} />
          <Route path="/biblioteka/:id" element={<LibraryVariable />} />
          <Route path="/design" element={<DesignPage />} />
          <Route path="/__test/ui" element={<UiTestPage />} />
          <Route path="/__test/annotation" element={<AnnotationTestPage />} />
          <Route path="/__test/interactive" element={<InteractiveTestPage />} />
          <Route path="*" element={<NotFoundRoute />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ConsentBar />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
