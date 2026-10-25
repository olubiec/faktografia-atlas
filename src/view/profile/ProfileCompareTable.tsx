import type { UnitProfile } from '../../core/profile/profile';
import { compare } from '../../core/compare/compare';
import { formatValue } from '../../core/format/number';
import { unitLabel } from '../../core/units/label';
import { cn } from '../../lib/utils';

export interface ProfileCompareTableProps {
  profileA: UnitProfile;
  profileB: UnitProfile;
  className?: string;
}

/**
 * Tabela porównania dwóch jednostek obok siebie.
 * Prezentuje wskaźniki posiadające dane w obu profilach, wartości obu miejsc,
 * ich pozycje w rankingu krajowym oraz słowne określenie różnicy (diffText z compare()).
 * W przypadku porównywania jednostek na różnych poziomach wyświetla ostrzeżenie.
 */
export function ProfileCompareTable({
  profileA,
  profileB,
  className,
}: ProfileCompareTableProps) {
  const result = compare(profileA, profileB);

  // Filtrujemy tylko te wskaźniki, które posiadają poprawne dane liczbowe w obu profilach
  const validRows = result.rows.filter(
    (row) => row.a !== null && row.a !== undefined && row.b !== null && row.b !== undefined
  );

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

  return (
    <div className={cn('space-y-3 w-full max-w-full', className)} data-slot="compare-table-container">
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
      ) : (
        <div className="w-full overflow-x-auto">
          <table
            data-slot="compare-table"
            className="w-full text-left text-xs border-collapse"
          >
            <thead>
              <tr className="border-b border-linia text-olowek font-medium">
                <th scope="col" className="py-2 pr-2 font-medium">
                  Wskaźnik
                </th>
                <th scope="col" className="py-2 px-2 text-right font-medium">
                  {unitAName}
                </th>
                <th scope="col" className="py-2 px-2 text-right font-medium">
                  {unitBName}
                </th>
                <th scope="col" className="py-2 pl-2 text-right font-medium">
                  Różnica
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-linia">
              {validRows.map((row) => {
                const itemA = profileAIndicatorsMap.get(row.indicatorId);
                const itemB = profileBIndicatorsMap.get(row.indicatorId);

                const unitUnit = itemA?.indicator.unit;
                const formattedA = formatValue(row.a, unitUnit);
                const formattedB = formatValue(row.b, unitUnit);

                const rankTextA =
                  itemA && itemA.rankNational !== null && itemA.totalNational > 0
                    ? `${itemA.rankNational}. miejsce`
                    : null;

                const rankTextB =
                  itemB && itemB.rankNational !== null && itemB.totalNational > 0
                    ? `${itemB.rankNational}. miejsce`
                    : null;

                return (
                  <tr
                    key={row.indicatorId}
                    data-slot="compare-row"
                    className="align-top"
                  >
                    <td className="py-3 pr-2 font-medium text-tusz break-words">
                      {itemA?.indicator.name ?? row.indicatorId}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums">
                      <div className="font-bold font-mono text-tusz">
                        {formattedA}
                      </div>
                      {rankTextA && (
                        <div className="text-xs text-olowek font-mono">
                          {rankTextA}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums">
                      <div className="font-bold font-mono text-tusz">
                        {formattedB}
                      </div>
                      {rankTextB && (
                        <div className="text-xs text-olowek font-mono">
                          {rankTextB}
                        </div>
                      )}
                    </td>
                    <td className="py-3 pl-2 text-right font-mono text-olowek font-medium break-words">
                      {row.diffText}
                    </td>
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