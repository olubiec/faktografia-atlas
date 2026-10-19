import type { ProfileIndicatorItem } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import { formatValue } from '../../core/format/number';
import { Sparkline } from './Sparkline';

export interface ProfileIndicatorRowProps {
  item: ProfileIndicatorItem;
  units: Unit[];
}

/**
 * Wiersz wskaźnika w arkuszu profilu jednostki.
 * Wyświetla nazwę, mały wykres sparkline, sformatowaną wartość z jednostką, rok, miejsce w kraju,
 * ewentualny przypis oraz informację o danych dziedziczonych od rodzica.
 */
export function ProfileIndicatorRow({ item, units }: ProfileIndicatorRowProps) {
  const { indicator, value, year, rankNational, totalNational, fromParent, series } = item;

  const formattedVal = formatValue(value, indicator.unit);

  let parentNote: string | null = null;
  if (fromParent) {
    const parentUnit = units.find((u) => u.teryt === fromParent);
    if (parentUnit) {
      const levelWord =
        parentUnit.level === 'pow'
          ? 'powiatu'
          : parentUnit.level === 'woj'
            ? 'województwa'
            : parentUnit.level === 'gmi'
              ? 'gminy'
              : 'jednostki';
      parentNote = `dane dla ${levelWord} ${parentUnit.name}`;
    } else {
      parentNote = `dane dla ${fromParent}`;
    }
  }

  const hasRank = value !== null && rankNational !== null && totalNational > 0;

  return (
    <div className="py-3 border-b border-linia last:border-b-0 space-y-1">
      <div className="flex justify-between items-baseline gap-2">
        <span className="text-sm font-normal text-tusz break-words min-w-0 flex-1">
          {indicator.name}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {series && (
            <Sparkline series={series} unit={indicator.unit} label={indicator.name} />
          )}
          <span className="text-sm font-bold font-mono text-tusz tabular-nums">
            {formattedVal}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-2 text-xs text-olowek font-mono">
        {year !== null && <span>{year}</span>}
        {hasRank && (
          <>
            {year !== null && <span>•</span>}
            <span>
              {rankNational}. miejsce wśród {totalNational}
            </span>
          </>
        )}
      </div>

      {parentNote && (
        <p className="text-xs text-olowek italic break-words">{parentNote}</p>
      )}

      {indicator.footnote && (
        <p className="text-xs text-olowek break-words">{indicator.footnote}</p>
      )}
    </div>
  );
}
