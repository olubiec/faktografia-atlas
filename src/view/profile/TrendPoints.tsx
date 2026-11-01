import { formatValue } from '../../core/format/number';
import {
  type ValidTrendPoint,
  type TrendDataPoint,
  buildPathD,
} from '../../core/profile/trend-geometry';

export interface TrendPointsProps {
  mainSegments: ValidTrendPoint[][];
  compareSegments?: ValidTrendPoint[][];
  lastValidPoint: ValidTrendPoint | null;
  currentActiveYear: number | null;
  activeMainItem?: TrendDataPoint;
  activeCompareItem?: TrendDataPoint;
  getX: (year: number) => number;
  getY: (val: number) => number;
  unit?: string;
  paddingTop: number;
  paddingBottom: number;
  height: number;
}

/**
 * Komponent punktów, linii serii oraz wskaźnika aktywnego roku na wykresie SVG.
 */
export function TrendPoints({
  mainSegments,
  compareSegments,
  lastValidPoint,
  currentActiveYear,
  activeMainItem,
  activeCompareItem,
  getX,
  getY,
  unit,
  paddingTop,
  paddingBottom,
  height,
}: TrendPointsProps) {
  return (
    <>
      {/* Seria porównawcza (cieńsza linia) */}
      {compareSegments?.map((seg, i) => {
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
        return (
          <path
            key={i}
            d={buildPathD(seg, getX, getY)}
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
        return (
          <path
            key={i}
            d={buildPathD(seg, getX, getY)}
            fill="none"
            className="stroke-tusz"
            strokeWidth={2}
          />
        );
      })}

      {/* Ostatnia wartość: wyróżniony punkt i podpis */}
      {lastValidPoint && (
        <g
          transform={`translate(${getX(lastValidPoint.year)}, ${getY(
            lastValidPoint.value
          )})`}
        >
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
          {activeMainItem?.value !== null &&
            activeMainItem?.value !== undefined && (
              <circle
                cx={0}
                cy={getY(activeMainItem.value)}
                r={5}
                className="fill-tusz stroke-arkusz"
                strokeWidth={2}
              />
            )}
          {activeCompareItem?.value !== null &&
            activeCompareItem?.value !== undefined && (
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
    </>
  );
}
