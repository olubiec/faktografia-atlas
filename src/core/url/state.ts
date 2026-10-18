import type { UnitIndex } from '../units/types';
import { getUnit } from '../units/units';

export type UrlState = {
  u?: string | null;
  i?: string;
  y?: number;
  c?: string;
};

/**
 * Odczytuje stan z parametrów URL (np. ?u=). Nieznany TERYT jest ignorowany.
 */
export function readUrlState(search: string, index?: UnitIndex): UrlState {
  if (!search) return {};
  const params = new URLSearchParams(search);
  const uParam = params.get('u');

  if (!uParam) return {};

  if (index) {
    const unit = getUnit(index, uParam);
    if (!unit) return {};
    return { u: unit.teryt };
  }

  return { u: uParam };
}

/**
 * Zapisuje stan do URL za pomocą replaceState, zachowując inne parametry zapytania (np. e2e, tune).
 */
export function writeUrlState(state: UrlState): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);

  if (state.u) {
    url.searchParams.set('u', state.u);
  } else {
    url.searchParams.delete('u');
  }

  window.history.replaceState(null, '', url.toString());
}

/**
 * Zwraca początkowo wybraną jednostkę TERYT na podstawie parametru ?u= w URL.
 */
export function getInitialSelectedFromUrl(
  search: string,
  index: UnitIndex
): string | null {
  const state = readUrlState(search, index);
  return state.u ?? null;
}

/**
 * Aktualizuje parametr ?u= w adresie URL bez przeładowania strony.
 */
export function updateUrlTeryt(teryt: string | null): void {
  writeUrlState({ u: teryt });
}
