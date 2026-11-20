import { useState } from 'react';
import { Check } from 'iconoir-react';
import { Icon } from '@/view/ui/Icon';
import { LIBRARY_PICK_LIMIT } from '@/core/library/picker-results';
import type { Indicator } from '@/core/profile/profile';
import { cn } from '@/lib/utils';

export interface LibraryGroupProps {
  items: Indicator[];
  value: string | null;
  onSelect: (id: string) => void;
  /** Ile pozycji widać na starcie (domyślnie limit; używane w testach bez DOM). */
  initialShown?: number;
}

/** Ile pozycji jest widocznych przy danym liczniku. */
function visibleCount(total: number, shown: number): number {
  return Math.min(total, Math.max(shown, 0));
}

/** Licznik po kliknięciu „Pokaż więcej”: o kolejną porcję, nie więcej niż wszystkie. */
function nextShown(shown: number, total: number): number {
  return Math.min(total, shown + LIBRARY_PICK_LIMIT);
}

/** Jedna pozycja listy (bez stanu – można ją wywołać bezpośrednio w teście). */
export function LibraryItem({
  item,
  selected,
  onSelect,
}: {
  item: Indicator;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected ? 'true' : 'false'}
      onClick={() => onSelect(item.id)}
      className={cn(
        'flex items-center justify-between gap-3 w-full px-3 py-2.5 min-h-[44px] text-left cursor-pointer rounded-none border-0 transition-colors',
        selected ? 'bg-linia/30 text-tusz font-semibold' : 'text-tusz hover:bg-linia/15'
      )}
    >
      <div className="flex flex-col min-w-0 flex-1 pr-1">
        <span className="text-sm whitespace-normal break-words text-tusz">{item.name}</span>
        {item.group && <span className="text-xs text-olowek break-words">{item.group}</span>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-olowek font-mono border border-linia/60 px-1.5 py-0.5 bg-kalka whitespace-nowrap">
          {item.unit}
        </span>
        {selected && <Icon icon={Check} size={18} aria-hidden={true} className="text-korekta" />}
      </div>
    </button>
  );
}

/**
 * Grupa „Z biblioteki GUS” pod głównymi wskaźnikami: do 50 pozycji naraz,
 * resztę dokłada przycisk. Reset licznika przy zmianie frazy robi rodzic przez `key`.
 */
export function LibraryGroup({ items, value, onSelect, initialShown = LIBRARY_PICK_LIMIT }: LibraryGroupProps) {
  const [shown, setShown] = useState(initialShown);
  if (items.length === 0) return null;
  const count = visibleCount(items.length, shown);
  const rest = items.length - count;

  return (
    <div className="py-2 first:pt-0 last:pb-0" role="group" aria-label="Z biblioteki GUS">
      <div className="px-3 py-1 text-xs font-semibold text-olowek uppercase tracking-wider">
        Z biblioteki GUS
      </div>
      {items.slice(0, count).map((item) => (
        <LibraryItem key={item.id} item={item} selected={item.id === value} onSelect={onSelect} />
      ))}
      {rest > 0 && (
        <button
          type="button"
          onClick={() => setShown(nextShown(shown, items.length))}
          className="w-full min-h-[44px] px-3 py-2.5 text-sm text-tusz text-center cursor-pointer rounded-none border-0 hover:bg-linia/15"
        >
          Pokaż więcej (jeszcze {rest})
        </button>
      )}
    </div>
  );
}
