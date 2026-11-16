import { useEffect, type RefObject } from 'react';

type Containing = { contains: (node: never) => boolean };

export type DismissReason = 'escape' | 'outside' | null;

// Czysta decyzja: czy to zdarzenie ma zamknąć menu (testowalna bez DOM).
export function dismissReason(
  event: { type: string; key?: string; target: unknown },
  { menuEl, triggerEl }: { menuEl: Containing | null; triggerEl: Containing | null }
): DismissReason {
  if (event.type === 'keydown') return event.key === 'Escape' ? 'escape' : null;
  if (event.type === 'pointerdown') {
    const target = event.target as never;
    if (menuEl?.contains(target) || triggerEl?.contains(target)) return null;
    return 'outside';
  }
  return null;
}

interface Options {
  open: boolean;
  onClose: () => void;
  menuRef: RefObject<HTMLElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
}

/**
 * Zamykanie rozwijanego menu: Escape (fokus wraca na przycisk) i dotknięcie poza menu.
 * Escape łapiemy w fazie przechwytywania i zatrzymujemy, żeby nie zamknął przy tym
 * otwartego profilu (jego nasłuch siedzi na window w fazie bąbelkowania).
 */
export function useMenuDismiss({ open, onClose, menuRef, triggerRef }: Options): void {
  useEffect(() => {
    if (!open) return;
    const els = () => ({ menuEl: menuRef.current, triggerEl: triggerRef.current });
    const onKeyDown = (e: KeyboardEvent) => {
      if (dismissReason(e, els()) !== 'escape') return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
      triggerRef.current?.focus();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (dismissReason(e, els()) === 'outside') onClose();
    };
    window.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [open, onClose, menuRef, triggerRef]);
}
