import { useState } from 'react';
import type { RankedUnit } from '../../core/ranking/ranking';
import { formatValue } from '../../core/format/number';
import { cn } from '../../lib/utils';

export interface RankingBarsProps {
  items: RankedUnit[];
  unit?: string | null;
  selectedTeryt?: string | null;
  limit?: number;
  onSelect?: (teryt: string) => void;
  title?: string;
}

/**
 * Komponent listy rankingowej ze słupkami poziomymi dla jednostek administracyjnych.
 * Rysuje wartości proporcjonalnie do minimum i maksimum (z osią zero dla wartości ujemnych).
 * Wyróżnia wybraną jednostkę kolorem tokenu `korekta` i pogrubioną czcionką.
 */
export function RankingBars({
  items,
  unit,
  selectedTeryt,
  limit = 10,
  onSelect,
  title,
}: RankingBarsProps) {
  const [expanded, setExpanded] = useState(false);

  if (!items || items.length === 0) {
    return null;
  }

  // Wyznaczanie zakresu wartości (w tym dla wartości ujemnych)
  const values = items.map((i) => i.value);
  const minVal = Math.min(0, ...values);
  const maxVal = Math.max(0, ...values);
  const range = maxVal - minVal || 1;
  const zeroPos = ((-minVal) / range) * 100;

  // Ustalanie widocznych elementów w zależności od limitu i zaznaczenia
  let visibleItems = items;
  const isOverflowing = items.length > limit;

  if (!expanded && isOverflowing) {
    const baseSlice = items.slice(0, limit);
    const selectedIndex = selectedTeryt
      ? items.findIndex((i) => i.teryt === selectedTeryt)
      : -1;

    if (selectedIndex >= limit) {
      visibleItems = [...baseSlice, items[selectedIndex]];
    } else {
      visibleItems = baseSlice;
    }
  }

  return (
    <div className="w-full space-y-1">
      {title && (
        <h3 className="text-sm font-semibold text-tusz px-1 mb-2">{title}</h3>
      )}

      <div role="list" aria-label={title || 'Ranking jednostek'} className="space-y-0.5">
        {visibleItems.map((item) => {
          const isSelected = selectedTeryt ? item.teryt === selectedTeryt : false;
          const formattedVal = formatValue(item.value, unit);

          // Obliczanie szerokości i pozycji słupka
          let leftPercent = 0;
          let widthPercent = 0;

          if (minVal < 0) {
            if (item.value >= 0) {
              leftPercent = zeroPos;
              widthPercent = (item.value / range) * 100;
            } else {
              const absVal = Math.abs(item.value);
              widthPercent = (absVal / range) * 100;
              leftPercent = zeroPos - widthPercent;
            }
          } else {
            leftPercent = 0;
            widthPercent = (item.value / (maxVal || 1)) * 100;
          }

          const ariaLabel = `${item.name}: ${formattedVal}, ${item.rank}. miejsce`;

          const rowContent = (
            <>
              <span className="text-xs font-mono text-olowek w-6 shrink-0 text-right">
                {item.rank}.
              </span>

              <span
                className={cn(
                  'text-sm min-w-0 flex-1 truncate text-left',
                  isSelected ? 'font-bold text-korekta' : 'font-normal text-tusz'
                )}
              >
                {item.name}
              </span>

              <div className="w-24 sm:w-32 h-2.5 bg-kalka relative shrink-0 overflow-hidden">
                {minVal < 0 && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-olowek/40 z-10"
                    style={{ left: `${zeroPos}%` }}
                  />
                )}
                <div
                  className={cn(
                    'absolute top-0 bottom-0 transition-all',
                    isSelected ? 'bg-korekta' : 'bg-linia'
                  )}
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                  }}
                />
              </div>

              <span
                className={cn(
                  'text-xs font-mono shrink-0 tabular-nums text-right min-w-[60px]',
                  isSelected ? 'font-bold text-korekta' : 'font-semibold text-tusz'
                )}
              >
                {formattedVal}
              </span>
            </>
          );

          if (onSelect) {
            return (
              <button
                key={item.teryt}
                type="button"
                role="listitem"
                onClick={() => onSelect(item.teryt)}
                aria-label={ariaLabel}
                className="flex items-center gap-2 w-full py-2 min-h-[44px] text-left transition-colors cursor-pointer border-0 rounded-none bg-transparent hover:bg-linia/15 focus:outline-none focus:ring-1 focus:ring-tusz px-1"
              >
                {rowContent}
              </button>
            );
          }

          return (
            <div
              key={item.teryt}
              role="listitem"
              aria-label={ariaLabel}
              className="flex items-center gap-2 w-full py-2 min-h-[44px] text-left px-1"
            >
              {rowContent}
            </div>
          );
        })}
      </div>

      {!expanded && isOverflowing && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full mt-2 py-2.5 px-3 min-h-[44px] text-xs font-semibold text-olowek hover:text-tusz hover:bg-linia/15 transition-colors text-center border border-linia rounded-none cursor-pointer"
        >
          Pokaż wszystkie ({items.length})
        </button>
      )}
    </div>
  );
}
