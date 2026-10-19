import { useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export interface YearSliderProps {
  years: number[];
  value: number;
  onChange: (year: number) => void;
  className?: string;
}

export function YearSlider({
  years,
  value,
  onChange,
  className,
}: YearSliderProps) {
  // Sort distinct years ascending
  const sortedYears = useMemo(() => {
    return Array.from(new Set(years)).sort((a, b) => a - b);
  }, [years]);

  // Handle single year or empty years array: text representation only, no slider
  if (sortedYears.length <= 1) {
    const singleYear = sortedYears[0] ?? value;
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-3 px-3 py-2 min-h-[44px] bg-arkusz text-tusz border border-linia',
          className
        )}
      >
        <span className="text-xs uppercase tracking-wider text-olowek">
          Rok
        </span>
        <span className="text-sm font-mono font-semibold text-tusz">
          {singleYear}
        </span>
      </div>
    );
  }

  // Find index of current year in sortedYears
  const rawIndex = sortedYears.indexOf(value);
  const currentIndex = rawIndex >= 0 ? rawIndex : 0;

  const handleValueChange = (values: number[]) => {
    const newIdx = values[0];
    if (newIdx !== undefined && sortedYears[newIdx] !== undefined) {
      const selectedYear = sortedYears[newIdx];
      if (selectedYear !== value) {
        onChange(selectedYear);
      }
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col justify-center gap-1 px-3 py-2 min-h-[44px] bg-arkusz text-tusz border border-linia w-full',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wider text-olowek">
          Rok
        </span>
        <span className="text-sm font-mono font-semibold text-tusz">
          {value}
        </span>
      </div>
      <Slider
        value={[currentIndex]}
        min={0}
        max={sortedYears.length - 1}
        step={1}
        onValueChange={handleValueChange}
        aria-label="Wybierz rok"
        aria-valuetext={String(value)}
      />
    </div>
  );
}
