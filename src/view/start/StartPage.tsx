import { useEffect, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router';
import { isMapPreloaded, preloadMap } from './preloadMap';
import { StartBackground } from './StartBackground';
import { useReducedMotion } from '@/view/map/hooks/useReducedMotion';
import { SiteLayout } from '../layout/SiteLayout';
import { homeSearch } from '@/core/url/home';
import { START_PAIRS, START_PLACES } from '@/core/start/examples';

const STEPS = [
  '1. Wybierz dane, np. bezrobocie albo ludność.',
  '2. Dotknij miejsca na mapie.',
  '3. Zobacz profil i porównaj z innym miejscem.',
];

const CHIP =
  'inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-4 bg-arkusz border border-linia text-tusz font-medium hover:bg-linia/20 rounded-none focus:outline-none focus:ring-2 focus:ring-tusz';

/** Nazwa wspólnego elementu przejścia widoku (stara i nowa strona mają ją na jednym elemencie). */
function nameForTransition(selector: string) {
  document.querySelector<HTMLElement>(selector)?.style.setProperty('view-transition-name', 'poland-map');
}

/** Dopisuje do linku parametry techniczne (`e2e`, `logo`, `tune`) z bieżącego adresu. */
function withTech(href: string, search: string): string {
  const tech = homeSearch(search);
  if (!tech) return href;
  return href + (href.includes('?') ? '&' : '?') + tech.slice(1);
}

/**
 * Prosty ekran startowy (`/`): tytuł, jedno zdanie, 3 kroki, przycisk „Otwórz mapę” i przykłady.
 * Tło: animowany obrys Polski (dwa małe pliki: obrys i start.json), bez kodu mapy i bez wartości wskaźników.
 * „Otwórz mapę”: od razu nawigacja z przejściem widoku (lekkie przybliżenie opisane w global.css).
 */
export function StartPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const to = (href: string) => withTech(href, search);

  // Po wczytaniu strony (w wolnej chwili) pobieramy kod mapy w tle.
  useEffect(() => {
    const id = window.setTimeout(preloadMap, 600);
    return () => window.clearTimeout(id);
  }, []);

  const openMap = (e: MouseEvent<HTMLAnchorElement>) => {
    // Kliknięcie z klawiszem (nowa karta) i brak animacji (reduced-motion): zwykła nawigacja linku.
    if (reduced.current || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const go = () => navigate(to('/mapa'));
    if (typeof document.startViewTransition !== 'function') return go();
    // Kod mapy jeszcze się pobiera: nie każemy czekać, wchodzimy od razu (zwykła nawigacja).
    if (!isMapPreloaded()) return go();
    // Ten sam obrys Polski co w tle „rośnie” w mapę: wspólna nazwa przejścia (opis w global.css).
    nameForTransition('[data-slot="start-background"] svg');
    document.startViewTransition(async () => {
      flushSync(go);
      nameForTransition('main');
      // Dajemy mapie dwie klatki na pierwszy render, zanim przeglądarka zrobi „zdjęcie” nowego widoku.
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    });
  };

  return (
    <SiteLayout
      meta={{
        title: 'Faktografia',
        description: 'Zobacz, jak wypada Twoja gmina na tle całej Polski, na danych GUS.',
      }}
    >
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 mx-auto flex w-full max-w-3xl justify-center px-4 pt-6 md:px-8">
          <StartBackground />
        </div>
      <div className="max-w-3xl mx-auto w-full px-4 md:px-8 py-10 md:py-16 flex flex-col gap-10">
        <section className="flex flex-col gap-4 bg-kalka/80 p-4">
          <h1 className="text-4xl md:text-5xl font-[800] text-tusz tracking-tight">Faktografia</h1>
          <p className="text-lg md:text-xl text-tusz">
            Zobacz, jak wypada Twoja gmina na tle całej Polski, na danych GUS.
          </p>
        </section>

        <ol className="flex flex-col gap-2 list-none p-0 m-0 text-base text-tusz bg-kalka/80 p-4">
          {STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <div>
          <Link
            to={to('/mapa')}
            onClick={openMap}
            onPointerEnter={preloadMap}
            onTouchStart={preloadMap}
            onFocus={preloadMap}
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-6 py-3 border border-tusz bg-tusz text-arkusz font-bold hover:bg-tusz/90 transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-tusz focus:ring-offset-2 focus:ring-offset-kalka"
          >
            Otwórz mapę
          </Link>
        </div>

        <section aria-labelledby="start-examples" className="flex flex-col gap-6 border-t border-linia pt-8">
          <h2 id="start-examples" className="text-xl font-bold text-tusz tracking-tight">
            Przykłady
          </h2>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-olowek">Zobacz miejsce</h3>
            <div className="flex flex-wrap gap-2">
              {START_PLACES.map((p) => (
                <Link key={p.teryt} to={to(p.href)} className={CHIP}>
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-olowek">Porównaj dwa miejsca</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {START_PAIRS.map((p) => (
                <Link key={p.href} to={to(p.href)} className={`${CHIP} justify-between gap-3`}>
                  <span className="truncate">{p.name1}</span>
                  <span className="text-sm text-olowek shrink-0">vs</span>
                  <span className="truncate text-right">{p.name2}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
      </div>
    </SiteLayout>
  );
}
