import { useMemo } from 'react';
import { NavArrowLeft } from 'iconoir-react';
import type { UnitIndex } from '@/core/units/types';
import { getBreadcrumbs } from '@/core/map/breadcrumbs';
import { unitLabel } from '@/core/units/label';
import { Icon } from '@/view/ui/Icon';

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

  const canGoBack = items.length > 1;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (canGoBack) {
      const parentTeryt = items[items.length - 2].teryt;
      onSelect(parentTeryt);
    }
  };

  return (
    <nav
      aria-label="Ścieżka"
      className="bg-arkusz border border-linia p-0.5 flex items-center gap-1 min-h-[44px] max-h-[48px] max-w-full overflow-hidden text-xs"
    >
      {canGoBack && (
        <button
          type="button"
          onClick={handleBack}
          aria-label="Wróć"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 text-tusz hover:bg-linia/20 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-tusz cursor-pointer rounded-none md:hidden"
        >
          <Icon icon={NavArrowLeft} aria-hidden={true} size={20} />
        </button>
      )}
      <ol className="flex flex-nowrap md:flex-wrap items-center gap-0.5 sm:gap-1 min-w-0 overflow-hidden max-w-full text-xs">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li key={item.teryt ?? 'polska'} className="flex items-center gap-0.5 sm:gap-1 min-w-0 shrink max-w-full overflow-hidden">
              {idx > 0 && (
                <span aria-hidden="true" className="text-olowek px-0.5 shrink-0">
                  /
                </span>
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  className="min-h-[44px] px-1.5 sm:px-2.5 flex items-center text-tusz font-semibold select-none truncate min-w-0"
                >
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelect(item.teryt)}
                  className="min-h-[44px] min-w-[44px] px-1.5 sm:px-2.5 flex items-center justify-center text-tusz hover:bg-linia/20 transition-colors font-medium rounded-none focus:outline-none focus-visible:ring-1 focus-visible:ring-tusz cursor-pointer truncate min-w-0"
                >
                  <span className="truncate min-w-0">{item.label}</span>
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
