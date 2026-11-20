import { useState } from 'react';
import { NavArrowDown, NavArrowUp } from 'iconoir-react';
import type { Indicator } from '@/core/profile/profile';
import { IndicatorPickerContent } from '@/view/controls/IndicatorPicker';
import { Icon } from '@/view/ui/Icon';

/** Wybór wskaźnika w arkuszu telefonu: przycisk z bieżącym wskaźnikiem i lista („Moje” + bieżący). */
export function SheetIndicatorPicker({ indicators, indicator, onSelect, defaultOpen = true }: { indicators: Indicator[]; indicator: Indicator; onSelect: (id: string) => void; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const FOCUS = 'focus:outline-none focus:ring-2 focus:ring-tusz cursor-pointer rounded-none transition-colors hover:bg-linia/10';
  return (
    <div className="flex flex-col">
      <div className="flex items-stretch bg-arkusz border border-linia">
        {/* Nazwa wskaźnika tylko otwiera listę; zwija ją osobna strzałka obok. */}
        <button type="button" aria-expanded={open} onClick={() => setOpen(true)}
          className={`flex flex-1 min-w-0 items-center px-4 py-2 min-h-[44px] text-left text-tusz ${FOCUS}`}
        >
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-xs text-olowek">Wskaźnik</span>
            <span className="font-semibold text-sm text-tusz line-clamp-2 break-words leading-tight" title={indicator.name}>
              {indicator.name}
            </span>
          </div>
        </button>
        <button type="button" aria-expanded={open} aria-label={open ? 'Zwiń listę' : 'Rozwiń listę'} onClick={() => setOpen((o) => !o)}
          className={`flex items-center justify-center min-h-[44px] min-w-[44px] text-tusz shrink-0 ${FOCUS}`}
        >
          <Icon icon={open ? NavArrowUp : NavArrowDown} size={20} aria-hidden={true} className="text-tusz" />
        </button>
      </div>
      {open && (
        <div className="max-h-[220px] flex flex-col border border-t-0 border-linia bg-arkusz overflow-hidden">
          <IndicatorPickerContent indicators={indicators} value={indicator.id} query={query} onQueryChange={setQuery}
            onSelect={(id) => { onSelect(id); setOpen(false); setQuery(''); }} />
        </div>
      )}
    </div>
  );
}
