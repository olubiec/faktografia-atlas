import type { UnitIndex } from '../units/types';
import { readUrlState, type UrlState } from '../url/state';
import { DEFAULT_INDICATOR_ID } from '../map/main-view';

export type EmbedWidget = 'map' | 'ranking' | 'trend';
export type EmbedTheme = 'light' | 'dark';
export type EmbedHeight = 400 | 600;

export type EmbedParams = {
  widget: EmbedWidget;
  state: UrlState;
  theme: EmbedTheme;
  height: EmbedHeight;
};

/**
 * Odczytuje parametry /osadz?w=&i=&l=&u=&y=&theme=&h=. Nieznane wartości zamieniane są
 * na domyślne. Parametry typu hideSource / nologo / source są celowo ignorowane.
 */
export function readEmbedParams(search: string, index?: UnitIndex): EmbedParams {
  const raw = new URLSearchParams(search);
  // Wskaźnik, poziom, jednostkę i rok waliduje istniejące readUrlState.
  const url = readUrlState(search, index);
  const state: UrlState = { ...url, i: url.i ?? DEFAULT_INDICATOR_ID };

  const w = raw.get('w');
  let widget: EmbedWidget = w === 'ranking' || w === 'trend' ? w : 'map';
  if (widget === 'trend' && !state.u) widget = 'map';

  const theme: EmbedTheme = raw.get('theme') === 'dark' ? 'dark' : 'light';
  const height: EmbedHeight = raw.get('h') === '600' ? 600 : 400;

  return { widget, state, theme, height };
}

/** Stopka ze źródłem (GUS BDL, CC BY 4.0) jest w osadzeniu zawsze - bez wyjątku. */
export function hasSourceFooter(): true {
  return true;
}
