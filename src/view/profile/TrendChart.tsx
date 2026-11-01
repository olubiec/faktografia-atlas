import { useEffect, useRef, useState, useId, type KeyboardEvent } from 'react';
import { formatValue } from '../../core/format/number';
import {
  DEFAULT_DIMENSIONS,
  getValidPoints,
  hasEnoughData,
  getSortedYears,
  calculateYDomain,
  calculateX,
  calculateY,
  getXAxisYears,
  buildSegments,
  type TrendDataPoint,
} from '../../core/profile/trend-geometry';
import { TrendStatus } from './TrendStatus';
import { TrendAxis } from './TrendAxis';
import { TrendPoints } from './TrendPoints';

export interface TrendChartProps {
  series: TrendDataPoint[];
  unit?: string;
  label: string;
  compareSeries?: TrendDataPoint[];
  compareLabel?: string;
}

/** Wykres zmian wskaźnika w czasie dla rozwiniętego wiersza w profilu jednostki. */
export function TrendChart({ series, unit, label, compareSeries, compareLabel }: TrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(320);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const liveRegionId = useId();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { paddingTop, paddingBottom, paddingLeft, paddingRight, height } = DEFAULT_DIMENSIONS;
  const validPoints = getValidPoints(series);
  if (!hasEnoughData(series)) {
    return (
      <div className="py-4 text-xs text-olowek" role="status">
        Za mało danych do wykresu
      </div>
    );
  }

  const validComparePoints = compareSeries ? getValidPoints(compareSeries) : undefined;
  const years = getSortedYears(series);
  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const yearRange = minYear === maxYear ? `${minYear}` : `${minYear}–${maxYear}`;
  const chartAriaLabel = `${label}, ${yearRange}`;
  const plotWidth = Math.max(containerWidth - paddingLeft - paddingRight, 50);
  const plotHeight = height - paddingTop - paddingBottom;

  const { minY, maxY, domainMinY, domainMaxY } = calculateYDomain(validPoints, validComparePoints);
  const getX = (year: number) => calculateX(year, minYear, maxYear, paddingLeft, plotWidth);
  const getY = (val: number) => calculateY(val, domainMinY, domainMaxY, paddingTop, plotHeight);

  const xAxisYears = getXAxisYears(years);
  const mainSegments = buildSegments(series);
  const compareSegments = compareSeries ? buildSegments(compareSeries) : [];
  const lastValidPoint = validPoints[validPoints.length - 1];
  const currentActiveYear = selectedYear ?? lastValidPoint.year;
  const activeMainItem = series.find((p) => p.year === currentActiveYear);
  const activeCompareItem = compareSeries?.find((p) => p.year === currentActiveYear);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = years.indexOf(currentActiveYear);
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSelectedYear(currentIndex > 0 ? years[currentIndex - 1] : years[years.length - 1]);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSelectedYear(currentIndex < years.length - 1 ? years[currentIndex + 1] : years[0]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSelectedYear(years[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSelectedYear(years[years.length - 1]);
    }
  };

  const formattedCurrentValue = formatValue(activeMainItem?.value ?? null, unit);

  return (
    <div
      ref={containerRef}
      className="w-full relative focus:outline-hidden focus-visible:ring-1 focus-visible:ring-tusz"
      tabIndex={0}
      role="region"
      aria-label={chartAriaLabel}
      aria-describedby={liveRegionId}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => setSelectedYear(null)}
    >
      <TrendStatus
        id={liveRegionId}
        label={label}
        year={currentActiveYear}
        formattedValue={formattedCurrentValue}
      />

      <svg width="100%" height={height} viewBox={`0 0 ${containerWidth} ${height}`} className="overflow-visible select-none">
        <TrendAxis
          minY={minY} maxY={maxY} unit={unit} xAxisYears={xAxisYears} getX={getX} getY={getY}
          paddingLeft={paddingLeft} paddingRight={paddingRight} containerWidth={containerWidth} height={height}
        />
        <TrendPoints
          mainSegments={mainSegments} compareSegments={compareSegments} lastValidPoint={lastValidPoint}
          currentActiveYear={currentActiveYear} activeMainItem={activeMainItem} activeCompareItem={activeCompareItem}
          getX={getX} getY={getY} unit={unit} paddingTop={paddingTop} paddingBottom={paddingBottom} height={height}
        />
        {years.map((yr) => {
          const xPos = getX(yr);
          const colWidth = Math.max(containerWidth / years.length, 44);
          return (
            <rect
              key={yr} x={xPos - colWidth / 2} y={0} width={colWidth} height={height}
              fill="transparent" className="cursor-pointer"
              onMouseEnter={() => setSelectedYear(yr)} onTouchStart={() => setSelectedYear(yr)}
            />
          );
        })}
      </svg>

      {compareSeries && compareLabel && (
        <div className="flex items-center gap-4 text-xs text-olowek mt-2 border-t border-linia pt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-tusz inline-block" />
            <span>{label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-b border-dashed border-olowek inline-block" />
            <span>{compareLabel}</span>
          </div>
        </div>
      )}
    </div>
  );
}
