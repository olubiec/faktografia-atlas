import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import type { FactView } from '@/core/start/discoveries';
import type { ExtremesView, PoleView } from '@/core/start/extremes';
import { NewBadge } from '@/view/ui/NewBadge';

export interface ExtremesCardProps {
  extremes: ExtremesView;
  /** Fakt dnia: „Zobacz na mapie” otwiera mapę z jego jednostką. */
  fact: FactView;
  to: (href: string) => string;
  onWarm?: () => void;
  /** Dodatkowy przycisk obok „Zobacz na mapie” (np. „Pokaż inną ciekawostkę”). */
  extra?: ReactNode;
}

function Pole({ pole, end, to, onWarm }: { pole: PoleView; end: boolean; to: ExtremesCardProps['to']; onWarm?: () => void }) {
  return (
    <div data-slot="extremes-pole" className={`flex min-w-0 flex-col gap-1 ${end ? 'items-end text-right' : 'items-start'}`}>
      <p className={`m-0 flex min-w-0 max-w-full flex-wrap items-baseline gap-x-1 text-tusz ${end ? 'justify-end' : ''}`}>
        <span className="min-w-0 max-w-full text-lg font-extrabold leading-none tabular-nums break-words md:text-2xl">{pole.number}</span>
        {pole.unit && <span className="text-xs font-medium text-olowek md:text-sm">{pole.unit}</span>}
      </p>
      <Link
        to={to(pole.href)}
        className="inline-flex min-h-[44px] min-w-11 max-w-full items-center text-sm font-bold leading-tight text-tusz underline underline-offset-4 break-words hover:no-underline focus-visible:outline-2 focus-visible:outline-tusz"
        onPointerEnter={onWarm}
        onTouchStart={onWarm}
        onFocus={onWarm}
      >
        {pole.name}
      </Link>
    </div>
  );
}

/** Dwa bieguny jednego wskaźnika: najmniej i najwięcej w Polsce, oś między nimi i zdanie o rozpiętości. */
export function ExtremesCard({ extremes: x, fact, to, onWarm, extra }: ExtremesCardProps) {
  return (
    <article data-slot="fact-card" data-variant="extremes" className="flex min-w-0 flex-col gap-4 border border-linia bg-arkusz p-4 md:p-6">
      <div className="flex min-w-0 flex-col gap-1">
        <h4 className="m-0 text-lg font-bold leading-tight text-tusz break-words">
          {x.title}
          {fact.isNew && <NewBadge />}
        </h4>
        <p className="m-0 text-xs text-olowek break-words">{x.scope}</p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-4 text-xs text-olowek" aria-hidden="true">
          <span>{x.low.label}</span>
          <span>{x.high.label}</span>
        </div>
        {/* Oś od najmniejszej do największej wartości: dwa znaczniki tuszem na końcach kreski. */}
        <div className="relative h-3" aria-hidden="true">
          <span className="absolute inset-x-0 top-1/2 border-t border-tusz" />
          <span className="absolute left-0 top-0 size-3 bg-tusz" />
          <span className="absolute right-0 top-0 size-3 bg-tusz" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <section aria-label={x.low.label} className="min-w-0">
            <Pole pole={x.low} end={false} to={to} onWarm={onWarm} />
          </section>
          <section aria-label={x.high.label} className="min-w-0">
            <Pole pole={x.high} end to={to} onWarm={onWarm} />
          </section>
        </div>
      </div>

      {x.contrast && <p className="m-0 text-sm leading-normal text-tusz break-words">{x.contrast}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="secondary">
          <Link to={to(fact.href)} onPointerEnter={onWarm} onTouchStart={onWarm} onFocus={onWarm}>
            Zobacz na mapie
          </Link>
        </Button>
        {extra}
      </div>
    </article>
  );
}
