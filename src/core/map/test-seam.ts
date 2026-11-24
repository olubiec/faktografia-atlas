import type { UnitLevel } from '../units/types';
import { getRevealState } from '@/view/map/hooks/useChoropleth';
import { getFillTransitionState, getLayerTransitions } from './fill-transition';
import { getCameraState, type CameraSeamState } from '@/view/map/hooks/useMapViewState';

export type ChoroplethSeamState = {
  indicatorId: string;
  year: number | null;
  level: UnitLevel;
  classes: number;
  /** Progi legendy (rosnące, bez powtórzeń) – test sprawdza, że liczba klas = progi + 1. */
  breaks?: number[];
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
  /** Widok faktycznie ustawiony w mapie (nie plan kamery); undefined, zanim mapa powstanie. */
  mapView?: { longitude: number; latitude: number; zoom: number };
  theme: 'light' | 'dark';
  choropleth: ChoroplethSeamState;
  profileOpen: boolean;
  reveal?: RevealSeamState;
  camera?: CameraSeamState;
  fill?: { ms: number; dataKey: string };
  /** Czas przejścia GPU atrybutów warstw (ma być 0). */
  layerTransitions?: Array<{ id: string; transitionMs: number }>;
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
        mapView: state.mapView ? { ...state.mapView } : undefined,
        theme: state.theme,
        choropleth: state.choropleth ? { ...state.choropleth } : null,
        profileOpen: state.profileOpen,
        reveal: typeof getRevealState === 'function' ? { ...getRevealState() } : { running: false, progress: 1 },
        fill: typeof getFillTransitionState === 'function' ? { ...getFillTransitionState() } : { ms: 0, dataKey: '' },
        layerTransitions: typeof getLayerTransitions === 'function' ? [...getLayerTransitions()] : [],
        camera: typeof getCameraState === 'function' ? { ...getCameraState() } : { animating: false, trace: [] },
      });
    },
    set(_value: AtlasState) {
      // Obiekt tylko do odczytu: ignoruje próby ponownego nadpisania
    },
  });

  return undefined;
}
