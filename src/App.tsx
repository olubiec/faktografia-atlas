import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router';
import { ConsentBar } from './view/consent/ConsentBar';
import { legacyRedirect } from './core/url/legacy-links';

// Ciężkie trasy (mapa, strony, test) ładują się leniwie: wejście na `/` nie pobiera kodu mapy.
const StartPage = lazy(() => import('./view/start/StartPage').then((m) => ({ default: m.StartPage })));
const Home = lazy(() => import('./view/Home').then((m) => ({ default: m.Home })));
const NotFound = lazy(() => import('./view/NotFound').then((m) => ({ default: m.NotFound })));
const About = lazy(() => import('./view/pages/About').then((m) => ({ default: m.About })));
const Sources = lazy(() => import('./view/pages/Sources').then((m) => ({ default: m.Sources })));
const Privacy = lazy(() => import('./view/pages/Privacy').then((m) => ({ default: m.Privacy })));
const Rankings = lazy(() => import('./view/pages/Rankings').then((m) => ({ default: m.Rankings })));
const ComparePage = lazy(() => import('./view/pages/ComparePage').then((m) => ({ default: m.ComparePage })));
const Library = lazy(() => import('./view/pages/Library').then((m) => ({ default: m.Library })));
const LibraryVariable = lazy(() => import('./view/pages/LibraryVariable').then((m) => ({ default: m.LibraryVariable })));
const DesignPage = lazy(() => import('./view/design/DesignPage').then((m) => ({ default: m.DesignPage })));
const AnnotationTestPage = lazy(() => import('./view/test/AnnotationTestPage').then((m) => ({ default: m.AnnotationTestPage })));
const UiTestPage = lazy(() => import('./view/test/UiTestPage'));
const InteractiveTestPage = lazy(() => import('./view/test/InteractiveTestPage').then((m) => ({ default: m.InteractiveTestPage })));
const PrototypePage = lazy(() => import('./view/test/PrototypePage').then((m) => ({ default: m.PrototypePage })));

/** `/`: stary link ze stanem mapy → `/mapa` (replace, bez pętli); w innym razie ekran startowy. */
function StartRoute() {
  const { pathname, search } = useLocation();
  const target = legacyRedirect(pathname, search);
  return target ? <Navigate to={target} replace /> : <StartPage />;
}

export function App() {
  return (
    <BrowserRouter>
      <ConsentBar />
      {/* Powłoka na czas ładowania ma landmark i nagłówek (testy axe skanują stronę zaraz po wejściu). */}
      <Suspense
        fallback={
          <main className="min-h-screen bg-kalka text-tusz">
            <h1 className="sr-only">Faktografia</h1>
          </main>
        }
      >
        <Routes>
          <Route path="/" element={<StartRoute />} />
          <Route path="/mapa" element={<Home />} />
          <Route path="/o-projekcie" element={<About />} />
          <Route path="/zrodla" element={<Sources />} />
          <Route path="/prywatnosc" element={<Privacy />} />
          <Route path="/rankingi" element={<Rankings />} />
          <Route path="/porownaj" element={<ComparePage />} />
          <Route path="/biblioteka" element={<Library />} />
          <Route path="/biblioteka/:id" element={<LibraryVariable />} />
          <Route path="/design" element={<DesignPage />} />
          <Route path="/__test/ui" element={<UiTestPage />} />
          <Route path="/__test/annotation" element={<AnnotationTestPage />} />
          <Route path="/__test/interactive" element={<InteractiveTestPage />} />
          <Route path="/__test/proto" element={<PrototypePage />} />
          <Route path="/__test/proto/:name" element={<PrototypePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
