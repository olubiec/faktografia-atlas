import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Indicator, IndicatorValues } from '@/core/profile/profile';
import type { UnitLevel } from '@/core/units/types';
import { loadAnyValues } from '@/core/indicators/load-any-values';
import { isLibraryIndicatorId } from '@/core/indicators/registry';
import { loadUnits } from '@/core/data/load-atlas-data';
import type { Unit } from '@/core/units/types';
import { useIndicatorRegistry } from '@/view/hooks/useIndicatorRegistry';
import { ATLAS_RESET_EVENT } from '@/core/url/home';
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

const NO_UNITS: Unit[] = [];
const DEPTH: Record<UnitLevel, number> = { woj: 0, pow: 1, gmi: 2 };

/**
 * Poziom z tych, na których wskaźnik z biblioteki ma dane: żądany, a gdy go nie ma –
 * najbliższy (przy remisie płytszy). Brak listy = bez ograniczeń.
 */
export function pickLevel(level: UnitLevel, levels: UnitLevel[] | undefined): UnitLevel {
  if (!levels || levels.length === 0 || levels.includes(level)) return level;
  const dist = (l: UnitLevel) => Math.abs(DEPTH[l] - DEPTH[level]);
  return [...levels].sort((a, b) => dist(a) - dist(b) || DEPTH[a] - DEPTH[b])[0];
}

export type MainView = {
  indicator: Indicator;
  indicators: Indicator[];
  values: IndicatorValues | null;
  /** Rok pokazany na mapie (z adresu, jeśli jest w danych; inaczej najnowszy). */
  year: number | null;
  years: number[];
  level: UnitLevel;
  /** Wejście z ?i=b… zanim wczytał się spis: mapa czeka, nie cofa się do domyślnego. */
  loading: boolean;
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
    // Logo = powrót do stanu startowego (domyślny wskaźnik, rok i poziom).
    const onReset = () => setUrl({ i: null, y: null, l: null });
    window.addEventListener(ATLAS_RESET_EVENT, onReset);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener(ATLAS_RESET_EVENT, onReset);
    };
  }, []);

  const { registry, ready } = useIndicatorRegistry();
  const [units, setUnits] = useState<Unit[] | null>(null);
  const [failed, setFailed] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadUnits()
      .then((u) => {
        if (!cancelled) setUnits(u);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const defaultIndicator = useMemo(
    () => registry.byId.get(DEFAULT_INDICATOR_ID) ?? INDICATORS[0],
    [registry]
  );
  // Nieznany wskaźnik z biblioteki czeka na spis; po wczytaniu spisu (lub gdy plik wartości padł) → domyślny.
  const pending = !ready && url.i != null && isLibraryIndicatorId(url.i) && !registry.byId.has(url.i);
  const requested = url.i != null && !failed.includes(url.i) ? registry.byId.get(url.i) : undefined;
  const indicator = requested ?? defaultIndicator;

  // Spis wczytany, a wskaźnika w nim nie ma (albo brak pliku wartości) → domyślny i adres bez złego ?i=.
  const invalid = ready && url.i != null && requested === undefined;
  useEffect(() => {
    if (invalid) writeUrlState({ i: null, y: null });
  }, [invalid]);

  const libraryLevels = registry.levels.get(indicator.id);
  const libraryUnits = isLibraryIndicatorId(indicator.id) ? units : NO_UNITS;
  const canLoad = !pending && libraryUnits !== null;

  useEffect(() => {
    if (!canLoad) return;
    let cancelled = false;
    loadAnyValues(indicator.id, { units: libraryUnits ?? [], levels: libraryLevels }).then((values) => {
      if (cancelled) return;
      setLoaded({ id: indicator.id, values });
      if (values === null && isLibraryIndicatorId(indicator.id)) {
        setFailed((prev) => (prev.includes(indicator.id) ? prev : [...prev, indicator.id]));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [indicator.id, canLoad, libraryUnits, libraryLevels]);

  const values = !pending && loaded?.id === indicator.id ? loaded.values : null;
  const years = useMemo(() => values?.years ?? [], [values]);
  const year = resolveYear(years, invalid ? null : url.y);
  const level = pickLevel(clampLevel(url.l ?? DEFAULT_LEVEL, indicator.minLevel), libraryLevels);

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

  return { indicator, indicators: registry.all, values, year, years, level, loading: pending, setIndicator, setYear, setLevel };
}
