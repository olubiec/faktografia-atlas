import type { UnitLevel } from '../units/types';
import { getRevealState } from '@/view/map/hooks/useChoropleth';
import { getCameraState, type CameraSeamState } from '@/view/map/hooks/useMapViewState';

export type ChoroplethSeamState = {
  indicatorId: string;
  year: number | null;
  level: UnitLevel;
  classes: number;
} | null;

export type RevealSeamState = {
  running: boolean;
  progress: number;
};

export type AtlasState = {
  ready: boolean;
  layers: string[];
  selected: string | null;
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  theme: 'light' | 'dark';
  choropleth: ChoroplethSeamState;
  profileOpen: boolean;
  reveal?: RevealSeamState;
  camera?: CameraSeamState;
};

export type WindowWithAtlas = {
  location?: {
    search?: string;
  };
  __atlas?: AtlasState;
};

/**
 * Instaluje szew testowy (window.__atlas) pozwalający testom E2E sprawdzać
 * stan wewnętrzny mapy WebGL bez polegania na porównywaniu pikseli canvasu.
 *
 * Szew aktywuje się wyłącznie, gdy URL aplikacji zawiera parametr ?e2e.
 */
export function installAtlasSeam(
  win: WindowWithAtlas,
  getState: () => AtlasState
): undefined {
  const search = win.location?.search ?? '';
  const hasE2e = new URLSearchParams(search).has('e2e');

  if (!hasE2e) {
    return undefined;
  }

  Object.defineProperty(win, '__atlas', {
    configurable: true,
    enumerable: true,
    get(): AtlasState {
      const state = getState();
      return Object.freeze({
        ready: state.ready,
        layers: [...state.layers],
        selected: state.selected,
        viewState: { ...state.viewState },
        theme: state.theme,
        choropleth: state.choropleth ? { ...state.choropleth } : null,
        profileOpen: state.profileOpen,
        reveal: typeof getRevealState === 'function' ? { ...getRevealState() } : { running: false, progress: 1 },
        camera: typeof getCameraState === 'function' ? { ...getCameraState() } : { animating: false, trace: [] },
      });
    },
    set(_value: AtlasState) {
      // Obiekt tylko do odczytu: ignoruje próby ponownego nadpisania
    },
  });

  return undefined;
}
