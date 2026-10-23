import { useMemo } from 'react';
import type { UnitIndex } from '@/core/units/types';
import { getBreadcrumbs } from '@/core/map/breadcrumbs';
import { NavArrowLeft } from 'iconoir-react';
import { Icon } from '@/view/ui/Icon';
import { unitLabel } from '@/core/units/label';

type BreadcrumbsProps = {
  onBack?: () => void;
  teryt: string | null;
  index: UnitIndex;
  onSelect: (teryt: string | null) => void;
};

export function Breadcrumbs({ teryt, index, onSelect, onBack }: BreadcrumbsProps) {
  const items = useMemo(() => {
    const rawItems = getBreadcrumbs(teryt, index);
    return rawItems.map((item) => {
      if (!item.teryt) return item;
      const unit = index.byTeryt.get(item.teryt);
      if (!unit) return item;
      return {
        ...item,
        label: unitLabel(unit),
      };
    });
  }, [teryt, index]);

  return (
    <nav aria-label="Ścieżka" className="bg-arkusz border border-linia p-1 flex items-center gap-1">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Wróć"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-tusz hover:bg-linia/20 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-tusz cursor-pointer rounded-none"
        >
          <Icon icon={NavArrowLeft} aria-hidden={true} size={20} />
        </button>
      )}
      <ol className="flex flex-wrap items-center gap-1 text-xs">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li key={item.teryt ?? 'polska'} className="flex items-center gap-1">
              {idx > 0 && (
                <span aria-hidden="true" className="text-olowek px-0.5">
                  /
                </span>
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  className="min-h-[44px] px-2.5 flex items-center text-tusz font-semibold select-none"
                >
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelect(item.teryt)}
                  className="min-h-[44px] min-w-[44px] px-2.5 flex items-center justify-center text-tusz hover:bg-linia/20 transition-colors font-medium rounded-none focus:outline-none focus-visible:ring-1 focus-visible:ring-tusz cursor-pointer"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
