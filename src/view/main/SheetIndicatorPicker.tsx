import { useState } from 'react';
import { NavArrowDown, NavArrowUp } from 'iconoir-react';
import type { Indicator } from '@/core/profile/profile';
import { isNewIndicator } from '@/core/facts/fresh-label';
import { peekNewIds } from '@/core/indicators/load-available';
import { DataMenu } from '@/view/data-menu/DataMenu';
import { clearMenuUrl, readMenuUrl } from '@/view/data-menu/menuUrl';
import { Icon } from '@/view/ui/Icon';
import { NewBadge } from '@/view/ui/NewBadge';

export type SheetIndicatorPickerProps = {
  /** Nieużywane: spis bierze samo DataMenu (zostaje dla zgodności z panelem, sprząta B14). */
  indicators?: Indicator[];
  indicator: Indicator;
  onSelect: (id: string) => void;
  defaultOpen?: boolean;
};

/**
 * Wybór danych w arkuszu telefonu: przycisk z bieżącym wskaźnikiem i to samo menu co na komputerze
 * (DataMenu), ale w układzie „stack”: jeden widok naraz, okruszki „Wszystkie › Dział › Grupa”.
 */
export function SheetIndicatorPicker({ indicator, onSelect, defaultOpen = true }: SheetIndicatorPickerProps) {
  const [open, setOpen] = useState(defaultOpen);
  // Adres ?menu=dane&q=<fraza> (stara Biblioteka) wpisuje frazę w szukajkę; po zwinięciu znika z adresu.
  const [initialQuery] = useState(() => readMenuUrl().query);
  const FOCUS = 'focus:outline-none focus:ring-2 focus:ring-tusz cursor-pointer rounded-none transition-colors hover:bg-linia/10';
  const change = (next: boolean) => {
    setOpen(next);
    if (!next) clearMenuUrl();
  };
  return (
    <div className="flex flex-col" data-slot="sheet-indicator-picker">
      <div className="flex items-stretch bg-arkusz border border-linia">
        {/* Nazwa wskaźnika tylko otwiera menu; zwija je osobna strzałka obok. */}
        <button type="button" aria-expanded={open} onClick={() => setOpen(true)}
          className={`flex flex-1 min-w-0 items-center px-4 py-2 min-h-[44px] text-left text-tusz ${FOCUS}`}
        >
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-xs text-olowek">Wskaźnik</span>
            <span className="font-semibold text-sm text-tusz line-clamp-2 break-words leading-tight" title={indicator.name}>
              {indicator.name}
              {/* „Nowość” tylko, gdy spis jest już w pamięci (bez dodatkowego żądania). */}
              {isNewIndicator(indicator.id, peekNewIds()) && <NewBadge />}
            </span>
          </div>
        </button>
        <button type="button" aria-expanded={open} aria-label={open ? 'Zwiń menu danych' : 'Rozwiń menu danych'} onClick={() => change(!open)}
          className={`flex items-center justify-center min-h-[44px] min-w-[44px] text-tusz shrink-0 ${FOCUS}`}
        >
          <Icon icon={open ? NavArrowUp : NavArrowDown} size={20} aria-hidden={true} className="text-tusz" />
        </button>
      </div>
      {open && (
        <div className="max-h-[50dvh] overflow-y-auto border border-t-0 border-linia bg-arkusz p-3" data-slot="sheet-data-menu">
          <DataMenu selectedId={indicator.id} onSelect={onSelect} onClose={() => change(false)} layout="stack" initialQuery={initialQuery} />
        </div>
      )}
    </div>
  );
}
