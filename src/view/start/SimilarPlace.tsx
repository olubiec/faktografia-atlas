// „Najbardziej podobna gmina” (W33-O07): bliźniak F8 z pliku województwa, bez dodatkowych żądań.
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { twinSentence, type TwinView } from '@/core/start/discoveries';

export interface SimilarPlaceProps {
  twin: TwinView;
  twinName: string;
  to: (href: string) => string;
  onWarm?: () => void;
}

export function SimilarPlace({ twin, twinName, to, onWarm }: SimilarPlaceProps) {
  return (
    <article data-slot="place-twin" className="flex min-w-0 flex-col gap-3 border border-linia bg-arkusz p-4">
      <h4 className="m-0 text-sm font-bold uppercase tracking-wide text-olowek">Najbardziej podobna gmina</h4>
      <p className="m-0 text-sm leading-normal text-tusz break-words">{twinSentence(twin, twinName)}</p>
      <Button asChild variant="secondary" className="self-start">
        <Link to={to(twin.href)} onPointerEnter={onWarm} onTouchStart={onWarm} onFocus={onWarm}>
          Pełne porównanie
        </Link>
      </Button>
    </article>
  );
}
