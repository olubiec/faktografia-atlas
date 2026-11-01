import { formatValue } from '../../core/format/number';

export interface TrendAxisProps {
  minY: number;
  maxY: number;
  unit?: string;
  xAxisYears: number[];
  getX: (year: number) => number;
  getY: (val: number) => number;
  paddingLeft: number;
  paddingRight: number;
  containerWidth: number;
  height: number;
}

/**
 * Komponent osi X i Y wykresu trendu wraz z liniami siatki i etykietami.
 */
export function TrendAxis({
  minY,
  maxY,
  unit,
  xAxisYears,
  getX,
  getY,
  paddingLeft,
  paddingRight,
  containerWidth,
  height,
}: TrendAxisProps) {
  return (
    <>
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
    </>
  );
}
