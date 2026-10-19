import { useEffect, useRef } from 'react';
import * as Plot from '@observablehq/plot';

export interface SparklineProps {
  series: { year: number; value: number | null }[];
  unit?: string;
  label: string;
}

/**
 * Mały wykres liniowy lat (sparkline) przy wskaźniku w profilu.
 * Renderuje SVG z @observablehq/plot z podanym aria-label i kolorem z currentColor.
 * Gdy mniej niż 2 lata z wartością (nie-null), nie renderuje niczego.
 */
export function Sparkline({ series, label }: SparklineProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  const validPoints = series.filter((d) => d.value !== null);
  const minYear = validPoints[0]?.year;
  const maxYear = validPoints[validPoints.length - 1]?.year;
  const yearRange = minYear === maxYear ? `${minYear}` : `${minYear}–${maxYear}`;
  const ariaLabel = `${label}, ${yearRange}`;

  const hasEnoughData = validPoints.length >= 2;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasEnoughData) return;

    container.replaceChildren();

    const chart = Plot.plot({
      width: 48,
      height: 16,
      margin: 1,
      style: { display: 'block' },
      ariaLabel: null,
      ariaDescription: null,
      x: { axis: null },
      y: { axis: null },
      marks: [
        Plot.lineY(series, {
          x: 'year',
          y: 'value',
          stroke: 'currentColor',
          strokeWidth: 1.5,
        }),
      ],
    });

    chart.setAttribute('role', 'img');
    chart.setAttribute('aria-label', ariaLabel);

    // Usuń aria-label z poddrzewa <g>, aby spełnić wymogi dostępności axe (aria-prohibited-attr na g)
    chart.querySelectorAll('[aria-label]').forEach((el) => {
      if (el !== chart) {
        el.removeAttribute('aria-label');
      }
    });

    container.appendChild(chart);

    return () => {
      chart.remove();
    };
  }, [series, ariaLabel, hasEnoughData]);

  if (!hasEnoughData) {
    return null;
  }

  return (
    <span
      ref={containerRef}
      className="inline-flex items-center shrink-0 text-tusz h-4 overflow-hidden"
    />
  );
}
