import { useState, useEffect, useMemo } from 'react';
import type { DrillState } from '@/core/map/drill';
import type { Unit, UnitLevel } from '@/core/units/types';
import type { IndicatorValues } from '@/core/profile/profile';
import type { ClassificationScheme, ClassifyResult } from '@/core/map/classes';
import { loadIndicatorValues } from '@/core/data/load-values';
import { buildChoropleth } from '@/core/map/choropleth';
import { readUrlState } from '@/core/url/state';

export type ChoroplethData = {
  indicatorId: string;
  year: number | null;
  level: UnitLevel;
  classes: number;
  scheme: ClassificationScheme;
  breaks: number[];
  classByTeryt: Record<string, ClassifyResult>;
};

export function useChoropleth(
  drillState: DrillState,
  units: Unit[]
): ChoroplethData | null {
  const [urlParams, setUrlParams] = useState(() => {
    if (typeof window === 'undefined') return { i: null, y: null };
    const state = readUrlState(window.location.search);
    return { i: state.i ?? null, y: state.y ?? null };
  });

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const state = readUrlState(window.location.search);
      setUrlParams({ i: state.i ?? null, y: state.y ?? null });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  const [values, setValues] = useState<IndicatorValues | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  const indicatorId = urlParams.i;
  const requestedYear = urlParams.y;

  useEffect(() => {
    if (!indicatorId) {
      return;
    }

    let isCancelled = false;
    loadIndicatorValues(indicatorId).then((res) => {
      if (!isCancelled) {
        setValues(res);
        setLoadedId(indicatorId);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [indicatorId]);

  const level: UnitLevel = useMemo(() => {
    if (drillState.activePowTeryt) return 'gmi';
    if (drillState.activeWojTeryt) return 'pow';
    return 'woj';
  }, [drillState.activeWojTeryt, drillState.activePowTeryt]);

  const choroplethData = useMemo<ChoroplethData | null>(() => {
    if (!indicatorId || loadedId !== indicatorId || !values) {
      return null;
    }

    const result = buildChoropleth({
      values,
      units,
      level,
      year: requestedYear ?? undefined,
      n: 5,
    });

    return {
      indicatorId,
      year: result.year,
      level,
      classes: 5,
      scheme: result.scheme,
      breaks: result.breaks,
      classByTeryt: result.classByTeryt,
    };
  }, [indicatorId, loadedId, values, units, level, requestedYear]);

  return choroplethData;
}
