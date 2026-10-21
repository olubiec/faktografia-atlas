import { useMemo } from 'react';
import type { Unit, UnitLevel } from '@/core/units/types';
import type { ClassificationScheme, ClassifyResult } from '@/core/map/classes';
import { buildChoropleth } from '@/core/map/choropleth';
import type { MainView } from './useMainView';

export type ChoroplethData = {
  indicatorId: string;
  year: number | null;
  level: UnitLevel;
  classes: number;
  scheme: ClassificationScheme;
  breaks: number[];
  classByTeryt: Record<string, ClassifyResult>;
};

/**
 * Podział na klasy kolorów dla wskaźnika, roku i poziomu z widoku głównego.
 * Zwraca null, dopóki plik wartości wskaźnika się nie wczyta.
 */
export function useChoropleth(
  view: Pick<MainView, 'indicator' | 'values' | 'year' | 'level'>,
  units: Unit[]
): ChoroplethData | null {
  const { indicator, values, year, level } = view;

  return useMemo<ChoroplethData | null>(() => {
    if (!values) return null;

    const result = buildChoropleth({ values, units, level, year: year ?? undefined, n: 5 });

    return {
      indicatorId: indicator.id,
      year: result.year,
      level,
      classes: 5,
      scheme: result.scheme,
      breaks: result.breaks,
      classByTeryt: result.classByTeryt,
    };
  }, [indicator.id, values, units, level, year]);
}
