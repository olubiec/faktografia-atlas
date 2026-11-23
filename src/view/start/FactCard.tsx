import { useId } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import type { FactView } from '@/core/start/discoveries';

export interface FactCardProps {
  fact: FactView;
  /** Nazwa miejsca nad liczbą (Odkrycie dnia); w faktach „Twojego miejsca” jest w nagłówku sekcji. */
  place?: string;
  /** Dopisuje parametry techniczne adresu (e2e, logo, tune). */
  to: (href: string) => string;
  onWarm?: () => void;
  /** Większa karta (Odkrycie dnia). */
  large?: boolean;
}

/** Karta faktu: (miejsce), duża liczba, zdanie, „Zobacz na mapie” – jedno kliknięcie do mapy. */
export function FactCard({ fact, place, to, onWarm, large = false }: FactCardProps) {
  const sentenceId = useId();
  return (
    <article
      data-slot="fact-card"
      className={`flex min-w-0 flex-col gap-3 border border-linia bg-arkusz ${large ? 'p-4 md:p-6' : 'p-4'}`}
    >
      {place && <h4 className="m-0 text-lg font-bold leading-tight text-tusz break-words">{place}</h4>}
      <p className="m-0 flex min-w-0 flex-wrap items-baseline gap-x-2 text-tusz">
        <span
          className={`min-w-0 font-extrabold leading-none tabular-nums break-words ${large ? 'text-2xl md:text-3xl' : 'text-xl'}`}
        >
          {fact.number}
        </span>
        {fact.unit && <span className="text-sm font-medium text-olowek">{fact.unit}</span>}
      </p>
      <p id={sentenceId} className="m-0 text-sm leading-normal text-tusz break-words">
        {fact.sentence}
      </p>
      <Button asChild variant="secondary" className="self-start">
        <Link to={to(fact.href)} aria-describedby={sentenceId} onPointerEnter={onWarm} onTouchStart={onWarm} onFocus={onWarm}>
          Zobacz na mapie
        </Link>
      </Button>
    </article>
  );
}
