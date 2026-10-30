import { useEffect, useRef, useState, useId } from 'react';
import { formatValue } from '../../core/format/number';
import {
  getX as getGeometryX,
  getY as getGeometryY,
  getXAxisYears,
  buildSegments,
} from '../../core/profile/trend-geometry';
import { TrendAxis } from './TrendAxis';
import { TrendPoints } from './TrendPoints';
import { TrendStatus, TrendLegend } from './TrendStatus';

export interface TrendChartProps {
  series: { year: number; value: number | null }[];
  unit?: string;
  label: string;
  compareSeries?: { year: number; value: number | null }[];
  compareLabel?: string;
}

export function TrendChart({
  series,
  unit,
  label,
  compareSeries,
  compareLabel,
}: TrendChartProps) {
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

  const validMainPoints = series.filter((d): d is { year: number; value: number } => d.value !== null);
  const hasEnoughData = validMainPoints.length >= 2;
  const lastValidPoint = validMainPoints[validMainPoints.length - 1];
  const activeYear = selectedYear !== null && series.some((s) => s.year === selectedYear) ? selectedYear : lastValidPoint?.year ?? null;

  if (!hasEnoughData) {
    return <div className="text-olowek text-sm p-4 text-center border border-linia bg-arkusz">Za mało danych do wykresu</div>;
  }

  const years = series.map((s) => s.year).sort((a, b) => a - b);
  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const chartAriaLabel = `${label}, ${minYear === maxYear ? minYear : `${minYear}–${maxYear}`}`;

  const allValues = [
    ...validMainPoints.map((p) => p.value),
    ...(compareSeries ? compareSeries.filter((d): d is { year: number; value: number } => d.value !== null).map((p) => p.value) : []),
  ];

  let minY = Math.min(...allValues);
  let maxY = Math.max(...allValues);
  if (minY === maxY) {
    minY -= 1;
    maxY += 1;
  }

  const yMargin = (maxY - minY) * 0.1 || 1;
  const height = 180;
  const paddingLeft = 70;
  const paddingRight = 20;
  const paddingTop = 24;
  const paddingBottom = 32;

  const plotWidth = Math.max(containerWidth - paddingLeft - paddingRight, 50);
  const plotHeight = height - paddingTop - paddingBottom;

  const getX = (year: number) => getGeometryX(year, minYear, maxYear, paddingLeft, plotWidth);
  const getY = (val: number) => getGeometryY(val, minY - yMargin, maxY + yMargin, paddingTop, plotHeight);

  const xAxisYears = getXAxisYears(years);
  const mainSegments = buildSegments(series);
  const compareSegments = compareSeries ? buildSegments(compareSeries) : [];

  const currentActiveYear = activeYear ?? lastValidPoint.year;
  const activeMainItem = series.find((s) => s.year === currentActiveYear);
  const formattedActiveValue = activeMainItem?.value !== undefined ? formatValue(activeMainItem.value, unit) : 'brak danych';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const currIdx = years.indexOf(currentActiveYear);
      if (e.key === 'ArrowLeft' && currIdx > 0) setSelectedYear(years[currIdx - 1]);
      else if (e.key === 'ArrowRight' && currIdx >= 0 && currIdx < years.length - 1) setSelectedYear(years[currIdx + 1]);
    }
  };

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={chartAriaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="w-full bg-arkusz border border-linia p-3 focus:outline-none focus:ring-2 focus:ring-tusz"
    >
      <TrendStatus
        liveRegionId={liveRegionId}
        label={label}
        currentActiveYear={currentActiveYear}
        formattedActiveValue={formattedActiveValue}
      />
      <svg width="100%" height={height} viewBox={`0 0 ${containerWidth} ${height}`} className="overflow-visible select-none">
        <TrendAxis paddingLeft={paddingLeft} paddingRight={paddingRight} containerWidth={containerWidth} height={height} minY={minY} maxY={maxY} getY={getY} getX={getX} xAxisYears={xAxisYears} unit={unit} />
        <TrendPoints mainSegments={mainSegments} compareSegments={compareSegments} lastValidPoint={lastValidPoint} currentActiveYear={currentActiveYear} activeMainItem={activeMainItem} activeCompareItem={compareSeries?.find((s) => s.year === currentActiveYear)} getX={getX} getY={getY} years={years} containerWidth={containerWidth} height={height} paddingTop={paddingTop} paddingBottom={paddingBottom} unit={unit} setSelectedYear={setSelectedYear} />
      </svg>
      <TrendLegend label={label} compareLabel={compareLabel} hasCompareSeries={!!compareSeries} />
    </div>
  );
}
