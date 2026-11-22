import { HelpCircle } from 'iconoir-react';
import { Link } from 'react-router';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icon } from '@/view/ui/Icon';
import { unitKindInfo } from '@/core/units/kinds';
import type { Unit } from '@/core/units/types';

/**
 * Znak „?” przy rodzaju jednostki (powiat ziemski, miasto na prawach powiatu, gmina miejska…).
 * Wygląd i okienko takie same jak przy wskaźnikach (IndicatorInfo).
 */
export function UnitKindInfo({ unit }: { unit: Unit }) {
  const kind = unitKindInfo(unit);
  if (!kind) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Co to znaczy: ${kind.title}`}
          className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 shrink-0 text-olowek hover:text-tusz focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skupienie rounded-none transition-colors cursor-pointer"
        >
          <Icon icon={HelpCircle} size={20} aria-hidden={true} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="z-[10000] w-80 max-w-[calc(100vw-32px)] sm:w-96 text-tusz text-xs border border-linia bg-arkusz p-4 rounded-none">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-tusz text-xs mb-0.5">{kind.title}</h3>
            <p className="text-olowek text-xs leading-relaxed">{kind.short}</p>
          </div>
          <Link
            to={`/zrodla#${kind.id}`}
            className="text-tusz underline hover:text-olowek focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skupienie text-xs"
          >
            Pełny słownik jednostek
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
