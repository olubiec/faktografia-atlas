import React, { useEffect, useRef, useState, useId } from 'react';
import { formatValue } from '../../core/format/number';

export interface TrendChartProps {
  series: { year: number; value: number | null }[];
  unit?: string;
  label: string;
  compareSeries?: { year: number; value: number | null }[];
  compareLabel?: string;
}

/**
 * Wykres zmian wskaźnika w czasie dla rozwiniętego wiersza w profilu jednostki.
 */
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

  // Mierzenie szerokości kontenera przez ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Poprawne punkty serii głównej
  const validMainPoints = series.filter(
    (d): d is { year: number; value: number } => d.value !== null
  );

  const hasEnoughData = validMainPoints.length >= 2;

  // Wyznaczenie aktywnego roku: wybrany przez użytkownika, albo ostatni znany z wartością
  const lastValidPoint = validMainPoints[validMainPoints.length - 1];
  const activeYear =
    selectedYear !== null && series.some((s) => s.year === selectedYear)
      ? selectedYear
      : lastValidPoint?.year ?? null;

  if (!hasEnoughData) {
    return (
      <div className="text-olowek text-sm p-4 text-center border border-linia bg-arkusz">
        Za mało danych do wykresu
      </div>
    );
  }

  // Obliczanie min/max lat
  const years = series.map((s) => s.year).sort((a, b) => a - b);
  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const yearRange = minYear === maxYear ? `${minYear}` : `${minYear}–${maxYear}`;
  const chartAriaLabel = `${label}, ${yearRange}`;

  // Wartości min/max Y ze wszystkich serii
  const allValues: number[] = [
    ...validMainPoints.map((p) => p.value),
    ...(compareSeries
      ? compareSeries
          .filter((d): d is { year: number; value: number } => d.value !== null)
          .map((p) => p.value)
      : []),
  ];

  let minY = Math.min(...allValues);
  let maxY = Math.max(...allValues);

  if (minY === maxY) {
    minY = minY - 1;
    maxY = maxY + 1;
  }

  // Dodatkowy margines Y (10%)
  const yMargin = (maxY - minY) * 0.1 || 1;
  const domainMinY = minY - yMargin;
  const domainMaxY = maxY + yMargin;

  // Wymiary SVG
  const height = 180;
  const paddingLeft = 70;
  const paddingRight = 20;
  const paddingTop = 24;
  const paddingBottom = 32;

  const plotWidth = Math.max(containerWidth - paddingLeft - paddingRight, 50);
  const plotHeight = height - paddingTop - paddingBottom;

  // Funkcje odwzorowania skali
  const getX = (year: number) => {
    if (minYear === maxYear) return paddingLeft + plotWidth / 2;
    return (
      paddingLeft + ((year - minYear) / (maxYear - minYear)) * plotWidth
    );
  };

  const getY = (val: number) => {
    return (
      paddingTop +
      plotHeight -
      ((val - domainMinY) / (domainMaxY - domainMinY)) * plotHeight
    );
  };

  // Etykiety osi X (pierwszy, ostatni, oraz do 4 pomiędzy)
  const getXAxisYears = (): number[] => {
    if (years.length <= 6) {
      return years;
    }
    const intermediate: number[] = [];
    const count = 4; // najwyżej 4 etykiety pomiędzy
    const step = (years.length - 1) / (count + 1);
    for (let i = 1; i <= count; i++) {
      const idx = Math.round(i * step);
      if (idx > 0 && idx < years.length - 1) {
        intermediate.push(years[idx]);
      }
    }
    // Unikalne posortowane lata
    return Array.from(new Set([minYear, ...intermediate, maxYear])).sort(
      (a, b) => a - b
    );
  };

  const xAxisYears = getXAxisYears();

  // Dzielenie serii na ciągłe segmenty (null jest przerwą w linii)
  const buildSegments = (sData: { year: number; value: number | null }[]) => {
    const segments: { year: number; value: number }[][] = [];
    let current: { year: number; value: number }[] = [];

    for (const item of sData) {
      if (item.value !== null) {
        current.push({ year: item.year, value: item.value });
      } else {
        if (current.length > 0) {
          segments.push(current);
          current = [];
        }
      }
    }
    if (current.length > 0) {
      segments.push(current);
    }
    return segments;
  };

  const mainSegments = buildSegments(series);
  const compareSegments = compareSeries ? buildSegments(compareSeries) : [];

  // Wybrany punkt w aktywnej serii do wyświetlenia readout
  const currentActiveYear = activeYear ?? lastValidPoint.year;
  const activeMainItem = series.find((s) => s.year === currentActiveYear);
  const activeCompareItem = compareSeries?.find(
    (s) => s.year === currentActiveYear
  );

  const formattedActiveValue = activeMainItem?.value !== undefined
    ? formatValue(activeMainItem.value, unit)
    : 'brak danych';

  // Nawigacja klawiaturą
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const currIdx = years.indexOf(currentActiveYear);
      if (currIdx > 0) {
        setSelectedYear(years[currIdx - 1]);
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const currIdx = years.indexOf(currentActiveYear);
      if (currIdx >= 0 && currIdx < years.length - 1) {
        setSelectedYear(years[currIdx + 1]);
      }
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
      {/* Pasek statusu / podgląd aktywnego roku (aria-live="polite") */}
      <div
        id={liveRegionId}
        aria-live="polite"
        className="flex items-center justify-between text-xs font-mono text-olowek mb-2 min-h-[24px]"
      >
        <span className="font-semibold text-tusz">{label}</span>
        <span>
          {currentActiveYear}: {formattedActiveValue}
        </span>
      </div>

      {/* Wykres SVG */}
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${containerWidth} ${height}`}
        className="overflow-visible select-none"
      >
        {/* Linie siatki Y dla min i max */}
        <line
          x1={paddingLeft}
          y1={getY(minY)}
          x2={containerWidth - paddingRight}
          y2={getY(minY)}
          className="stroke-linia"
          strokeDasharray="2 2"
          strokeWidth={1}
        />
        <line
          x1={paddingLeft}
          y1={getY(maxY)}
          x2={containerWidth - paddingRight}
          y2={getY(maxY)}
          className="stroke-linia"
          strokeDasharray="2 2"
          strokeWidth={1}
        />

        {/* Etykiety osi Y (min i max) */}
        <text
          x={paddingLeft - 8}
          y={getY(maxY)}
          alignmentBaseline="middle"
          textAnchor="end"
          fontSize={11}
          className="fill-olowek font-mono"
        >
          {formatValue(maxY, unit)}
        </text>
        <text
          x={paddingLeft - 8}
          y={getY(minY)}
          alignmentBaseline="middle"
          textAnchor="end"
          fontSize={11}
          className="fill-olowek font-mono"
        >
          {formatValue(minY, unit)}
        </text>

        {/* Etykiety osi X (lata) */}
        {xAxisYears.map((yr) => (
          <g key={yr} transform={`translate(${getX(yr)}, ${height - 8})`}>
            <text
              textAnchor="middle"
              fontSize={11}
              className="fill-olowek font-mono"
            >
              {yr}
            </text>
          </g>
        ))}

        {/* Seria porównawcza (cieńsza linia) */}
        {compareSegments.map((seg, i) => {
          if (seg.length === 1) {
            return (
              <circle
                key={i}
                cx={getX(seg[0].year)}
                cy={getY(seg[0].value)}
                r={2}
                className="fill-olowek"
              />
            );
          }
          const pathD = seg
            .map(
              (p, idx) =>
                `${idx === 0 ? 'M' : 'L'} ${getX(p.year)} ${getY(p.value)}`
            )
            .join(' ');
          return (
            <path
              key={i}
              d={pathD}
              fill="none"
              className="stroke-olowek"
              strokeWidth={1.2}
              strokeDasharray="3 3"
            />
          );
        })}

        {/* Główna seria (grubsza linia) */}
        {mainSegments.map((seg, i) => {
          if (seg.length === 1) {
            return (
              <circle
                key={i}
                cx={getX(seg[0].year)}
                cy={getY(seg[0].value)}
                r={3}
                className="fill-tusz"
              />
            );
          }
          const pathD = seg
            .map(
              (p, idx) =>
                `${idx === 0 ? 'M' : 'L'} ${getX(p.year)} ${getY(p.value)}`
            )
            .join(' ');
          return (
            <path
              key={i}
              d={pathD}
              fill="none"
              className="stroke-tusz"
              strokeWidth={2}
            />
          );
        })}

        {/* Ostatnia wartość: wyróżniony punkt i podpis */}
        {lastValidPoint && (
          <g transform={`translate(${getX(lastValidPoint.year)}, ${getY(lastValidPoint.value)})`}>
            <circle
              r={4}
              className="fill-korekta stroke-arkusz"
              strokeWidth={1.5}
            />
            <text
              x={0}
              y={-10}
              textAnchor="middle"
              fontSize={12}
              className="fill-korektaTekst font-bold font-mono"
            >
              {formatValue(lastValidPoint.value, unit)}
            </text>
          </g>
        )}

        {/* Wskaźnik interaktywny dla aktywnego roku (hover/touch/focus) */}
        {currentActiveYear !== null && (
          <g transform={`translate(${getX(currentActiveYear)}, 0)`}>
            <line
              x1={0}
              y1={paddingTop}
              x2={0}
              y2={height - paddingBottom}
              className="stroke-linia"
              strokeWidth={1}
            />
            {activeMainItem?.value !== null && activeMainItem?.value !== undefined && (
              <circle
                cx={0}
                cy={getY(activeMainItem.value)}
                r={5}
                className="fill-tusz stroke-arkusz"
                strokeWidth={2}
              />
            )}
            {activeCompareItem?.value !== null && activeCompareItem?.value !== undefined && (
              <circle
                cx={0}
                cy={getY(activeCompareItem.value)}
                r={4}
                className="fill-olowek stroke-arkusz"
                strokeWidth={1.5}
              />
            )}
          </g>
        )}

        {/* Obszary dotykowe / najechania dla każdego roku (min 44px szerokości) */}
        {years.map((yr) => {
          const xPos = getX(yr);
          const colWidth = Math.max(containerWidth / years.length, 44);
          return (
            <rect
              key={yr}
              x={xPos - colWidth / 2}
              y={0}
              width={colWidth}
              height={height}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setSelectedYear(yr)}
              onTouchStart={() => setSelectedYear(yr)}
            />
          );
        })}
      </svg>

      {/* Legenda (tylko gdy przekazano compareSeries) */}
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
