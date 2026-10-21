import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Indicator, IndicatorValues } from '@/core/profile/profile';
import type { UnitLevel } from '@/core/units/types';
import { loadIndicatorValues } from '@/core/data/load-values';
import { readUrlState, writeUrlState } from '@/core/url/state';
import { DEFAULT_INDICATOR_ID, DEFAULT_LEVEL, clampLevel, resolveYear } from '@/core/map/main-view';
import indicatorsData from '../../../../config/indicators.json';

export const INDICATORS = indicatorsData as Indicator[];

type UrlView = { i: string | null; y: number | null; l: UnitLevel | null };

function readView(): UrlView {
  if (typeof window === 'undefined') return { i: null, y: null, l: null };
  const s = readUrlState(window.location.search);
  return { i: s.i ?? null, y: s.y ?? null, l: s.l ?? null };
}

export type MainView = {
  indicator: Indicator;
  indicators: Indicator[];
  values: IndicatorValues | null;
  /** Rok pokazany na mapie (z adresu, jeśli jest w danych; inaczej najnowszy). */
  year: number | null;
  years: number[];
  level: UnitLevel;
  setIndicator: (id: string) => void;
  setYear: (year: number) => void;
  setLevel: (level: UnitLevel) => void;
};

/**
 * Stan ekranu głównego: wskaźnik, rok i poziom (adres ?i= ?y= ?l=), z domyślną gęstością zaludnienia
 * na poziomie województw. Pobiera plik wartości bieżącego wskaźnika (jedno żądanie, potem z pamięci).
 */
export function useMainView(): MainView {
  const [url, setUrl] = useState<UrlView>(readView);
  const [loaded, setLoaded] = useState<{ id: string; values: IndicatorValues | null } | null>(null);

  useEffect(() => {
    const onPop = () => setUrl(readView());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const indicator = useMemo(
    () => INDICATORS.find((x) => x.id === url.i) ?? INDICATORS.find((x) => x.id === DEFAULT_INDICATOR_ID) ?? INDICATORS[0],
    [url.i]
  );

  useEffect(() => {
    let cancelled = false;
    loadIndicatorValues(indicator.id).then((values) => {
      if (!cancelled) setLoaded({ id: indicator.id, values });
    });
    return () => {
      cancelled = true;
    };
  }, [indicator.id]);

  const values = loaded?.id === indicator.id ? loaded.values : null;
  const years = useMemo(() => values?.years ?? [], [values]);
  const year = resolveYear(years, url.y);
  const level = clampLevel(url.l ?? DEFAULT_LEVEL, indicator.minLevel);

  const setIndicator = useCallback((id: string) => {
    writeUrlState({ i: id, y: null });
    setUrl((prev) => ({ ...prev, i: id, y: null }));
  }, []);
  const setYear = useCallback((y: number) => {
    writeUrlState({ y });
    setUrl((prev) => ({ ...prev, y }));
  }, []);
  const setLevel = useCallback((l: UnitLevel) => {
    writeUrlState({ l });
    setUrl((prev) => ({ ...prev, l }));
  }, []);

  return { indicator, indicators: INDICATORS, values, year, years, level, setIndicator, setYear, setLevel };
}
