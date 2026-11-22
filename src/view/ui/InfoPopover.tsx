import { useMemo, useRef, useState, type ReactNode } from 'react';
import { HelpCircle } from 'iconoir-react';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icon } from '@/view/ui/Icon';
import { cn } from '@/lib/utils';

/** Odstęp okienka od krawędzi ekranu i od górnej krawędzi dolnego menu (px). */
const GAP = 16;
/** Poniżej tej wysokości nad menu nie ma miejsca, więc okienko otwiera się przy znaku „?”. */
const MIN_ROOM = 160;

export interface InfoPopoverProps {
  /** Opis dla czytników ekranu, np. „Co to znaczy: Ludność ogółem”. */
  label: string;
  /** Klasy przycisku „?”. */
  buttonClassName: string;
  children: ReactNode;
}

/**
 * Znak „?” z okienkiem definicji. Na telefonie okienko otwiera się nad dolnym menu (arkuszem)
 * i dopasowuje wysokość do wolnego miejsca nad nim, więc nic nie jest ucięte ani zasłonięte.
 * Gdy nad menu jest mało miejsca (menu rozwinięte), okienko otwiera się przy znaku „?”.
 */
export function InfoPopover({ label, buttonClassName, children }: InfoPopoverProps) {
  const [open, setOpen] = useState(false);
  const [sheetTop, setSheetTop] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const anchorRef = useMemo(() => {
    if (sheetTop === null) return null;
    return {
      current: {
        getBoundingClientRect: () => new DOMRect(0, sheetTop, window.innerWidth, 0),
      },
    };
  }, [sheetTop]);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      const top = triggerRef.current?.closest('[role="dialog"]')?.getBoundingClientRect().top;
      setSheetTop(top !== undefined && top >= MIN_ROOM ? top : null);
    }
    setOpen(next);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      {anchorRef && <PopoverAnchor virtualRef={anchorRef} />}
      <PopoverTrigger asChild>
        <button ref={triggerRef} type="button" aria-label={label} className={buttonClassName}>
          <Icon icon={HelpCircle} size={20} aria-hidden={true} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={sheetTop === null ? undefined : 'top'}
        collisionPadding={GAP}
        sideOffset={sheetTop === null ? 4 : GAP / 2}
        style={sheetTop === null ? undefined : { maxHeight: sheetTop - GAP * 1.5 }}
        className={cn(
          'z-[10000] overflow-y-auto w-80 max-w-[calc(100vw-32px)] sm:w-96 text-tusz text-xs border border-linia bg-arkusz p-4 rounded-none',
          sheetTop === null && 'max-h-[var(--radix-popover-content-available-height)]',
        )}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
