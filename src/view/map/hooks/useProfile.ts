import { useState, useEffect, useCallback } from 'react';
import type { UnitProfile, IndicatorValues, Indicator } from '@/core/profile/profile';
import type { Unit } from '@/core/units/types';
import { buildProfile } from '@/core/profile/profile';
import { loadIndicatorValues } from '@/core/data/load-values';
import indicatorsData from '../../../../config/indicators.json';

const indicators = indicatorsData as Indicator[];

export interface UseProfileResult {
  profile: UnitProfile | null;
  isOpen: boolean;
  closeProfile: () => void;
}

/**
 * Haczyk do pobierania i przeliczania profilu dla wybranej jednostki.
 * Po pierwszym wyborze jednostki wczytuje dane wszystkich 20 wskaźników równolegle.
 */
export function useProfile(selectedTeryt: string | null, units: Unit[]): UseProfileResult {
  const [closedForTeryt, setClosedForTeryt] = useState<string | null>(null);
  const [prevSelectedTeryt, setPrevSelectedTeryt] = useState<string | null>(selectedTeryt);
  const [profile, setProfile] = useState<UnitProfile | null>(null);

  // Reset stanu zamknięcia przy zmianie wybranego TERYT
  if (selectedTeryt !== prevSelectedTeryt) {
    setPrevSelectedTeryt(selectedTeryt);
    setClosedForTeryt(null);
  }

  useEffect(() => {
    if (!selectedTeryt) {
      return;
    }

    let isCancelled = false;

    // Pobranie danych dla wszystkich wskaźników równolegle
    Promise.all(indicators.map((ind) => loadIndicatorValues(ind.id)))
      .then((results) => {
        if (isCancelled) return;

        const valuesById: Record<string, IndicatorValues> = {};
        results.forEach((val, idx) => {
          if (val) {
            valuesById[indicators[idx].id] = val;
          }
        });

        const built = buildProfile(selectedTeryt, indicators, valuesById, units);
        setProfile(built);
      })
      .catch(() => {
        if (isCancelled) return;
        const emptyBuilt = buildProfile(selectedTeryt, indicators, {}, units);
        setProfile(emptyBuilt);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedTeryt, units]);

  const closeProfile = useCallback(() => {
    if (selectedTeryt) {
      setClosedForTeryt(selectedTeryt);
    }
  }, [selectedTeryt]);

  const currentProfile = selectedTeryt && profile?.teryt === selectedTeryt ? profile : null;
  const isOpen = Boolean(selectedTeryt && selectedTeryt !== closedForTeryt && currentProfile !== null);

  return {
    profile: currentProfile,
    isOpen,
    closeProfile,
  };
}
