import { Xmark } from 'iconoir-react';
import type { Indicator, UnitProfile } from '../../core/profile/profile';
import { compare } from '../../core/compare/compare';
import type { CompareRow } from '../../core/compare/compare';
import { formatValue } from '../../core/format/number';
import { unitLabel } from '../../core/units/label';
import { useIsMobile } from '../hooks/useIsMobile';
import { cn } from '../../lib/utils';
import { Icon } from '../ui/Icon';

export interface ProfileCompareTableProps {
  profileA: UnitProfile;
  profileB: UnitProfile;
  className?: string;
  /** Dodatkowe wiersze (wskaźniki z biblioteki), np. z compareExtraRows. */
  extraRows?: { indicator: Indicator; row: CompareRow }[];
  /** Gdy podane, każdy wiersz ma przycisk × usuwający wskaźnik z listy. */
  onRemove?: (indicatorId: string) => void;
}

interface Entry {
  row: CompareRow;
  name: string;
  unit: string | undefined;
  rankA: string | null;
  rankB: string | null;
}

const rankText = (rank: number | null | undefined): string | null =>
  rank !== null && rank !== undefined && rank > 0 ? `${rank}. miejsce` : null;

function RemoveButton({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Usuń wiersz: ${name}`}
      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-olowek hover:text-tusz hover:bg-linia/15 focus:outline-none focus:ring-2 focus:ring-tusz cursor-pointer shrink-0"
    >
      <Icon icon={Xmark} aria-hidden={true} size={16} />
    </button>
  );
}

/**
 * Tabela porównania dwóch jednostek obok siebie.
 * Na telefonie (< 768 px) prezentuje czytelne dwupoziomowe karty ze sticky nagłówkiem.
 * Na komputerze prezentuje klasyczną 4-kolumnową tabelę.
 * Prezentuje wskaźniki posiadające dane w obu profilach, wartości obu miejsc,
 * ich pozycje w rankingu krajowym oraz słowne określenie różnicy (diffText z compare()).
 * W przypadku porównywania jednostek na różnych poziomach wyświetla ostrzeżenie.
 */
export function ProfileCompareTable({
  profileA,
  profileB,
  className,
  extraRows,
  onRemove,
}: ProfileCompareTableProps) {
  const isMobile = useIsMobile();
  const result = compare(profileA, profileB);

  // Filtrujemy tylko te wskaźniki, które posiadają poprawne dane liczbowe w obu profilach
  const hasBoth = (row: CompareRow) =>
    row.a !== null && row.a !== undefined && row.b !== null && row.b !== undefined;

  const unitAName = profileA.unit
    ? unitLabel(profileA.unit, { short: true })
    : `TERYT ${profileA.teryt}`;

  const unitBName = profileB.unit
    ? unitLabel(profileB.unit, { short: true })
    : `TERYT ${profileB.teryt}`;

  const profileAIndicatorsMap = new Map(
    profileA.indicators.map((item) => [item.indicatorId, item])
  );
  const profileBIndicatorsMap = new Map(
    profileB.indicators.map((item) => [item.indicatorId, item])
  );

  const mainEntries: Entry[] = result.rows.filter(hasBoth).map((row) => {
    const itemA = profileAIndicatorsMap.get(row.indicatorId);
    const itemB = profileBIndicatorsMap.get(row.indicatorId);
    return {
      row,
      name: itemA?.indicator.name ?? row.indicatorId,
      unit: itemA?.indicator.unit,
      rankA: itemA && itemA.totalNational > 0 ? rankText(itemA.rankNational) : null,
      rankB: itemB && itemB.totalNational > 0 ? rankText(itemB.rankNational) : null,
    };
  });
  const extraEntries: Entry[] = (extraRows ?? [])
    .filter((e) => hasBoth(e.row) && !profileAIndicatorsMap.has(e.indicator.id))
    .map((e) => ({
      row: e.row,
      name: e.indicator.name,
      unit: e.indicator.unit,
      rankA: rankText(e.row.rankA),
      rankB: rankText(e.row.rankB),
    }));
  const validRows = [...mainEntries, ...extraEntries];

  return (
    <div
      className={cn('space-y-3 w-full max-w-full', className)}
      data-slot="compare-table-container"
    >
      {result.differentLevels && (
        <div
          data-slot="different-levels-notice"
          className="p-3 text-xs bg-arkusz border border-linia text-olowek font-medium"
        >
          różne poziomy – porównuj ostrożnie
        </div>
      )}

      {validRows.length === 0 ? (
        <p className="py-6 text-sm text-olowek text-center">
          Brak wspólnych danych dla wybranych jednostek.
        </p>
      ) : isMobile ? (
        <div data-slot="compare-table" className="w-full">
          {/* Sticky nagłówek nazw obu jednostek */}
          <div
            data-slot="compare-sticky-header"
            className="sticky top-0 z-10 bg-arkusz border-b border-linia py-2 px-1 grid grid-cols-2 gap-2 text-xs font-semibold text-olowek"
          >
            <div className="truncate" title={unitAName}>
              {unitAName}
            </div>
            <div className="truncate text-right" title={unitBName}>
              {unitBName}
            </div>
          </div>
          <div className="divide-y divide-linia">
            {validRows.map(({ row, name, unit, rankA, rankB }) => {
              const formattedA = formatValue(row.a, unit);
              const formattedB = formatValue(row.b, unit);
              const rankTextA = rankA;
              const rankTextB = rankB;

              return (
                <div
                  key={row.indicatorId}
                  data-slot="compare-row"
                  className="py-2.5 px-1 space-y-1.5"
                >
                  {/* Poziom 1: pełna szerokość wiersza na nazwę wskaźnika i różnicę */}
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium text-tusz text-xs break-words">
                      {name}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <span className="font-mono text-olowek font-medium text-xs text-right">
                        {row.diffText}
                      </span>
                      {onRemove && <RemoveButton name={name} onClick={() => onRemove(row.indicatorId)} />}
                    </span>
                  </div>

                  {/* Poziom 2: 2 równe kolumny z wartościami A i B w font-mono */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5 text-xs">
                    <div className="tabular-nums">
                      <div className="font-bold font-mono text-tusz">
                        {formattedA}
                      </div>
                      {rankTextA && (
                        <div className="text-xs text-olowek font-mono">
                          {rankTextA}
                        </div>
                      )}
                    </div>
                    <div className="tabular-nums text-right">
                      <div className="font-bold font-mono text-tusz">
                        {formattedB}
                      </div>
                      {rankTextB && (
                        <div className="text-xs text-olowek font-mono">
                          {rankTextB}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className="w-full overflow-x-auto"
          tabIndex={0}
          role="region"
          aria-label="Tabela porównania wskaźników"
        >
          <table
            data-slot="compare-table"
            className="w-full text-left text-xs border-collapse"
          >
            <thead>
              <tr className="border-b border-linia text-olowek font-medium">
                <th scope="col" className="py-2 pr-1.5 sm:pr-2 font-medium">
                  Wskaźnik
                </th>
                <th scope="col" className="py-2 px-1.5 sm:px-2 text-right font-medium">
                  {unitAName}
                </th>
                <th scope="col" className="py-2 px-1.5 sm:px-2 text-right font-medium">
                  {unitBName}
                </th>
                <th scope="col" className="py-2 pl-1.5 sm:pl-2 text-right font-medium">
                  Różnica
                </th>
                {onRemove && (
                  <th scope="col" className="py-2 pl-1.5 sm:pl-2">
                    <span className="sr-only">Usuń</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-linia">
              {validRows.map(({ row, name, unit, rankA, rankB }) => {
                const formattedA = formatValue(row.a, unit);
                const formattedB = formatValue(row.b, unit);
                const rankTextA = rankA;
                const rankTextB = rankB;

                return (
                  <tr
                    key={row.indicatorId}
                    data-slot="compare-row"
                    className="align-top"
                  >
                    <td className="py-2.5 sm:py-3 pr-1.5 sm:pr-2 font-medium text-tusz break-words">
                      {name}
                    </td>
                    <td className="py-2.5 sm:py-3 px-1.5 sm:px-2 text-right tabular-nums">
                      <div className="font-bold font-mono text-tusz text-xs">
                        {formattedA}
                      </div>
                      {rankTextA && (
                        <div className="text-xs text-olowek font-mono">
                          {rankTextA}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 sm:py-3 px-1.5 sm:px-2 text-right tabular-nums">
                      <div className="font-bold font-mono text-tusz text-xs">
                        {formattedB}
                      </div>
                      {rankTextB && (
                        <div className="text-xs text-olowek font-mono">
                          {rankTextB}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 sm:py-3 pl-1.5 sm:pl-2 text-right font-mono text-olowek font-medium break-words text-xs">
                      {row.diffText}
                    </td>
                    {onRemove && (
                      <td className="py-0 pl-1.5 sm:pl-2 text-right">
                        <RemoveButton name={name} onClick={() => onRemove(row.indicatorId)} />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
