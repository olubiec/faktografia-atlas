import type { ReactNode } from 'react';
import { Link, useInRouterContext } from 'react-router';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type WindowMode = 'fullscreen' | 'dialog' | 'bottom';

/** Jedyne miejsce na warstwę okien: nad arkuszem telefonu (react-modal-sheet daje mu 9999). */
export const WINDOW_Z = 'z-[10000]';
/** Jedyne miejsce na odstęp wewnętrzny okna (telefon / komputer). */
export const WINDOW_PADDING = 'p-4 md:p-6';

const MODE_CLASS: Record<WindowMode, string> = {
  fullscreen: 'inset-0 top-0 left-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 border-0',
  dialog: 'max-h-[85dvh] overflow-y-auto overscroll-contain',
  bottom: 'top-auto bottom-0 left-0 max-h-[85dvh] w-screen max-w-none translate-x-0 translate-y-0 overflow-y-auto overscroll-contain border-x-0 border-b-0',
};

export type WindowProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** fullscreen = cały ekran, dialog = okno pośrodku, bottom = od dołu (telefon). */
  mode?: WindowMode;
  /** Wartość atrybutu data-slot treści (dla testów i stylów). */
  slot?: string;
  /** Dodatkowe klasy treści okna (rzadko; domyślne dają odmiany `mode`). */
  className?: string;
  /** true = nad tytułem logo prowadzące na stronę startową (okna na cały ekran, jak nagłówek strony). */
  brand?: boolean;
  /** Element otwierający (np. DialogTrigger) – renderowany obok okna, w tym samym Dialogu. */
  trigger?: ReactNode;
  children: ReactNode;
};

/**
 * Wspólne okno: Dialog z Radix (Esc zamyka, fokus uwięziony w oknie i wraca na element otwierający),
 * wspólny nagłówek (tytuł + opis) i przycisk zamknięcia 44 px z DialogContent.
 */
export function Window({ open, onOpenChange, title, description, mode = 'dialog', slot, className, trigger, brand = false, children }: WindowProps) {
  const inRouter = useInRouterContext();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent
        data-slot={slot}
        className={cn(WINDOW_Z, WINDOW_PADDING, 'overflow-hidden bg-arkusz', MODE_CLASS[mode], mode === 'fullscreen' && 'grid-rows-[auto_minmax(0,1fr)] gap-3', className)}
      >
        <DialogHeader className="pr-12">
          {brand && inRouter && (
            <Link to="/" onClick={() => onOpenChange(false)} aria-label="Faktografia – strona główna" data-slot="window-logo" className="mb-1 flex min-h-11 w-fit items-center">
              <img src="/brand/faktografia-logo-granat.svg" alt="" className="logo-na-jasnym h-10 w-auto -ml-3" />
              <img src="/brand/faktografia-logo-jasne.svg" alt="" className="logo-na-ciemnym h-10 w-auto -ml-3" />
            </Link>
          )}
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto overscroll-contain">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
