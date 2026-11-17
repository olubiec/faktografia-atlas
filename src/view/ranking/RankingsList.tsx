import { useRef, useState } from 'react';
import { Link } from 'react-router';
import type { RankedUnit } from '../../core/ranking/ranking';
import type { Unit, UnitLevel } from '../../core/units/types';
import { unitLabel } from '../../core/units/label';

export interface RankingsListProps {
  items: RankedUnit[];
  unitsByTeryt: Map<string, Unit>;
  unit: string;
  indicatorId: string;
  level: UnitLevel;
  year: number | null;
  format: (n: number) => string;
  pageSize?: number;
}

/** Adres mapy z wybraną jednostką, wskaźnikiem, poziomem i (opcjonalnie) rokiem. */
function mapHref(teryt: string, indicatorId: string, level: UnitLevel, year: number | null) {
  const base = `/?u=${encodeURIComponent(teryt)}&i=${encodeURIComponent(indicatorId)}&l=${level}`;
  return year === null ? base : `${base}&y=${year}`;
}

/**
 * Długa lista rankingu: miejsce, pełna nazwa, wartość z jednostką i słupek.
 * Pokazuje `pageSize` pozycji, resztę dokłada przyciskiem „Pokaż więcej”.
 * Słupek liczony jak w `RankingBars` (oś zero dla wartości ujemnych).
 */
export function RankingsList({
  items,
  unitsByTeryt,
  unit,
  indicatorId,
  level,
  year,
  format,
  pageSize = 50,
}: RankingsListProps) {
  const [shown, setShown] = useState(pageSize);
  const moreRef = useRef<HTMLButtonElement>(null);

  if (items.length === 0) {
    return (
      <p role="status" className="text-sm text-olowek py-4">
        Brak danych dla tego wyboru
      </p>
    );
  }

  const values = items.map((i) => i.value);
  const minVal = Math.min(0, ...values);
  const maxVal = Math.max(0, ...values);
  const range = maxVal - minVal || 1;
  const zeroPos = (-minVal / range) * 100;

  const visible = items.slice(0, shown);
  const remaining = items.length - visible.length;

  return (
    <div className="w-full">
      <ol className="list-none p-0 m-0">
        {visible.map((item) => {
          const u = unitsByTeryt.get(item.teryt);
          const name = u ? unitLabel(u) : `Jednostka ${item.teryt}`;
          const negative = item.value < 0;
          const width = Math.min(100, (Math.abs(item.value) / range) * 100);
          const left = negative ? Math.max(0, zeroPos - width) : zeroPos;
          return (
            <li key={item.teryt} className="border-b border-linia/40">
              <Link
                to={mapHref(item.teryt, indicatorId, level, year)}
                className="flex items-center gap-2 w-full min-h-[44px] py-2 px-1 hover:bg-linia/15 focus:outline-none focus:ring-1 focus:ring-tusz"
              >
                <span className="text-xs font-mono text-olowek w-10 shrink-0 text-right">
                  {item.rank}.<span className="sr-only"> miejsce {item.rank}</span>
                </span>
                <span className="text-sm text-tusz min-w-0 flex-1 break-words">{name}</span>
                <span aria-hidden="true" className="w-20 sm:w-32 h-2.5 bg-kalka relative shrink-0 overflow-hidden">
                  <span
                    data-bar
                    data-negative={negative ? 'true' : 'false'}
                    className={`absolute top-0 bottom-0 ${negative ? 'bg-korekta' : 'bg-linia'}`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </span>
                <span className="text-xs font-mono font-semibold text-tusz tabular-nums text-right shrink-0 min-w-[72px]">
                  {format(item.value)}&nbsp;{unit}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      {remaining > 0 && (
        <button
          ref={moreRef}
          type="button"
          onClick={() => {
            setShown((s) => Math.min(items.length, s + pageSize));
            moreRef.current?.focus();
          }}
          className="w-full mt-2 py-2.5 px-3 min-h-[44px] text-xs font-semibold text-olowek hover:text-tusz hover:bg-linia/15 text-center border border-linia rounded-none cursor-pointer"
        >
          Pokaż więcej (jeszcze {remaining})
        </button>
      )}
    </div>
  );
}
