import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  factView,
  firstNeighbour,
  placeFacts,
  placeHeading,
  twinView,
  type FactView,
  type TwinView,
} from '@/core/start/discoveries';
import { loadPlaceFacts } from '@/core/start/load-discoveries';
import { loadUnits } from '@/core/data/load-atlas-data';
import { FactCard } from './FactCard';
import { PlaceExtras } from './PlaceExtras';

export interface PlaceFactsProps {
  teryt: string;
  /** Nazwa znana od razu po wyborze w szukajce; po przeładowaniu bierzemy ją z listy jednostek. */
  name: string | null;
  to: (href: string) => string;
  onWarm?: () => void;
  onChange: () => void;
}

type Loaded =
  | { teryt: string; facts: FactView[]; neighbour: string | null; twin: TwinView | null }
  | { teryt: string; error: true };

/**
 * Stan B: „Gmina X – 3 rzeczy, których mogłeś nie wiedzieć” – 3 karty z `facts/<WW>.json`, „Zmień miejsce”,
 * niżej „Twoja okolica” i „Twój bliźniak”. Nazwy (miejsca, sąsiada, bliźniaka) z listy jednostek.
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
        if (!cancelled) setLoaded({ teryt, facts, neighbour: firstNeighbour(file, teryt), twin: twinView(file, teryt) });
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
  const heading = `${known ? placeHeading(teryt, known) : 'Twoje miejsce'} – 3 rzeczy, których mogłeś nie wiedzieć`;
  const current = loaded?.teryt === teryt ? loaded : null;
  const ok = current && 'facts' in current ? current : null;

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
