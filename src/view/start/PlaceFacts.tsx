import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { profileFromShard, type NeighbourProfile } from '@/core/facts/neighbour-compare';
import { pickRoles, type RoleCard as Card } from '@/core/facts/roles';
import {
  factView,
  firstNeighbour,
  mapHref,
  placeFacts,
  placeHeading,
  twinView,
  type FactsFile,
  type FactView,
  type TwinView,
} from '@/core/start/discoveries';
import { loadPlaceFacts } from '@/core/start/load-discoveries';
import { loadUnits } from '@/core/data/load-atlas-data';
import { FactCard } from './FactCard';
import { NeighbourCard } from './NeighbourCard';
import { PlaceExtras } from './PlaceExtras';
import { RoleCard } from './RoleCard';
import { SimilarPlace } from './SimilarPlace';

export interface PlaceFactsProps {
  teryt: string;
  /** Nazwa znana od razu po wyborze w szukajce; po przeładowaniu bierzemy ją z listy jednostek. */
  name: string | null;
  to: (href: string) => string;
  onWarm?: () => void;
  onChange: () => void;
}

type Loaded =
  | { teryt: string; facts: FactView[]; neighbour: string | null; twin: TwinView | null; file: FactsFile }
  | { teryt: string; error: true };

export interface PlacePanelProps {
  file: FactsFile;
  cards: Card[];
  teryt: string;
  name: string;
  names: Map<string, string> | null;
  twin: TwinView | null;
  to: (href: string) => string;
  onWarm?: () => void;
  onChange: () => void;
}

const LINK = 'text-sm text-tusz underline';

/** Panel „{Nazwa} na tle Polski” (W33-O07): karty ról, na tle sąsiada, najbardziej podobna gmina. Dane z jednego pliku województwa. */
export function PlacePanel({ file, cards, teryt, name, names, twin, to, onWarm, onChange }: PlacePanelProps) {
  const year = cards.find((c) => c.year)?.year;
  const me = useMemo(() => profileFromShard(file.pct, teryt, name), [file, teryt, name]);
  // Sąsiedzi tylko z tego samego pliku (bez dodatkowych żądań); nazwy z listy jednostek.
  const neighbours = useMemo(
    () =>
      (file.near?.[teryt] ?? [])
        .map((id) => (names?.get(id) ? profileFromShard(file.pct, id, names.get(id) as string) : null))
        .filter((p): p is NeighbourProfile => p !== null),
    [file, teryt, names],
  );
  const twinName = twin ? names?.get(twin.twin) : undefined;
  // Losowa gmina z tego samego województwa: wybór raz na wizytę panelu.
  const [seed] = useState(() => Math.random());
  const random = useMemo(() => {
    const ids = Object.keys(file.pct?.u ?? {}).filter((t) => t !== teryt);
    return ids.length ? ids[Math.floor(seed * ids.length)] : null;
  }, [file, teryt, seed]);
  const anyIndicator = cards.find((c) => c.indicatorId)?.indicatorId ?? 'population';
  const near = firstNeighbour(file, teryt);
  return (
    <div className="flex flex-col gap-4" data-slot="place-facts" data-teryt={teryt}>
      <div className="flex flex-col gap-1">
        <p className="m-0 text-sm font-bold uppercase tracking-wide text-olowek">Gmina w liczbach</p>
        <h3 className="m-0 text-lg font-bold leading-tight text-tusz break-words">{`${name} na tle Polski`}</h3>
        {year && <p className="m-0 text-sm text-olowek">{`Co wyróżnia gminę w danych GUS za ${year} rok.`}</p>}
        <Button variant="ghost" size="sm" className="self-start px-0 underline" onClick={onChange}>
          Zmień miejsce
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {cards.map((c, i) => (
          <RoleCard key={c.role} card={c} teryt={teryt} name={name} dist={c.indicatorId ? file.dist?.[c.indicatorId] : null} to={to} onWarm={onWarm} highlight={i === 0 && c.role === 'unusual'} />
        ))}
        {me && neighbours.length > 0 && <NeighbourCard me={me} neighbours={neighbours} to={to} onWarm={onWarm} />}
      </div>
      {twin && twinName && <SimilarPlace twin={twin} twinName={twinName} to={to} onWarm={onWarm} />}
      <p className="m-0 flex flex-wrap gap-x-4 gap-y-2">
        {random && names?.get(random) && (
          <Link className={LINK} to={to(mapHref({ indicatorId: anyIndicator, year, teryt: random, level: 'gmi' }))} onPointerEnter={onWarm}>
            Losowa gmina
          </Link>
        )}
        {near && (
          <Link className={LINK} to={to(mapHref({ indicatorId: anyIndicator, year, teryt, level: 'gmi' }))} onPointerEnter={onWarm}>
            Gminy sąsiednie
          </Link>
        )}
      </p>
    </div>
  );
}

/**
 * Stan B: panel „{Nazwa} na tle Polski” (gdy plik ma percentyle) albo, dla starego pliku i jednostek innych niż gmina,
 * dotychczasowe „3 rzeczy” z „Twoją okolicą” i bliźniakiem. Nazwy (miejsca, sąsiada, bliźniaka) z listy jednostek.
 */
export function PlaceFacts({ teryt, name, to, onWarm, onChange }: PlaceFactsProps) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [names, setNames] = useState<Map<string, string> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPlaceFacts(teryt)
      .then((file) => {
        const facts = placeFacts(file, teryt)
          .map(factView)
          .filter((v): v is FactView => v !== null);
        if (!cancelled) setLoaded({ teryt, facts, neighbour: firstNeighbour(file, teryt), twin: twinView(file, teryt), file });
      })
      .catch(() => !cancelled && setLoaded({ teryt, error: true }));
    return () => {
      cancelled = true;
    };
  }, [teryt]);

  // Lista jednostek: ta sama pamięć co szukajka i rozgrzewka mapy (jedno żądanie na wizytę).
  useEffect(() => {
    let cancelled = false;
    loadUnits()
      .then((units) => !cancelled && setNames(new Map(units.map((u) => [u.teryt, u.name]))))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const known = name ?? names?.get(teryt) ?? null;
  const current = loaded?.teryt === teryt ? loaded : null;
  const ok = current && 'facts' in current ? current : null;
  const cards = useMemo(() => (ok ? pickRoles(ok.file, teryt) : []), [ok, teryt]);

  if (ok && known && cards.length > 0) {
    return <PlacePanel file={ok.file} cards={cards} teryt={teryt} name={known} names={names} twin={ok.twin} to={to} onWarm={onWarm} onChange={onChange} />;
  }

  const heading = `${known ? placeHeading(teryt, known) : 'Twoje miejsce'} – 3 rzeczy, których mogłeś nie wiedzieć`;
  return (
    <div className="flex flex-col gap-4" data-slot="place-facts" data-teryt={teryt}>
      <div className="flex flex-col gap-2">
        <h3 className="m-0 text-lg font-bold leading-tight text-tusz break-words">{heading}</h3>
        <Button variant="ghost" size="sm" className="self-start px-0 underline" onClick={onChange}>
          Zmień miejsce
        </Button>
      </div>
      {!current && <p className="m-0 text-sm text-olowek" role="status">Wczytujemy ciekawostki…</p>}
      {current && 'error' in current && (
        <p className="m-0 text-sm text-olowek" role="status">Nie udało się wczytać ciekawostek. Sprawdź połączenie i odśwież stronę.</p>
      )}
      {ok && ok.facts.length === 0 && (
        <p className="m-0 text-sm text-olowek" role="status">Dla tego miejsca nie mamy jeszcze ciekawostek. Otwórz je na mapie albo wybierz inne.</p>
      )}
      {ok && ok.facts.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {ok.facts.map((f) => (
            <FactCard key={f.key} fact={f} to={to} onWarm={onWarm} />
          ))}
        </div>
      )}
      {ok && <PlaceExtras teryt={teryt} neighbour={ok.neighbour} twin={ok.twin} names={names} to={to} onWarm={onWarm} />}
    </div>
  );
}
