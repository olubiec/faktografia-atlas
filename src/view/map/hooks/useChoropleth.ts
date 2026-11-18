import { useState, useEffect, useRef, useMemo } from 'react';
import type { Unit, UnitLevel } from '@/core/units/types';
import type { ClassificationScheme, ClassifyResult } from '@/core/map/classes';
import { buildChoropleth } from '@/core/map/choropleth';
import type { MainView } from './useMainView';
import { revealPlan, type RevealResult } from '@/core/map/reveal';
import tokensJson from '../../../../config/tokens.json';

export type RevealState = {
  running: boolean;
  progress: number;
};

/** Mieszanie koloru przy zmianie wskaźnika/roku (CPU, w getFillColor). */
export type BlendState = {
  running: boolean;
  progress: number;
};

type KeyedState = RevealState & { key: string };

const DONE: RevealState = { running: false, progress: 1 };
const START: RevealState = { running: true, progress: 0 };
const FRAME_MS = 33;

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function deriveState(state: KeyedState, key: string): RevealState {
  if (state.key === key) return { running: state.running, progress: state.progress };
  return prefersReducedMotion() ? DONE : START;
}

/**
 * Uruchamia animację 0..1 przez `duration` ms na rAF (max ok. 30 klatek/s, bez setState
 * przy niezmienionym postępie). Zwraca funkcję czyszczącą.
 */
function runProgress(duration: number, emit: (s: RevealState) => void): () => void {
  const startTime = performance.now();
  let lastEmit = startTime;
  let last = 0;
  let id = 0;
  const tick = (now: number) => {
    const progress = Math.min(1, (now - startTime) / duration);
    if (progress >= 1 || now - lastEmit >= FRAME_MS) {
      lastEmit = now;
      if (progress !== last) {
        last = progress;
        emit({ running: progress < 1, progress });
      }
    }
    if (progress < 1) id = requestAnimationFrame(tick);
  };
  id = requestAnimationFrame(tick);
  return () => {
    if (id) cancelAnimationFrame(id);
  };
}

export type ChoroplethData = {
  indicatorId: string;
  year: number | null;
  level: UnitLevel;
  classes: number;
  scheme: ClassificationScheme;
  breaks: number[];
  classByTeryt: Record<string, ClassifyResult>;
  reveal: RevealState;
  /** Mieszanie kolorów przy zmianie wskaźnika/roku; brak = bez animacji. */
  blend?: BlendState;
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
  units: Unit[],
  // Wybrana jednostka z useMapSelection: jedyne źródło zakresu (bez odczytu adresu).
  selectedTeryt: string | null = null
): ChoroplethData | null {
  const { indicator, values, year, level } = view;

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
  const blendKey = `${indicator.id}:${year}`;
  // Stan niesie klucz, dla którego powstał: inny niż bieżący = animacja jeszcze nie ruszyła.
  const [revealState, setRevealState] = useState<KeyedState>({ key: scopeKey, running: false, progress: 1 });
  const startedScope = useRef(scopeKey);
  const startedBlend = useRef(blendKey);
  const [blendState, setBlendState] = useState<KeyedState>({ key: blendKey, running: false, progress: 1 });

  useEffect(() => {
    if (startedScope.current === scopeKey) return;
    startedScope.current = scopeKey;
    if (prefersReducedMotion()) return;
    return runProgress(tokensJson.motion.revealTotal ?? 900, (s) => setRevealState({ key: scopeKey, ...s }));
  }, [scopeKey]);

  useEffect(() => {
    if (startedBlend.current === blendKey) return;
    startedBlend.current = blendKey;
    if (prefersReducedMotion()) return;
    return runProgress(tokensJson.motion.base ?? 300, (s) => setBlendState({ key: blendKey, ...s }));
  }, [blendKey]);

  // Klucz zmieniony, a pierwsza klatka jeszcze nie przyszła: od razu stan startowy (bez mignięcia).
  // Ograniczony ruch: bez animacji.
  const reveal = useMemo(() => deriveState(revealState, scopeKey), [revealState, scopeKey]);
  const blend = useMemo(() => deriveState(blendState, blendKey), [blendState, blendKey]);

  useEffect(() => {
    setGlobalRevealState(reveal);
  }, [reveal]);

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
      reveal,
      blend,
      activeScope: {
        level,
        activeWojTeryt,
        activePowTeryt,
      },
      revealResults,
    };
  }, [indicator.id, values, units, level, year, reveal, blend, activeWojTeryt, activePowTeryt, revealResults]);
}
