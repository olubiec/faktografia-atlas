// Układ strony: parametr URL `?uklad=` (tylko do odczytu) > localStorage > domyślny.
// Mały wspólny magazyn, żeby profil i okno udostępniania widziały tę samą zmianę.
import { useSyncExternalStore } from 'react';
import { defaultLayout, parseLayout, type Layout } from '../../core/layout/layout';
import { loadLayout, saveLayout } from '../../core/layout/storage';
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

function read(): Layout {
  if (!cached) cached = fromUrl() ?? loadLayout() ?? defaultLayout();
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
