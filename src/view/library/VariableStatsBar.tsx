import { useMemo } from 'react';
import { formatValue } from '@/core/format/number';
import { computeBreaks } from '@/core/map/classes';
import type { RankedUnit } from '@/core/ranking/ranking';

export interface VariableStatsBarProps {
  rankedItems: RankedUnit[];
  years: number[];
  selectedYear: number | null;
  unit?: string | null;
}

function computeMedian(sortedAscending: number[]): number | null {
  if (sortedAscending.length === 0) return null;
  const mid = Math.floor(sortedAscending.length / 2);
  if (sortedAscending.length % 2 === 0) {
    return (sortedAscending[mid - 1] + sortedAscending[mid]) / 2;
  }
  return sortedAscending[mid];
}

export function VariableStatsBar({
  rankedItems,
  years,
  unit,
}: VariableStatsBarProps) {
  const { count, median, min, max, breaks } = useMemo(() => {
    const validValues = rankedItems
      .map((item) => item.value)
      .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));

    const sortedAsc = [...validValues].sort((a, b) => a - b);
    const count = sortedAsc.length;
    const median = computeMedian(sortedAsc);
    const min = count > 0 ? sortedAsc[0] : null;
    const max = count > 0 ? sortedAsc[sortedAsc.length - 1] : null;
    const computed = computeBreaks(sortedAsc, 'quantile', 5);

    return {
      count,
      median,
      min,
      max,
      breaks: computed,
    };
  }, [rankedItems]);

  const yearsLabel = useMemo(() => {
    if (years.length === 0) return '—';
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    if (minYear === maxYear) return String(minYear);
    return `${minYear}–${maxYear}`;
  }, [years]);

  const yearsCountLabel = useMemo(() => {
    const len = years.length;
    if (len === 0) return '';
    if (len === 1) return '1 rok';
    if (len < 5) return `${len} lata`;
    return `${len} lat`;
  }, [years]);

  return (
    <section
      data-testid="variable-stats-bar"
      aria-label="Statystyki opisowe wskaźnika"
      className="space-y-4"
    >
      <div
        data-testid="variable-stats-cards"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        {/* Karta 1: Liczba jednostek */}
        <div
          data-testid="stats-card-units"
          className="bg-arkusz border border-linia p-3 sm:p-4 flex flex-col justify-between"
        >
          <span className="text-xs font-semibold text-olowek uppercase tracking-wider">
            Liczba jednostek
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl md:text-2xl font-bold font-mono text-tusz">
              {formatValue(count, null, 0)}
            </span>
            <span className="text-xs text-olowek font-mono">z danymi</span>
          </div>
        </div>

        {/* Karta 2: Mediana */}
        <div
          data-testid="stats-card-median"
          className="bg-arkusz border border-linia p-3 sm:p-4 flex flex-col justify-between"
        >
          <span className="text-xs font-semibold text-olowek uppercase tracking-wider">
            Mediana
          </span>
          <div className="mt-1">
            <span className="text-xl md:text-2xl font-bold font-mono text-tusz truncate block">
              {median !== null ? formatValue(median, unit) : '—'}
            </span>
          </div>
        </div>

        {/* Karta 3: Min-Max */}
        <div
          data-testid="stats-card-minmax"
          className="bg-arkusz border border-linia p-3 sm:p-4 flex flex-col justify-between"
        >
          <span className="text-xs font-semibold text-olowek uppercase tracking-wider">
            Min-Max
          </span>
          <div className="mt-1">
            <span className="text-sm md:text-base font-bold font-mono text-tusz truncate block">
              {min !== null && max !== null
                ? `${formatValue(min, unit)} – ${formatValue(max, unit)}`
                : '—'}
            </span>
          </div>
        </div>

        {/* Karta 4: Lata */}
        <div
          data-testid="stats-card-years"
          className="bg-arkusz border border-linia p-3 sm:p-4 flex flex-col justify-between"
        >
          <span className="text-xs font-semibold text-olowek uppercase tracking-wider">
            Lata
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl md:text-2xl font-bold font-mono text-tusz">
              {yearsLabel}
            </span>
            {yearsCountLabel && (
              <span className="text-xs text-olowek font-mono">({yearsCountLabel})</span>
            )}
          </div>
        </div>
      </div>

      {/* Pasek 5 klas kwantylowych */}
      <div
        data-testid="quantile-classes-bar"
        className="bg-arkusz border border-linia p-3 sm:p-4 space-y-2.5"
      >
        <div className="flex items-center justify-between text-xs font-mono text-olowek">
          <span className="font-semibold uppercase tracking-wider text-tusz">
            Klasy kwantylowe (5 klas)
          </span>
          <span>mniej → więcej</span>
        </div>

        <div
          className="grid grid-cols-5 h-3 w-full border border-linia overflow-hidden"
          aria-hidden="true"
        >
          <div style={{ backgroundColor: 'var(--seq-1)' }} />
          <div style={{ backgroundColor: 'var(--seq-2)' }} />
          <div style={{ backgroundColor: 'var(--seq-3)' }} />
          <div style={{ backgroundColor: 'var(--seq-4)' }} />
          <div style={{ backgroundColor: 'var(--seq-5)' }} />
        </div>

        {breaks.length >= 4 ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 text-xs font-mono text-olowek gap-1 text-center">
            <div className="truncate px-1 py-0.5 bg-kalka/50 border border-linia/40">
              <span className="font-semibold text-tusz">Q1:</span> &lt; {formatValue(breaks[0], unit)}
            </div>
            <div className="truncate px-1 py-0.5 bg-kalka/50 border border-linia/40">
              <span className="font-semibold text-tusz">Q2:</span> {formatValue(breaks[0], unit)} – {formatValue(breaks[1], unit)}
            </div>
            <div className="truncate px-1 py-0.5 bg-kalka/50 border border-linia/40">
              <span className="font-semibold text-tusz">Q3:</span> {formatValue(breaks[1], unit)} – {formatValue(breaks[2], unit)}
            </div>
            <div className="truncate px-1 py-0.5 bg-kalka/50 border border-linia/40">
              <span className="font-semibold text-tusz">Q4:</span> {formatValue(breaks[2], unit)} – {formatValue(breaks[3], unit)}
            </div>
            <div className="truncate px-1 py-0.5 bg-kalka/50 border border-linia/40 col-span-2 sm:col-span-1">
              <span className="font-semibold text-tusz">Q5:</span> &ge; {formatValue(breaks[3], unit)}
            </div>
          </div>
        ) : (
          <div className="text-xs text-olowek text-center py-1">
            Zbyt mała liczba jednostek do wyznaczenia 5 klas
          </div>
        )}
      </div>
    </section>
  );
}
