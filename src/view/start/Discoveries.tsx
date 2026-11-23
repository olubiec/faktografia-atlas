import { useEffect, useRef, useState } from 'react';
import { PageSection } from '@/view/ui/PageSection';
import type { FactsStart } from '@/core/facts/start';
import { dailyEntry, factView, listPlaceholders, listView, placeFacts, type FactView, type ListView } from '@/core/start/discoveries';
import { loadFactsStart } from '@/core/start/load-discoveries';
import { forgetPlace, readPlace, savePlace } from '@/core/start/place-memory';
import { FactCard } from './FactCard';
import { PlaceFacts } from './PlaceFacts';
import { PlaceSearch } from './PlaceSearch';
import { StartLists } from './StartLists';
import { useNearViewport } from './useNearViewport';

export interface DiscoveriesProps {
  to: (href: string) => string;
  onWarm?: () => void;
}

type Daily = { place: string; fact: FactView };

/** Odkrycie dnia (wybór po dacie) i zestawienia z `facts-start.json`. */
function fromStart(start: FactsStart, now: Date): { daily: Daily | null; lists: ListView[] } {
  const entry = dailyEntry(start, now);
  const fact = entry ? placeFacts({ woj: '', generatedAt: '', units: { [entry.u]: [entry.f] } }, entry.u, 1)[0] : null;
  const view = fact ? factView(fact) : null;
  return {
    daily: entry && view ? { place: entry.n, fact: view } : null,
    lists: start.lists.map(listView).filter((l): l is ListView => l !== null),
  };
}

// Tytuły i linki zestawień są od razu (z konfiguracji), pozycje dochodzą z facts-start.json.
const PLACEHOLDERS = listPlaceholders();

const SUB = 'm-0 text-xl font-bold leading-tight text-tusz';

/**
 * „Odkrycia” pod „Otwórz mapę” (KONCEPT-ODKRYCIA §6). Stan A: Twoje miejsce (szukajka), Odkrycie dnia, Zestawienia.
 * Stan B (miejsce wybrane albo zapamiętane): 3 fakty miejsca, niżej to samo co w stanie A.
 * Dane dopiero, gdy sekcja zbliża się do ekranu: pierwsze wejście na `/` pobiera tylko obrys i start.json.
 */
export function Discoveries({ to, onWarm }: DiscoveriesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref);
  // Zapamiętane miejsce (sam TERYT); bez pamięci przeglądarki – stan A.
  const [place, setPlace] = useState<{ teryt: string; name: string | null } | null>(() => {
    const teryt = readPlace();
    return teryt ? { teryt, name: null } : null;
  });
  const [view, setView] = useState<ReturnType<typeof fromStart> | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    loadFactsStart()
      .then((s) => !cancelled && setView(fromStart(s, new Date())))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [near]);

  const pick = (teryt: string, name: string) => {
    savePlace(teryt);
    setPlace({ teryt, name: name || null });
  };
  const change = () => {
    forgetPlace();
    setPlace(null);
  };

  return (
    // Identyfikator sekcji zostaje po „Przykładach” (to samo miejsce na stronie).
    <PageSection id="start-examples" title="Odkrycia">
      <div ref={ref} className="flex flex-col gap-10">
        <section aria-labelledby="start-place-title" className="flex flex-col gap-3">
          <h3 id="start-place-title" className={place ? 'sr-only' : SUB}>Twoje miejsce</h3>
          {place && near ? (
            <PlaceFacts teryt={place.teryt} name={place.name} to={to} onWarm={onWarm} onChange={change} />
          ) : (
            !place && (
              <>
                <p className="m-0 text-sm text-olowek">Wpisz swoją miejscowość, a pokażemy 3 rzeczy o Twojej gminie.</p>
                <PlaceSearch onPick={pick} />
              </>
            )
          )}
        </section>

        <section aria-labelledby="start-daily-title" className="flex flex-col gap-3">
          <h3 id="start-daily-title" className={SUB}>Odkrycie dnia</h3>
          {view?.daily ? (
            <FactCard fact={view.daily.fact} place={view.daily.place} to={to} onWarm={onWarm} large />
          ) : (
            <p className="m-0 text-sm text-olowek" role="status">
              {failed ? 'Nie udało się wczytać odkryć. Sprawdź połączenie i odśwież stronę.' : 'Wczytujemy odkrycie dnia…'}
            </p>
          )}
        </section>

        <section aria-labelledby="start-lists-title" className="flex flex-col gap-3">
          <h3 id="start-lists-title" className={SUB}>Zestawienia</h3>
          <StartLists lists={view && view.lists.length > 0 ? view.lists : PLACEHOLDERS} to={to} onWarm={onWarm} />
        </section>
      </div>
    </PageSection>
  );
}
