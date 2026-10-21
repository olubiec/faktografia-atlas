import React, { useState, useMemo } from 'react';
import { NavArrowDown, Check, Search } from 'iconoir-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icon } from '@/view/ui/Icon';
import { normalize } from '@/core/search/normalize';
import type { Indicator } from '@/core/profile/profile';
import { cn } from '@/lib/utils';

export interface IndicatorPickerProps {
  indicators: Indicator[];
  value: string | null;
  onChange: (id: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialQuery?: string;
  className?: string;
}

export interface IndicatorPickerContentProps {
  indicators: Indicator[];
  value: string | null;
  query: string;
  onQueryChange: (query: string) => void;
  onSelect: (id: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  activeIndex?: number;
  setActiveIndex?: (index: number) => void;
  className?: string;
}

/**
 * Grupuje wskaźniki według pola `group`, zachowując kolejność pierwszego wystąpienia grupy.
 */
function groupIndicators(indicators: Indicator[]): Record<string, Indicator[]> {
  const groups: Record<string, Indicator[]> = {};
  for (const ind of indicators) {
    if (!groups[ind.group]) {
      groups[ind.group] = [];
    }
    groups[ind.group].push(ind);
  }
  return groups;
}

/**
 * Filtruje wskaźniki po nazwie z wykorzystaniem normalizacji tekstu (bez polskich znaków).
 */
function filterIndicators(indicators: Indicator[], query: string): Indicator[] {
  if (!query || !query.trim()) {
    return indicators;
  }
  const normalizedQuery = normalize(query);
  return indicators.filter((ind) => normalize(ind.name).includes(normalizedQuery));
}

/**
 * Czysta funkcja obsługi klawiatury dla nawigacji strzałkami, Enter i Escape.
 */
function handlePickerKeyDown(
  e: { key: string; preventDefault: () => void },
  totalItems: number,
  currentIndex: number
): { activeIndex: number; selectCurrent?: boolean; closePopover?: boolean } {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (totalItems === 0) return { activeIndex: -1 };
    const next = currentIndex < 0 ? 0 : (currentIndex + 1) % totalItems;
    return { activeIndex: next };
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (totalItems === 0) return { activeIndex: -1 };
    const prev = currentIndex <= 0 ? totalItems - 1 : currentIndex - 1;
    return { activeIndex: prev };
  }

  if (e.key === 'Enter') {
    e.preventDefault();
    return { activeIndex: currentIndex, selectCurrent: true };
  }

  if (e.key === 'Escape') {
    e.preventDefault();
    return { activeIndex: currentIndex, closePopover: true };
  }

  return { activeIndex: currentIndex };
}

/**
 * Komponent wewnętrzny zawierający listę i pole wyszukiwania.
 * Wyeksportowany w celu umożliwienia bezpośredniego testowania struktury DOM.
 */
export function IndicatorPickerContent({
  indicators,
  value,
  query,
  onQueryChange,
  onSelect,
  onKeyDown,
  activeIndex = -1,
  setActiveIndex,
  className,
}: IndicatorPickerContentProps) {
  const filteredIndicators = useMemo(
    () => filterIndicators(indicators, query),
    [indicators, query]
  );

  const groupedFiltered = useMemo(
    () => groupIndicators(filteredIndicators),
    [filteredIndicators]
  );

  let flatItemCounter = 0;

  return (
    <div className={cn('flex flex-col w-full h-full max-h-full min-h-0', className)}>
      {/* Pole wyszukiwania */}
      <div className="p-3 border-b border-linia bg-arkusz sticky top-0 z-10 flex items-center gap-2 shrink-0">
        <Icon icon={Search} size={20} aria-hidden={true} className="text-olowek flex-shrink-0" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Szukaj wskaźnika…"
          aria-label="Szukaj wskaźnika"
          className="w-full bg-transparent text-tusz placeholder:text-olowek text-sm min-h-[44px] focus:outline-none"
          autoFocus
        />
      </div>

      {/* Lista wskaźników */}
      <div
        role="listbox"
        aria-label="Lista wskaźników"
        className="flex-1 overflow-y-auto p-1 divide-y divide-linia/20 min-h-0"
      >
        {filteredIndicators.length === 0 ? (
          <div role="status" className="p-6 text-center text-olowek text-sm">
            Brak wskaźnika o tej nazwie
          </div>
        ) : (
          Object.entries(groupedFiltered).map(([groupName, groupItems]) => (
            <div key={groupName} className="py-2 first:pt-0 last:pb-0" role="group">
              <div className="px-3 py-1 text-xs font-semibold text-olowek uppercase tracking-wider">
                {groupName}
              </div>
              {groupItems.map((item) => {
                const currentIndex = flatItemCounter++;
                const isSelected = item.id === value;
                const isActive = currentIndex === activeIndex;

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected ? 'true' : 'false'}
                    onClick={() => onSelect(item.id)}
                    onMouseEnter={() => setActiveIndex?.(currentIndex)}
                    ref={(node) => {
                      if (isActive && node) {
                        node.scrollIntoView({ block: 'nearest' });
                      }
                    }}
                    className={cn(
                      'flex items-center justify-between gap-3 w-full px-3 py-2.5 min-h-[44px] text-left cursor-pointer rounded-none border-0 transition-colors',
                      isSelected ? 'bg-linia/30 text-tusz font-semibold' : 'text-tusz hover:bg-linia/15',
                      isActive && !isSelected && 'bg-linia/15'
                    )}
                  >
                    <div className="flex flex-col min-w-0 flex-1 pr-1">
                      <span className="text-sm whitespace-normal break-words text-tusz">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-olowek font-mono border border-linia/60 px-1.5 py-0.5 bg-kalka whitespace-nowrap">
                        {item.unit}
                      </span>
                      {isSelected && (
                        <Icon icon={Check} size={18} aria-hidden={true} className="text-korekta" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function IndicatorPicker({
  indicators,
  value,
  onChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  initialQuery = '',
  className,
}: IndicatorPickerProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const [query, setQuery] = useState(initialQuery);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setQuery('');
      setActiveIndex(-1);
    }
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    setActiveIndex(0);
  };

  const selectedIndicator = useMemo(
    () => indicators.find((ind) => ind.id === value) || null,
    [indicators, value]
  );

  const filteredIndicators = useMemo(
    () => filterIndicators(indicators, query),
    [indicators, query]
  );

  const handleSelect = (id: string) => {
    onChange(id);
    handleOpenChange(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const result = handlePickerKeyDown(e, filteredIndicators.length, activeIndex);
    setActiveIndex(result.activeIndex);

    if (result.selectCurrent && result.activeIndex >= 0 && filteredIndicators[result.activeIndex]) {
      handleSelect(filteredIndicators[result.activeIndex].id);
    } else if (result.closePopover) {
      handleOpenChange(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={isOpen}
          className={cn(
            'flex items-center justify-between gap-2 px-4 py-2 min-h-[44px] w-full text-left bg-arkusz text-tusz border border-linia hover:bg-linia/10 focus:outline-none focus:ring-2 focus:ring-tusz cursor-pointer rounded-none transition-colors',
            className
          )}
        >
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-xs text-olowek uppercase tracking-wider">Wskaźnik</span>
            <span className="font-semibold text-sm text-tusz truncate">
              {selectedIndicator ? selectedIndicator.name : 'Wybierz wskaźnik'}
            </span>
          </div>
          <Icon icon={NavArrowDown} size={20} aria-hidden={true} className="text-tusz flex-shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        collisionPadding={8}
        aria-label="Wybór wskaźnika"
        className="w-80 sm:w-96 p-0 bg-arkusz text-tusz border border-linia rounded-none shadow-none z-50 flex flex-col max-h-[var(--radix-popover-content-available-height)] sm:max-h-[min(80vh,var(--radix-popover-content-available-height))] overflow-hidden"
      >
        <IndicatorPickerContent
          indicators={indicators}
          value={value}
          query={query}
          onQueryChange={handleQueryChange}
          onSelect={handleSelect}
          onKeyDown={onKeyDown}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
        />
      </PopoverContent>
    </Popover>
  );
}
