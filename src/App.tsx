import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { Home } from './view/Home';
import { NotFound } from './view/NotFound';
import { ErrorBoundary } from './view/layout/ErrorBoundary';
import { ConsentBar } from './view/consent/ConsentBar';

// Strony inne niż Home ładowane na żądanie (mniejszy start).
const About = lazy(() => import('./view/pages/About').then((m) => ({ default: m.About })));
const Sources = lazy(() => import('./view/pages/Sources').then((m) => ({ default: m.Sources })));
const Privacy = lazy(() => import('./view/pages/Privacy').then((m) => ({ default: m.Privacy })));
const Rankings = lazy(() => import('./view/pages/Rankings').then((m) => ({ default: m.Rankings })));
const ComparePage = lazy(() =>
  import('./view/pages/ComparePage').then((m) => ({ default: m.ComparePage })),
);
const Library = lazy(() => import('./view/pages/Library').then((m) => ({ default: m.Library })));
const LibraryVariable = lazy(() =>
  import('./view/pages/LibraryVariable').then((m) => ({ default: m.LibraryVariable })),
);
const Contact = lazy(() => import('./view/pages/Contact'));
const DataDisclaimer = lazy(() => import('./view/pages/DataDisclaimer'));
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
  return <div data-testid="page-fallback" className="min-h-[50vh] bg-arkusz" aria-busy="true" />;
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

export function AppRoutes() {
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
