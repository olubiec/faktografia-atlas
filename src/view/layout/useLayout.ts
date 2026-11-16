// Układ strony: parametr URL `?uklad=` (tylko do odczytu) > localStorage > domyślny.
// Mały wspólny magazyn, żeby profil i okno udostępniania widziały tę samą zmianę.
import { useSyncExternalStore } from 'react';
import { defaultLayout, parseLayout, presetLayout, type Layout } from '../../core/layout/layout';
import { LAYOUT_KEY, saveLayout } from '../../core/layout/storage';
import { LAYOUT_PARAM } from '../../core/layout/profileBlocks';

const listeners = new Set<() => void>();
let cached: Layout | null = null;

function fromUrl(): Layout | null {
  if (typeof window === 'undefined') return null;
  try {
    return parseLayout(new URLSearchParams(window.location.search).get(LAYOUT_PARAM));
  } catch {
    return null;
  }
}

function stored(): Layout | null {
  try {
    return parseLayout(window.localStorage.getItem(LAYOUT_KEY));
  } catch {
    return null;
  }
}

// Tryb testowy (?e2e) bez zapisanego wyboru pokazuje wszystkie bloki, żeby testy widziały pełny profil.
function fallback(): Layout {
  const e2e = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('e2e');
  return e2e ? presetLayout('pełny') : defaultLayout();
}

function read(): Layout {
  if (!cached) cached = fromUrl() ?? stored() ?? fallback();
  return cached;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Zapisuje układ i powiadamia wszystkich słuchaczy. */
export function setLayout(next: Layout): void {
  cached = next;
  saveLayout(next);
  listeners.forEach((l) => l());
}

/** Tylko do testów: zapomina układ w pamięci. */
export function resetLayoutCache(): void {
  cached = null;
  listeners.forEach((l) => l());
}

export function useLayout(): [Layout, (next: Layout) => void] {
  const layout = useSyncExternalStore(subscribe, read, read);
  return [layout, setLayout];
}
