// „Ten sam zestaw u sąsiada”: te wskaźniki, które wyróżniają gminę, zestawione z sąsiadem o podobnej liczbie ludności.
// Bez liczenia „kto wygrał” po dowolnych wskaźnikach: tylko to, co faktycznie odstaje.
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import type { AnomalyShard } from '@/core/facts/anomaly-types';
import { neighbourLines } from '@/core/facts/anomaly-cards';
import { compareHref } from '@/core/start/discoveries';

export interface AnomalyNeighbourCardProps {
  an: AnomalyShard;
  teryt: string;
  name: string;
  /** Nazwy jednostek po TERYT (z listy jednostek); bez nazwy sąsiada karta się nie pokazuje. */
  names: Map<string, string> | null;
  to: (href: string) => string;
  onWarm?: () => void;
}

export function AnomalyNeighbourCard({ an, teryt, name, names, to, onWarm }: AnomalyNeighbourCardProps) {
  const view = neighbourLines(an, teryt);
  const neighbour = view ? names?.get(view.neighbour) : undefined;
  if (!view || !neighbour) return null;
  return (
    <article data-slot="place-neighbour" className="flex min-w-0 flex-col gap-3 border border-linia bg-arkusz p-4">
      <h4 className="m-0 text-sm font-bold uppercase tracking-wide text-olowek">Na tle sąsiada</h4>
      <p className="m-0 text-base font-semibold leading-snug text-tusz break-words">{`Te same wskaźniki w gminie ${neighbour}.`}</p>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {view.lines.map((l) => (
          <li key={l.indicatorId} className="flex min-w-0 flex-col gap-1 text-sm text-tusz">
            <span className="break-words font-semibold">{l.subject}</span>
            <span className="break-words">{`${name}: ${l.mine}`}</span>
            <span className="break-words text-olowek">{`${neighbour}: ${l.theirs}`}</span>
          </li>
        ))}
      </ul>
      <Button asChild variant="secondary" className="self-start">
        <Link to={to(compareHref(teryt, view.neighbour))} onPointerEnter={onWarm} onTouchStart={onWarm} onFocus={onWarm}>
          Pełne porównanie
        </Link>
      </Button>
    </article>
  );
}
