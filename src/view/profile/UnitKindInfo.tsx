import { Link } from 'react-router';
import { InfoPopover } from '@/view/ui/InfoPopover';
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
    <InfoPopover
      label={`Co to znaczy: ${kind.title}`}
      buttonClassName="inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 shrink-0 text-olowek hover:text-tusz focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skupienie rounded-none transition-colors cursor-pointer"
    >
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
    </InfoPopover>
  );
}
