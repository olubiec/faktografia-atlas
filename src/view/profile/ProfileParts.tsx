import { useState, useRef } from 'react';
import type { PartsRow } from '../../core/parts/rows';
import { formatValue } from '../../core/format/number';
import { useIsMobile } from '../hooks/useIsMobile';
import { Icon } from '../ui/Icon';
import { NavArrowDown, NavArrowUp } from 'iconoir-react';

export interface ProfilePartsProps {
  rows: PartsRow[];
  year?: number | null;
  onFirstExpand?: () => void;
  defaultExpanded?: boolean;
}

/**
 * Zwijany blok „Miasto i obszar wiejski” dla gmin miejsko-wiejskich.
 * Wyświetla zestawienie danych GUS dla całej gminy, miasta oraz obszaru wiejskiego.
 * Na komputerze renderuje tabelę, na telefonie (< 768 px) karty per wskaźnik.
 */
export function ProfileParts({
  rows,
  year: _year = null,
  onFirstExpand,
  defaultExpanded = false,
}: ProfilePartsProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasExpandedRef = useRef(defaultExpanded);
  const isMobile = useIsMobile();

  const handleToggle = () => {
    if (!isExpanded && !hasExpandedRef.current) {
      hasExpandedRef.current = true;
      onFirstExpand?.();
    }
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="border border-linia bg-arkusz my-4">
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={handleToggle}
        className="w-full flex items-center justify-between min-h-[44px] px-4 py-3 text-left font-medium text-tusz hover:bg-linia/10 focus:outline-none focus:ring-2 focus:ring-tusz cursor-pointer transition-colors"
      >
        <span className="text-sm font-semibold">Miasto i obszar wiejski</span>
        <Icon
          icon={isExpanded ? NavArrowUp : NavArrowDown}
          size={20}
          aria-hidden={true}
          className="text-olowek shrink-0 ml-2"
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-linia pt-3">
          {rows.length === 0 ? (
            <div className="py-4 text-center text-olowek text-xs" role="status">
              Ładowanie...
            </div>
          ) : isMobile ? (
            <div className="space-y-3" data-testid="parts-cards">
              {rows.map((row) => (
                <div
                  key={row.indicatorId}
                  className="p-3 bg-arkusz border border-linia text-xs space-y-2"
                  data-testid="parts-card"
                >
                  <div className="font-semibold text-tusz">{row.name}</div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-center pt-2 border-t border-linia/50">
                    <div>
                      <div className="text-xs font-sans text-olowek">Gmina</div>
                      <div className="font-medium text-tusz mt-0.5">
                        {formatValue(row.gmina, row.unit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-sans text-olowek">Miasto</div>
                      <div className="font-medium text-tusz mt-0.5">
                        {formatValue(row.city, row.unit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-sans text-olowek">Obszar wiejski</div>
                      <div className="font-medium text-tusz mt-0.5">
                        {formatValue(row.rural, row.unit)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table
                className="w-full text-xs text-left border-collapse"
                data-testid="parts-table"
              >
                <thead>
                  <tr className="border-b border-linia text-olowek font-normal">
                    <th scope="col" className="py-2 pr-3 font-normal">
                      Wskaźnik
                    </th>
                    <th scope="col" className="py-2 px-2 font-normal text-right">
                      Gmina
                    </th>
                    <th scope="col" className="py-2 px-2 font-normal text-right">
                      Miasto
                    </th>
                    <th scope="col" className="py-2 pl-2 font-normal text-right">
                      Obszar wiejski
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-linia/50 font-mono">
                  {rows.map((row) => (
                    <tr key={row.indicatorId} className="hover:bg-linia/10">
                      <td className="py-2 pr-3 font-sans font-medium text-tusz break-words">
                        {row.name}
                      </td>
                      <td className="py-2 px-2 text-right text-tusz tabular-nums">
                        {formatValue(row.gmina, row.unit)}
                      </td>
                      <td className="py-2 px-2 text-right text-tusz tabular-nums">
                        {formatValue(row.city, row.unit)}
                      </td>
                      <td className="py-2 pl-2 text-right text-tusz tabular-nums">
                        {formatValue(row.rural, row.unit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-3 text-xs text-olowek">
            Dane GUS (Bank Danych Lokalnych) dla części gminy miejsko-wiejskiej.
          </p>
        </div>
      )}
    </div>
  );
}
