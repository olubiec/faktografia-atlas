
import { formatValue } from '../../core/format/number';

interface TrendAxisProps {
  paddingLeft: number;
  paddingRight: number;
  containerWidth: number;
  height: number;
  minY: number;
  maxY: number;
  getY: (val: number) => number;
  getX: (year: number) => number;
  xAxisYears: number[];
  unit?: string;
}

export function TrendAxis({
  paddingLeft,
  paddingRight,
  containerWidth,
  height,
  minY,
  maxY,
  getY,
  getX,
  xAxisYears,
  unit,
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
