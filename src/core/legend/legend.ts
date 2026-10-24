import { classColorToken, type ClassificationScheme } from '../map/classes';
import { formatValue } from '../format/number';

export const LEGEND_DIRECTION_LABEL = 'mniej → więcej';

export interface LegendItem {
  token: string;
  from: number | null;
  to: number | null;
  label: string;
}

export interface BuildLegendOptions {
  breaks: number[];
  scheme: ClassificationScheme;
  unit?: string | null;
  noData?: string;
}

/**
 * Buduje listę elementów legendy kartogramu na podstawie progów podziału,
 * schematu kolorów, jednostki oraz opcjonalnej etykiety dla braku danych.
 */
export function buildLegend({
  breaks,
  scheme,
  unit,
  noData = 'brak danych',
}: BuildLegendOptions): LegendItem[] {
  const items: LegendItem[] = [];

  if (breaks.length > 0) {
    const numClasses = breaks.length + 1;

    for (let i = 0; i < numClasses; i++) {
      const token = classColorToken(i, numClasses, scheme);

      if (i === 0) {
        // Pierwsza klasa: poniżej x
        const to = breaks[0];
        const label = `poniżej ${formatValue(to, unit)}`;
        items.push({ token, from: null, to, label });
      } else if (i === numClasses - 1) {
        // Ostatnia klasa: powyżej y
        const from = breaks[breaks.length - 1];
        const label = `powyżej ${formatValue(from, unit)}`;
        items.push({ token, from, to: null, label });
      } else {
        // Pośrednie klasy: od x do y
        const from = breaks[i - 1];
        const to = breaks[i];
        const label = `od ${formatValue(from, unit)} do ${formatValue(to, unit)}`;
        items.push({ token, from, to, label });
      }
    }
  }

  // Zawsze na końcu pozycja "brak danych"
  items.push({
    token: '--no-data',
    from: null,
    to: null,
    label: noData,
  });

  return items;
}
