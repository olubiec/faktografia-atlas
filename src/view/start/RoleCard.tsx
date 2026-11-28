// Karta roli panelu „{Gmina} na tle Polski” (W33-O07, docs/KONCEPT-ODKRYCIA-V2.md §3).
import { ArrowDownCircle, ArrowUpCircle, GraphUp, WarningCircle } from 'iconoir-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import type { RoleCard as Card, RoleId } from '@/core/facts/roles';
import type { DistEntry } from '@/core/facts/percentile-types';
import { levelOf, mapHref, resolveIndicator } from '@/core/start/discoveries';
import { Icon } from '@/view/ui/Icon';
import { ShareFact } from './ShareFact';
import { YouAreHere } from './YouAreHere';

const LABEL: Record<RoleId, { text: string; icon: typeof GraphUp }> = {
  unusual: { text: 'Najbardziej nietypowe', icon: WarningCircle },
  strong: { text: 'Mocna strona', icon: ArrowUpCircle },
  weak: { text: 'Słabsza strona', icon: ArrowDownCircle },
  change: { text: 'Największa zmiana w 10 lat', icon: GraphUp },
};

export interface RoleCardProps {
  card: Card;
  teryt: string;
  name: string;
  dist?: DistEntry | null;
  to: (href: string) => string;
  onWarm?: () => void;
  /** Jedyne zakreślenie ekranu (karta „Najbardziej nietypowe”). */
  highlight?: boolean;
}

export function RoleCard({ card, teryt, name, dist, to, onWarm, highlight = false }: RoleCardProps) {
  const label = LABEL[card.role];
  const ind = card.indicatorId ? resolveIndicator(card.indicatorId) : null;
  const href = card.indicatorId ? mapHref({ indicatorId: card.indicatorId, year: card.year, teryt, level: levelOf(teryt) }) : '';
  // Udostępniamy adres mapy z tym wskaźnikiem i miejscem (pełny, z domeną).
  const link = `${typeof window === 'undefined' ? '' : window.location.origin}${href}`;
  const frame = highlight ? 'border-2 border-korekta' : 'border border-linia';
  return (
    <article data-slot="role-card" data-role={card.role} {...(highlight ? { 'data-highlight': 'korekta' } : {})} className={`flex min-w-0 flex-col gap-3 bg-arkusz p-4 ${frame}`}>
      <h4 className="m-0 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-olowek">
        <Icon icon={label.icon} aria-hidden={true} size={18} />
        {label.text}
      </h4>
      <p className="m-0 text-base font-semibold leading-snug text-tusz break-words">{card.main}</p>
      {!card.none && ind && card.value !== undefined && (
        <YouAreHere dist={dist} value={card.value} name={name} unitLabel={ind.unit} />
      )}
      {card.reference && <p className="m-0 text-sm text-tusz">{card.reference}</p>}
      {card.source && <p className="m-0 text-xs text-olowek">{card.source}</p>}
      {!card.none && card.indicatorId && (
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="secondary">
            <Link to={to(href)} onPointerEnter={onWarm} onTouchStart={onWarm} onFocus={onWarm}>
              Ranking gmin
            </Link>
          </Button>
          <ShareFact place={name} card={card} link={link} />
        </div>
      )}
    </article>
  );
}
