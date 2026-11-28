// Jedna spokojna linia po powrocie na stronę (W34-O10). Brak nowości, pamięci albo błąd = nic nie pokazujemy.
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { FreshLedger } from '@/core/facts/fresh';
import { mapHref, resolveIndicator } from '@/core/start/discoveries';
import { readLastVisit, sinceLastVisit, touchVisit, visitDate } from '@/core/start/since-last-visit';
import { shortIndicatorName } from '@/core/seo/sentences';

export interface SinceLastVisitProps {
  teryt: string;
  /** Księga świeżości (facts/fresh.json) albo null, gdy jeszcze niewczytana. */
  ledger: FreshLedger | null;
  hasData?: (indicatorId: string) => boolean;
  to: (href: string) => string;
  /** Tylko do testów: data ostatniej wizyty zamiast odczytu z pamięci. */
  initialLastVisit?: string | null;
}

export function SinceLastVisit({ teryt, ledger, hasData, to, initialLastVisit }: SinceLastVisitProps) {
  // Poprzednia wizyta czytana raz, przed zapisem bieżącej (zapis tylko przy zapamiętanym miejscu).
  const [last] = useState<string | null>(() => (initialLastVisit !== undefined ? initialLastVisit : readLastVisit()));
  useEffect(() => {
    touchVisit(new Date());
  }, []);
  const items = sinceLastVisit(last, ledger, hasData).filter((n) => resolveIndicator(n.indicatorId));
  if (!last || items.length === 0) return null;
  const names = items.map((n) => {
    const ind = resolveIndicator(n.indicatorId);
    return ind ? shortIndicatorName(ind.name, ind.unit) : n.indicatorId;
  });
  const first = items[0];
  return (
    <p data-slot="since-last-visit" className="m-0 text-sm text-olowek">
      {`Od ${visitDate(last)}: nowe dane – ${names.join(', ')}. `}
      <Link className="text-tusz underline" to={to(mapHref({ indicatorId: first.indicatorId, year: first.year, teryt }))}>
        Zobacz na mapie
      </Link>
    </p>
  );
}
