import { useState, useEffect, useRef, useMemo } from 'react';
import type { Unit, UnitLevel } from '@/core/units/types';
import type { ClassificationScheme, ClassifyResult } from '@/core/map/classes';
import { buildChoropleth } from '@/core/map/choropleth';
import type { MainView } from './useMainView';
import { revealPlan, type RevealResult } from '@/core/map/reveal';
import { readUrlState } from '@/core/url/state';
import tokensJson from '../../../../config/tokens.json';

export type RevealState = {
  running: boolean;
  progress: number;
};

export type ChoroplethData = {
  indicatorId: string;
  year: number | null;
  level: UnitLevel;
  classes: number;
  scheme: ClassificationScheme;
  breaks: number[];
  classByTeryt: Record<string, ClassifyResult>;
  reveal: RevealState;
  activeScope: {
    level: UnitLevel;
    activeWojTeryt: string | null;
    activePowTeryt: string | null;
  };
  revealResults: Map<string, RevealResult>;
};

let currentGlobalRevealState: RevealState = { running: false, progress: 1 };

export function getRevealState(): RevealState {
  return currentGlobalRevealState;
}

function setGlobalRevealState(state: RevealState) {
  currentGlobalRevealState = state;
}

/**
 * Podział na klasy kolorów dla wskaźnika, roku i poziomu z widoku głównego.
 * Zwraca null, dopóki plik wartości wskaźnika się nie wczyta.
 */
export function useChoropleth(
  view: Pick<MainView, 'indicator' | 'values' | 'year' | 'level'>,
  units: Unit[]
): ChoroplethData | null {
  const { indicator, values, year, level } = view;

  const [revealState, setRevealState] = useState<RevealState>({ running: false, progress: 1 });

  // Śledzenie TERYT wybranej jednostki z URL
  const [selectedTeryt, setSelectedTeryt] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return readUrlState(window.location.search).u ?? null;
  });

  useEffect(() => {
    const updateSelected = () => {
      const u = readUrlState(window.location.search).u ?? null;
      setSelectedTeryt(u);
    };

    window.addEventListener('popstate', updateSelected);
    window.addEventListener('hashchange', updateSelected);

    const timer = setInterval(updateSelected, 100);
    return () => {
      window.removeEventListener('popstate', updateSelected);
      window.removeEventListener('hashchange', updateSelected);
      clearInterval(timer);
    };
  }, []);

  const activeWojTeryt = useMemo(() => {
    if (!selectedTeryt) return null;
    if (selectedTeryt.length >= 2) return selectedTeryt.slice(0, 2);
    return null;
  }, [selectedTeryt]);

  const activePowTeryt = useMemo(() => {
    if (!selectedTeryt) return null;
    if (selectedTeryt.length >= 4) return selectedTeryt.slice(0, 4);
    return null;
  }, [selectedTeryt]);

  const scopeKey = `${level}:${activeWojTeryt}:${activePowTeryt}`;
  const isFirstRender = useRef(true);
  const prevScopeKey = useRef(scopeKey);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevScopeKey.current = scopeKey;
      setGlobalRevealState({ running: false, progress: 1 });
      return;
    }

    if (prevScopeKey.current === scopeKey) {
      return;
    }

    prevScopeKey.current = scopeKey;

    const isReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isReduced) {
      const state = { running: false, progress: 1 };
      setGlobalRevealState(state);
      return;
    }

    const startTime = performance.now();
    const duration = tokensJson.motion.revealTotal ?? 900;

    let animFrameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const running = progress < 1;

      const state = { running, progress };
      setRevealState(state);
      setGlobalRevealState(state);

      if (running) {
        animFrameId = requestAnimationFrame(tick);
      }
    };

    animFrameId = requestAnimationFrame(tick);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [scopeKey]);

  useEffect(() => {
    setGlobalRevealState(revealState);
  }, [revealState]);

  const { activeScopeUnits, origin } = useMemo(() => {
    let scopeUnits: Unit[] = [];
    if (level === 'woj') {
      scopeUnits = units.filter((u) => u.level === 'woj');
    } else if (level === 'pow' && activeWojTeryt) {
      scopeUnits = units.filter((u) => u.level === 'pow' && u.teryt.startsWith(activeWojTeryt));
    } else if (level === 'gmi' && activePowTeryt) {
      scopeUnits = units.filter((u) => u.level === 'gmi' && u.teryt.startsWith(activePowTeryt));
    } else {
      scopeUnits = units.filter((u) => u.level === level);
    }

    let orig: [number, number] = [19.1451, 51.9194];
    const parentTeryt = level === 'pow' ? activeWojTeryt : level === 'gmi' ? activePowTeryt : null;
    const parentUnit = parentTeryt ? units.find((u) => u.teryt === parentTeryt) : null;

    if (parentUnit?.centroid) {
      orig = parentUnit.centroid;
    } else if (scopeUnits.length > 0) {
      const sumLon = scopeUnits.reduce((acc, u) => acc + (u.centroid?.[0] ?? 0), 0);
      const sumLat = scopeUnits.reduce((acc, u) => acc + (u.centroid?.[1] ?? 0), 0);
      orig = [sumLon / scopeUnits.length, sumLat / scopeUnits.length];
    }

    return { activeScopeUnits: scopeUnits, origin: orig };
  }, [units, level, activeWojTeryt, activePowTeryt]);

  const revealResults = useMemo(() => {
    const revealUnits = activeScopeUnits.map((u) => ({
      teryt: u.teryt,
      centroid: u.centroid ?? [0, 0],
    }));

    const isReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const plan = revealPlan(revealUnits, origin, {
      total: tokensJson.motion.revealTotal ?? 900,
      minTile: 150,
      reducedMotion: isReduced,
    });

    const map = new Map<string, RevealResult>();
    for (const item of plan) {
      map.set(item.teryt, item);
    }
    return map;
  }, [activeScopeUnits, origin]);

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
      reveal: revealState,
      activeScope: {
        level,
        activeWojTeryt,
        activePowTeryt,
      },
      revealResults,
    };
  }, [indicator.id, values, units, level, year, revealState, activeWojTeryt, activePowTeryt, revealResults]);
}
