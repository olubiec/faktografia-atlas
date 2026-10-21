import { useState, useEffect, useCallback } from 'react';
import type { UnitProfile, Indicator } from '@/core/profile/profile';
import type { Unit } from '@/core/units/types';
import { buildProfile } from '@/core/profile/profile';
import { loadProfileShard, profileFromShard } from '@/core/data/load-profile';
import indicatorsData from '../../../../config/indicators.json';

const indicators = indicatorsData as Indicator[];

export interface UseProfileResult {
  profile: UnitProfile | null;
  isOpen: boolean;
  closeProfile: () => void;
}

/**
 * Haczyk do pobierania i przeliczania profilu dla wybranej jednostki.
 * Wybór jednostki = jedno żądanie: gotowy plik profili jej województwa (public/data/profiles/<woj>.json).
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

    // Pierwsze dwie cyfry TERYT to kod województwa; plik zawiera profile wszystkich jego jednostek.
    loadProfileShard(selectedTeryt.slice(0, 2))
      .then((shard) => {
        if (isCancelled) return;
        setProfile(profileFromShard(selectedTeryt, shard, indicators, units));
      })
      .catch(() => {
        if (isCancelled) return;
        setProfile(buildProfile(selectedTeryt, indicators, {}, units));
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
