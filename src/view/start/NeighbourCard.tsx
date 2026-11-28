// „Na tle sąsiada” (W33-O07): jasna karta z przełącznikiem sąsiada i linkiem do pełnego porównania.
import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { chooseNeighbour, compareWithNeighbour, type NeighbourProfile } from '@/core/facts/neighbour-compare';
import { compareHref } from '@/core/start/discoveries';

export interface NeighbourCardProps {
  me: NeighbourProfile;
  neighbours: NeighbourProfile[];
  to: (href: string) => string;
  onWarm?: () => void;
}

export function NeighbourCard({ me, neighbours, to, onWarm }: NeighbourCardProps) {
  const { main, others } = chooseNeighbour(me, neighbours);
  const [pick, setPick] = useState<string | null>(null);
  if (!main) return null;
  const options = [main, ...others].slice(0, 5);
  const current = options.find((o) => o.teryt === pick) ?? main;
  const c = compareWithNeighbour(me, current);
  return (
    <article data-slot="place-neighbour" className="flex min-w-0 flex-col gap-3 border border-linia bg-arkusz p-4">
      <h4 className="m-0 text-sm font-bold uppercase tracking-wide text-olowek">Na tle sąsiada</h4>
      <p className="m-0 text-base font-semibold leading-snug text-tusz break-words">{c.sentence}</p>
      {c.betterLine && <p className="m-0 text-sm text-tusz">{c.betterLine}</p>}
      {c.worseLine && <p className="m-0 text-sm text-tusz">{c.worseLine}</p>}
      {options.length > 1 && (
        <label className="flex flex-wrap items-center gap-2 text-sm text-olowek">
          Porównaj z:
          <select
            value={current.teryt}
            onChange={(e) => setPick(e.target.value)}
            className="min-h-[44px] border border-linia bg-arkusz px-2 text-tusz"
          >
            {options.map((o) => (
              <option key={o.teryt} value={o.teryt}>{o.name}</option>
            ))}
          </select>
        </label>
      )}
      <Button asChild variant="secondary" className="self-start">
        <Link to={to(compareHref(me.teryt, current.teryt))} onPointerEnter={onWarm} onTouchStart={onWarm} onFocus={onWarm}>
          Pełne porównanie
        </Link>
      </Button>
    </article>
  );
}
