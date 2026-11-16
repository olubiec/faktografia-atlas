// Cienki adapter localStorage dla układu; brak dostępu nie psuje strony.
import { defaultLayout, parseLayout, serializeLayout, type Layout } from './layout';

export const LAYOUT_KEY = 'fa-layout-v1';

function getDefaultStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  } catch {
    // Brak dostępu do localStorage (np. tryb prywatny)
  }
  return null;
}

export function loadLayout(storage: Storage | null = getDefaultStorage()): Layout {
  try {
    const parsed = parseLayout(storage?.getItem(LAYOUT_KEY));
    if (parsed) return parsed;
  } catch {
    // ignorujemy
  }
  return defaultLayout();
}

export function saveLayout(layout: Layout, storage: Storage | null = getDefaultStorage()): boolean {
  try {
    if (!storage) return false;
    storage.setItem(LAYOUT_KEY, serializeLayout(layout));
    return true;
  } catch {
    return false;
  }
}
