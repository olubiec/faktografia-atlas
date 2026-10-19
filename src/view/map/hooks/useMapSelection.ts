import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { UnitIndex } from '@/core/units/types';
import { getDrillState, getParentTeryt } from '@/core/map/drill';
import { readUrlState, writeUrlState } from '@/core/url/state';
import { loadLocalities } from '@/core/search/load-localities';
import type { ViewState } from '@/core/map/view';

export type MapSelectionOptions = {
  onBboxChange?: (bbox: [number, number, number, number] | null) => void;
  onLocalitySelectView?: (view: ViewState) => void;
  onLocalitiesLoaded?: () => void;
};

export function useMapSelection(unitIndex: UnitIndex, options?: MapSelectionOptions) {
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const [selectedTeryt, setSelectedTeryt] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return readUrlState(window.location.search, unitIndex).u ?? null;
  });

  const drillState = useMemo(() => {
    return getDrillState(selectedTeryt, unitIndex);
  }, [selectedTeryt, unitIndex]);

  const selectUnit = useCallback(
    (teryt: string) => {
      setSelectedTeryt(teryt);
      writeUrlState({ u: teryt });

      const targetUnit = unitIndex.byTeryt.get(teryt);
      if (optionsRef.current?.onBboxChange) {
        optionsRef.current.onBboxChange(targetUnit ? targetUnit.bbox : null);
      }
    },
    [unitIndex]
  );

  const selectBreadcrumb = useCallback(
    (teryt: string | null) => {
      if (teryt === null) {
        setSelectedTeryt(null);
        writeUrlState({ u: null });
        if (optionsRef.current?.onBboxChange) {
          optionsRef.current.onBboxChange(null);
        }
      } else {
        selectUnit(teryt);
      }
    },
    [selectUnit]
  );

  const goBack = useCallback(() => {
    const parent = getParentTeryt(selectedTeryt, unitIndex);
    setSelectedTeryt(parent);
    writeUrlState({ u: parent });

    const parentUnit = parent ? unitIndex.byTeryt.get(parent) : null;
    if (optionsRef.current?.onBboxChange) {
      optionsRef.current.onBboxChange(parentUnit ? parentUnit.bbox : null);
    }
  }, [selectedTeryt, unitIndex]);

  // Obsługa powrotu/przejścia w historii przeglądarki
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const fromUrl = readUrlState(window.location.search, unitIndex).u ?? null;
      setSelectedTeryt(fromUrl);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [unitIndex]);

  // Obsługa zdarzenia wyboru miejscowości w wyszukiwarce Ctrl+K
  useEffect(() => {
    const handleLocalitySelect = (
      e: CustomEvent<{ teryt: string; lon?: number; lat?: number }>
    ) => {
      const { teryt, lon, lat } = e.detail;
      loadLocalities().then(() => {
        optionsRef.current?.onLocalitiesLoaded?.();
      });

      if (typeof lon === 'number' && typeof lat === 'number') {
        const targetView: ViewState = {
          longitude: lon,
          latitude: lat,
          zoom: 11.5,
        };
        optionsRef.current?.onLocalitySelectView?.(targetView);
      }
      if (teryt) {
        setSelectedTeryt(teryt);
        writeUrlState({ u: teryt });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('atlas:select-locality', handleLocalitySelect as EventListener);
      return () => {
        window.removeEventListener('atlas:select-locality', handleLocalitySelect as EventListener);
      };
    }
  }, []);

  return {
    selectedTeryt,
    setSelectedTeryt,
    drillState,
    selectUnit,
    selectBreadcrumb,
    goBack,
  };
}
