import { useState } from 'react';
import { Check } from 'iconoir-react';
import { Icon } from '@/view/ui/Icon';
import type { Indicator } from '@/core/profile/profile';
import {
  CATEGORY_NAMES,
  indicatorsInCategory,
  toggleSelection,
} from '@/core/indicators/categories';
import { cn } from '@/lib/utils';

export interface IndicatorCategoriesProps {
  indicators: Indicator[];
  /** Wywoływane po „Pokaż na mapie” z zaznaczonymi identyfikatorami (w kolejności zaznaczania). */
  onApply: (ids: string[]) => void;
}

/**
 * Kategorie wskaźników: klik w kategorię pokazuje jej wskaźniki z polami wyboru (wielokrotny wybór).
 */
export function IndicatorCategories({ indicators, onApply }: IndicatorCategoriesProps) {
  const [active, setActive] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const names = CATEGORY_NAMES.filter((n) => indicatorsInCategory(indicators, n).length > 0);
  const items = active ? indicatorsInCategory(indicators, active) : [];

  return (
    <section aria-label="Kategorie wskaźników" className="border-b border-linia p-3 shrink-0">
      <div className="flex flex-wrap gap-2">
        {names.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={active === name}
            onClick={() => setActive(active === name ? null : name)}
            className={cn(
              'min-h-[44px] px-4 text-sm border border-linia cursor-pointer rounded-none transition-colors',
              active === name ? 'bg-tusz text-arkusz' : 'bg-arkusz text-tusz hover:bg-linia/15'
            )}
          >
            {name}
          </button>
        ))}
      </div>

      {active && (
        <div role="group" aria-label={`Wskaźniki: ${active}`} className="mt-3 flex flex-col">
          {items.map((item) => {
            const checked = selected.includes(item.id);
            return (
              <label
                key={item.id}
                className="flex items-center gap-3 min-h-[44px] px-1 cursor-pointer text-sm text-tusz"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => setSelected((s) => toggleSelection(s, item.id))}
                  className="sr-only peer"
                />
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center border border-tusz peer-focus-visible:ring-2 peer-focus-visible:ring-tusz"
                >
                  {checked && <Icon icon={Check} size={18} aria-hidden={true} className="text-tusz" />}
                </span>
                <span className="whitespace-normal break-words">{item.name}</span>
              </label>
            );
          })}
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={() => onApply(selected)}
            className="mt-2 min-h-[44px] px-4 text-sm bg-tusz text-arkusz cursor-pointer rounded-none disabled:opacity-50 disabled:cursor-default"
          >
            {`Pokaż na mapie (${selected.length})`}
          </button>
        </div>
      )}
    </section>
  );
}
