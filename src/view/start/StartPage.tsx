import { useEffect, type MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { coverForMap } from './mapCover';
import { isFrugalNetwork, preloadMap, preloadMapData } from './preloadMap';
import { StartBackground } from './StartBackground';
import { useReducedMotion } from '@/view/map/hooks/useReducedMotion';
import { SiteLayout } from '../layout/SiteLayout';
import { Button } from '@/components/ui/button';
import { PageSection } from '@/view/ui/PageSection';
import { homeSearch } from '@/core/url/home';
import { START_PAIRS, START_PLACES } from '@/core/start/examples';

/** Dane mapy rozgrzewamy dopiero po tym czasie (po „networkidle” strony), żeby `/` ładowała się lekko. */
const DATA_PRELOAD_MS = 3000;

const STEPS = [
  '1. Wybierz dane, np. bezrobocie albo ludność.',
  '2. Dotknij miejsca na mapie.',
  '3. Zobacz profil i porównaj z innym miejscem.',
];

/** Hasło na banerze: o miejscowości i okolicy użytkownika. */
const TAGLINE = 'Sprawdź swoją miejscowość i okolicę.';

const CHIP = 'pointer-events-auto';

/** Dopisuje do linku parametry techniczne (`e2e`, `logo`, `tune`) z bieżącego adresu. */
function withTech(href: string, search: string): string {
  const tech = homeSearch(search);
  if (!tech) return href;
  return href + (href.includes('?') ? '&' : '?') + tech.slice(1);
}

/**
 * Prosty ekran startowy (`/`): baner z hasłem na dole mapy, 3 kroki, przycisk „Otwórz mapę” i przykłady.
 * Tło: animowany obrys Polski (dwa małe pliki: obrys i start.json), bez kodu mapy i bez wartości wskaźników.
 * „Otwórz mapę”: okładka z kopią obrysu przykrywa ekran na czas ładowania mapy (mapCover.ts).
 */
export function StartPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const to = (href: string) => withTech(href, search);

  // Po wczytaniu strony (w wolnej chwili) pobieramy kod mapy, a chwilę później jej dane (nie przy oszczędzaniu danych).
  useEffect(() => {
    const codeId = window.setTimeout(preloadMap, 600);
    const dataId = window.setTimeout(() => {
      if (!isFrugalNetwork()) preloadMapData();
    }, DATA_PRELOAD_MS);
    return () => {
      window.clearTimeout(codeId);
      window.clearTimeout(dataId);
    };
  }, []);

  // Zamiar otwarcia mapy (najechanie, dotyk, fokus): kod i dane od razu.
  const warm = () => {
    preloadMap();
    preloadMapData();
  };

  // Okładka z kopią obrysu przykrywa ekran od razu (reakcja na klik) i znika, gdy mapa jest gotowa.
  const enter = (href: string) => {
    coverForMap(document.querySelector('[data-slot="start-background"] svg'), !reduced.current);
    navigate(to(href));
  };
  const openMap = (e: MouseEvent<HTMLAnchorElement>) => {
    // Kliknięcie z klawiszem (nowa karta): zwykła nawigacja linku.
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    // Mapa otwiera się ze wskaźnikiem, który tło pokazuje teraz: okładka i mapa mają te same kolory.
    const id = document.querySelector('[data-slot="start-background"] svg')?.getAttribute('data-indicator');
    enter(id ? `/mapa?i=${encodeURIComponent(id)}` : '/mapa');
  };
  // Stuknięcie w województwo na tle: mapa otwiera się na nim, ze wskaźnikiem z tła.
  const pickRegion = (teryt: string, indicatorId: string) => {
    warm();
    enter(`/mapa?i=${indicatorId}&u=${teryt}`);
  };

  return (
    <SiteLayout
      meta={{
        title: 'Faktografia',
        description: 'Sprawdź dane swojej miejscowości i okolicy na tle całej Polski, na danych GUS.',
      }}
    >
      <div className="relative isolate">
        {/* Mapa w całości widoczna; na jej dole półprzezroczysty baner (ok. 1/3 wysokości) z hasłem, bez przerwy łączy się z treścią pod spodem. */}
        <div className="mx-auto w-full max-w-3xl px-4 pb-12 pt-6 md:px-8 md:pb-16">
          <div className="relative">
            <StartBackground onPick={pickRegion} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-1/3 items-center bg-kalka/70 px-4 md:px-8">
              <h1 className="m-0 font-extrabold tracking-[-0.02em] text-tusz">
                <span className="sr-only">Faktografia</span>{' '}
                <span className="text-lg md:text-2xl">{TAGLINE}</span>
              </h1>
            </div>
          </div>
          <div className="flex flex-col gap-6 bg-kalka/95 p-4">
            <ol className="m-0 flex list-none flex-col gap-2 p-0 text-sm text-tusz">
              {STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <div>
              <Button asChild>
                <Link
                  to={to('/mapa')}
                  onClick={openMap}
                  onPointerEnter={warm}
                  onTouchStart={warm}
                  onFocus={warm}
                >
                  Otwórz mapę
                </Link>
              </Button>
            </div>
          </div>

          <PageSection id="start-examples" title="Przykłady">
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-olowek">Zobacz miejsce</h3>
              <div className="flex flex-wrap gap-2">
                {START_PLACES.map((p) => (
                  <Button key={p.teryt} asChild variant="secondary" className={CHIP}>
                    <Link to={to(p.href)}>{p.name}</Link>
                  </Button>
                ))}
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <h3 className="text-sm font-bold text-olowek">Porównaj dwa miejsca</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {START_PAIRS.map((p) => (
                  <Button key={p.href} asChild variant="secondary" className={`${CHIP} justify-between gap-3`}>
                    <Link to={to(p.href)}>
                      <span className="min-w-0 truncate">{p.name1}</span>
                      <span className="shrink-0 text-xs text-olowek">vs</span>
                      <span className="min-w-0 truncate text-right">{p.name2}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </PageSection>
        </div>
      </div>
    </SiteLayout>
  );
}
