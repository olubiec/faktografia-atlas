import type { UnitIndex } from '../units/types';
import { getUnit } from '../units/units';
import indicators from '../../../config/indicators.json';

export type UrlState = {
  u?: string | null;
  i?: string | null;
  y?: number | null;
  c?: string | null;
  l?: 'woj' | 'pow' | 'gmi' | null;
};

const VALID_INDICATOR_IDS = new Set(indicators.map((ind) => ind.id));

/**
 * Odczytuje stan z parametrów URL (np. ?u=, ?i=, ?y=). Nieznany TERYT, nieznany wskaźnik oraz nieliczbowy rok są ignorowane.
 */
export function readUrlState(search: string, index?: UnitIndex): UrlState {
  if (!search) return {};
  const params = new URLSearchParams(search);
  const result: UrlState = {};

  const uParam = params.get('u');
  if (uParam) {
    if (index) {
      const unit = getUnit(index, uParam);
      if (unit) {
        result.u = unit.teryt;
      }
    } else {
      result.u = uParam;
    }
  }

  const iParam = params.get('i');
  if (iParam && VALID_INDICATOR_IDS.has(iParam)) {
    result.i = iParam;
  }

  const yParam = params.get('y');
  if (yParam) {
    const parsedYear = Number.parseInt(yParam, 10);
    if (!Number.isNaN(parsedYear) && String(parsedYear) === yParam.trim()) {
      result.y = parsedYear;
    }
  }

  const cParam = params.get('c');
  if (cParam) {
    const parts = cParam.split(',');
    if (parts.length === 2) {
      const [c1, c2] = parts;
      if (index) {
        if (getUnit(index, c1) && getUnit(index, c2)) {
          result.c = cParam;
        }
      } else {
        result.c = cParam;
      }
    }
  }

  const lParam = params.get('l');
  if (lParam === 'woj' || lParam === 'pow' || lParam === 'gmi') {
    result.l = lParam;
  }

  return result;
}

/**
 * Zapisuje stan do URL za pomocą replaceState, zachowując inne parametry zapytania (np. e2e, tune).
 */
export function writeUrlState(state: UrlState): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);

  if ('u' in state) {
    if (state.u) {
      url.searchParams.set('u', state.u);
    } else {
      url.searchParams.delete('u');
    }
  }

  if ('i' in state) {
    if (state.i) {
      url.searchParams.set('i', state.i);
    } else {
      url.searchParams.delete('i');
    }
  }

  if ('y' in state) {
    if (typeof state.y === 'number' && !Number.isNaN(state.y)) {
      url.searchParams.set('y', String(state.y));
    } else {
      url.searchParams.delete('y');
    }
  }

  if ('c' in state) {
    if (state.c) {
      url.searchParams.set('c', state.c);
    } else {
      url.searchParams.delete('c');
    }
  }

  if ('l' in state) {
    if (state.l) {
      url.searchParams.set('l', state.l);
    } else {
      url.searchParams.delete('l');
    }
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
