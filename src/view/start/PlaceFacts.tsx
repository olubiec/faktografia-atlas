import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { factView, placeFacts, placeHeading, type FactView } from '@/core/start/discoveries';
import { loadPlaceFacts } from '@/core/start/load-discoveries';
import { loadUnits } from '@/core/data/load-atlas-data';
import { FactCard } from './FactCard';

export interface PlaceFactsProps {
  teryt: string;
  /** Nazwa znana od razu po wyborze w szukajce; po przeładowaniu bierzemy ją z listy jednostek. */
  name: string | null;
  to: (href: string) => string;
  onWarm?: () => void;
  onChange: () => void;
}

type Loaded = { teryt: string; facts: FactView[] } | { teryt: string; error: true };

/** Stan B: „Gmina X – 3 rzeczy, których mogłeś nie wiedzieć” – 3 karty z `facts/<WW>.json` i „Zmień miejsce”. */
export function PlaceFacts({ teryt, name, to, onWarm, onChange }: PlaceFactsProps) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [unitName, setUnitName] = useState<{ teryt: string; name: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPlaceFacts(teryt)
      .then((file) => {
        const facts = placeFacts(file, teryt)
          .map(factView)
          .filter((v): v is FactView => v !== null);
        if (!cancelled) setLoaded({ teryt, facts });
      })
      .catch(() => !cancelled && setLoaded({ teryt, error: true }));
    return () => {
      cancelled = true;
    };
  }, [teryt]);

  useEffect(() => {
    if (name) return;
    let cancelled = false;
    loadUnits()
      .then((units) => {
        const u = units.find((x) => x.teryt === teryt);
        if (u && !cancelled) setUnitName({ teryt, name: u.name });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [teryt, name]);

  const known = name ?? (unitName?.teryt === teryt ? unitName.name : null);
  const heading = known ? `${placeHeading(teryt, known)} – 3 rzeczy, których mogłeś nie wiedzieć` : 'Twoje miejsce – 3 rzeczy, których mogłeś nie wiedzieć';
  const current = loaded?.teryt === teryt ? loaded : null;

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
      {current && 'facts' in current && current.facts.length === 0 && (
        <p className="m-0 text-sm text-olowek" role="status">Dla tego miejsca nie mamy jeszcze ciekawostek. Otwórz je na mapie albo wybierz inne.</p>
      )}
      {current && 'facts' in current && current.facts.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {current.facts.map((f) => (
            <FactCard key={f.key} fact={f} to={to} onWarm={onWarm} />
          ))}
        </div>
      )}
    </div>
  );
}
