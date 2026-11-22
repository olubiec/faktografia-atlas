import { InfoCircle } from 'iconoir-react';
import { Link } from 'react-router';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { unitKindInfo } from '../../core/units/kinds';
import type { Unit } from '../../core/units/types';
import { Icon } from '../ui/Icon';

/** Linijka pod nazwą jednostki: „Rodzaj – krótka definicja” i znak „?” z rozwinięciem oraz odnośnikiem do słownika. */
export function UnitKindHint({ unit }: { unit: Unit }) {
  const kind = unitKindInfo(unit);
  if (!kind) return null;
  return (
    <div className="flex items-center gap-1 text-sm text-tusz">
      <p className="min-w-0 break-words">
        <span className="font-semibold">{kind.title}</span>
        <span className="text-olowek"> – {kind.tagline}</span>
      </p>
      <Popover>
        <PopoverTrigger
          aria-label={`Co to znaczy: ${kind.title}`}
          className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center text-olowek hover:text-tusz cursor-pointer"
        >
          <Icon icon={InfoCircle} aria-hidden={true} size={20} />
        </PopoverTrigger>
        <PopoverContent className="space-y-2 text-sm">
          <p className="font-bold">{kind.title}</p>
          <p>{kind.short}</p>
          <Link to={`/zrodla#${kind.id}`} className="underline text-tusz">
            Pełny słownik jednostek
          </Link>
        </PopoverContent>
      </Popover>
    </div>
  );
}
