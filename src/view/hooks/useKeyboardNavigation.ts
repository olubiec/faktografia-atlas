import { useEffect } from 'react';
import type { UnitLevel } from '@/core/units/types';

/** Minimalny opis zdarzenia klawiatury (ułatwia test bez DOM). */
export type KeyLike = {
  key: string;
  code: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  target: { tagName?: string; isContentEditable?: boolean } | null;
};

export type KeyAction =
  | { type: 'zoom'; delta: 1 | -1 }
  | { type: 'close' }
  | { type: 'level'; level: UnitLevel };

const LEVEL_BY_DIGIT: Record<string, UnitLevel> = { '1': 'woj', '2': 'pow', '3': 'gmi' };

function isTextField(target: KeyLike['target']): boolean {
  if (!target) return false;
  const tag = (target.tagName ?? '').toUpperCase();
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable === true;
}

/** Czysta logika: jaki skrót oznacza dane zdarzenie (null = brak reakcji). */
export function resolveKeyAction(e: KeyLike): KeyAction | null {
  if (isTextField(e.target)) return null;
  if (e.altKey && !e.ctrlKey && !e.metaKey) {
    // Kod fizyczny klawisza działa też tam, gdzie Alt zmienia wpisywany znak.
    const digit = e.code.startsWith('Digit') ? e.code.slice(5) : e.key;
    const level = LEVEL_BY_DIGIT[digit];
    return level ? { type: 'level', level } : null;
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return null;
  if (e.key === '+' || e.key === '=') return { type: 'zoom', delta: 1 };
  if (e.key === '-') return { type: 'zoom', delta: -1 };
  if (e.key === 'Escape') return { type: 'close' };
  return null;
}

/**
 * Globalne skróty (a11y): +/- zoom mapy, Escape, Alt+1/2/3 szczebel.
 * - Zoom: zdarzenie `atlas:zoom` ({ delta }) na window.
 * - Szczebel: adres ?l= i `popstate`, który czyta useMainView (bez drugiego stanu).
 * - Escape: zamykanie profilu i okien obsługują ich własne nasłuchy; tu tylko rozpoznanie.
 */
export function useKeyboardNavigation(): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Mapa z fokusem obsługuje +/- sama (preventDefault) – bez podwójnego kroku.
      if (e.defaultPrevented) return;
      const action = resolveKeyAction({
        key: e.key,
        code: e.code,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        target: e.target as KeyLike['target'],
      });
      if (!action) return;
      if (action.type === 'zoom') {
        window.dispatchEvent(new CustomEvent('atlas:zoom', { detail: { delta: action.delta } }));
      } else if (action.type === 'level') {
        e.preventDefault();
        const url = new URL(window.location.href);
        url.searchParams.set('l', action.level);
        window.history.replaceState(window.history.state, '', url);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
