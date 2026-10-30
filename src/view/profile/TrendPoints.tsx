
import { formatValue } from '../../core/format/number';
import type { SegmentPoint } from '../../core/profile/trend-geometry';

interface TrendPointsProps {
  mainSegments: SegmentPoint[][];
  compareSegments: SegmentPoint[][];
  lastValidPoint: SegmentPoint | undefined;
  currentActiveYear: number | null;
  activeMainItem: { year: number; value: number | null } | undefined;
  activeCompareItem: { year: number; value: number | null } | undefined;
  getX: (year: number) => number;
  getY: (val: number) => number;
  years: number[];
  containerWidth: number;
  height: number;
  paddingTop: number;
  paddingBottom: number;
  unit?: string;
  setSelectedYear: (year: number) => void;
}

export function TrendPoints({
  mainSegments,
  compareSegments,
  lastValidPoint,
  currentActiveYear,
  activeMainItem,
  activeCompareItem,
  getX,
  getY,
  years,
  containerWidth,
  height,
  paddingTop,
  paddingBottom,
  unit,
  setSelectedYear,
}: TrendPointsProps) {
  return (
    <>
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
    </>
  );
}
