import { useCallback, useState } from 'react';
import {
  SELECTION_PARAM,
  SELECTION_STORAGE_KEY,
  parseSelection,
  resolveSelection,
  serializeSelection,
  toggleIndicator,
} from '../../core/compare/indicator-selection';

function readInitial(): string[] | null {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get(SELECTION_PARAM);
    if (fromUrl !== null) return parseSelection(fromUrl);
  } catch {
    /* brak window.location – używamy domyślnych */
  }
  try {
    return parseSelection(window.localStorage.getItem(SELECTION_STORAGE_KEY));
  } catch {
    return null;
  }
}

function persist(value: string | null) {
  try {
    const url = new URL(window.location.href);
    if (value === null) url.searchParams.delete(SELECTION_PARAM);
    else url.searchParams.set(SELECTION_PARAM, value);
    window.history.replaceState(window.history.state, '', url);
  } catch {
    /* zapis do adresu jest dodatkiem */
  }
  try {
    if (value === null || value === '') window.localStorage.removeItem(SELECTION_STORAGE_KEY);
    else window.localStorage.setItem(SELECTION_STORAGE_KEY, value);
  } catch {
    /* localStorage może być zablokowany */
  }
}

/** Stan wyboru wskaźników: URL ?wsk= → localStorage → wszystkie. */
export function useIndicatorSelection(allIds: string[]) {
  const [stored, setStored] = useState<string[] | null>(readInitial);
  const selected = resolveSelection(stored, allIds);

  const toggle = useCallback(
    (id: string) => {
      const next = toggleIndicator(resolveSelection(stored, allIds), id, allIds);
      setStored(next);
      persist(serializeSelection(next, allIds));
    },
    [stored, allIds],
  );

  return { selected, toggle };
}
