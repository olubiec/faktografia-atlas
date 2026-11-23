import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { compareHref, twinSentence, type TwinView } from '@/core/start/discoveries';

export interface PlaceExtrasProps {
  teryt: string;
  /** Pierwszy sąsiad (ten sam poziom) i bliźniak z `facts/<WW>.json` (W26-F03). */
  neighbour: string | null;
  twin: TwinView | null;
  /** Nazwy jednostek z listy jednostek (null, zanim się wczyta). */
  names: Map<string, string> | null;
  to: (href: string) => string;
  onWarm?: () => void;
}

const SUB = 'm-0 text-lg font-bold leading-tight text-tusz';

/** Stan B, pod 3 faktami: „Twoja okolica” (porównanie z sąsiadem) i „Twój bliźniak” (F8) – po jednym kliknięciu do porównania. */
export function PlaceExtras({ teryt, neighbour, twin, names, to, onWarm }: PlaceExtrasProps) {
  const neighbourName = neighbour ? names?.get(neighbour) : undefined;
  const twinName = twin ? names?.get(twin.twin) : undefined;
  if (!neighbourName && !twinName) return null;
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {neighbour && neighbourName && (
        <article data-slot="place-neighbour" className="flex min-w-0 flex-col gap-3 border border-linia bg-arkusz p-4">
          <h4 className={SUB}>Twoja okolica</h4>
          <p className="m-0 text-sm leading-normal text-tusz break-words">
            Zobacz obok siebie swoje miejsce i sąsiada: {neighbourName}.
          </p>
          <Button asChild variant="secondary" className="mt-auto self-start">
            <Link to={to(compareHref(teryt, neighbour))} onPointerEnter={onWarm} onTouchStart={onWarm} onFocus={onWarm}>
              Porównaj z sąsiadem
            </Link>
          </Button>
        </article>
      )}
      {twin && twinName && (
        <article data-slot="place-twin" className="flex min-w-0 flex-col gap-3 border border-linia bg-arkusz p-4">
          <h4 className={SUB}>Twój bliźniak</h4>
          <p className="m-0 text-sm leading-normal text-tusz break-words">{twinSentence(twin, twinName)}</p>
          <Button asChild variant="secondary" className="mt-auto self-start">
            <Link to={to(twin.href)} onPointerEnter={onWarm} onTouchStart={onWarm} onFocus={onWarm}>
              Porównaj z bliźniakiem
            </Link>
          </Button>
        </article>
      )}
    </div>
  );
}
