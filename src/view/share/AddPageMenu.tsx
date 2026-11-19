import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { DeckPage, PageKind } from '@/core/share/deck';

type Options = DeckPage['options'];
type Entry = { label: string; hint: string; kind: PageKind; options?: Options; need?: 'unit' | 'pair' };

// Rodzaje stron w kolejności menu; „need” ukrywa pozycję, gdy brak miejsca lub pary.
const ENTRIES: Entry[] = [
  { label: 'Mapa', hint: 'mapa wskaźnika z legendą', kind: 'map' },
  { label: 'Ranking – najwyżej', hint: 'najwyżej w rankingu', kind: 'ranking', options: { side: 'top' } },
  { label: 'Ranking – najniżej', hint: 'najniżej w rankingu', kind: 'ranking', options: { side: 'bottom' } },
  { label: 'Tabela', hint: 'kilka wskaźników naraz', kind: 'table' },
  { label: 'Duża liczba', hint: 'jedna liczba dla miejsca', kind: 'bignumber' },
  { label: 'Wykres lat', hint: 'zmiana w czasie', kind: 'trend' },
  { label: 'Rozkład', hint: 'ile jednostek w każdej klasie', kind: 'histogram' },
  { label: 'Profil', hint: 'wskaźniki wybranego miejsca', kind: 'profile', need: 'unit' },
  { label: 'Porównanie', hint: 'dwa miejsca obok siebie', kind: 'compare', need: 'pair' },
  { label: 'A vs B', hint: 'wskaźniki dwóch miejsc w parach', kind: 'versus', need: 'pair' },
];

// Okno udostępniania leży w arkuszu (z-index 9999); popover w <body> musi być nad nim.
export const ADD_MENU_LAYER = 'z-[10000]';

const ITEM = 'flex min-h-[44px] w-full flex-col justify-center px-3 py-2 text-left hover:bg-kalka focus-visible:bg-kalka';

type ListProps = {
  onPick(kind: PageKind, options?: Options): void;
  onSplit(): void;
  hasUnit: boolean;
  hasPair: boolean;
  canSplitCurrent: boolean;
  splitHint?: string | null;
  /** Gdy podane, menu pokazuje tylko te rodzaje stron (reszta nie ma danych w oknie). */
  allowed?: readonly PageKind[];
};

// Sama lista pozycji (bez hooków), żeby dało się ją sprawdzić bez DOM.
export function AddPageList({ onPick, onSplit, hasUnit, hasPair, canSplitCurrent, splitHint, allowed }: ListProps) {
  const visible = ENTRIES.filter((e) => (!allowed || allowed.includes(e.kind)) && (e.need === 'unit' ? hasUnit : e.need === 'pair' ? hasPair : true));
  return (
    <div className="max-h-[70vh] overflow-y-auto">
      {visible.map((e) => (
        <button
          key={e.label}
          type="button"
          className={ITEM}
          aria-label={e.label}
          aria-describedby={`add-page-${e.kind}-${e.options?.side ?? 'x'}`}
          onClick={() => onPick(e.kind, e.options)}
        >
          <span className="text-sm font-bold" aria-hidden="true">{e.label}</span>
          <span id={`add-page-${e.kind}-${e.options?.side ?? 'x'}`} className="text-xs text-olowek">{e.hint}</span>
        </button>
      ))}
      <div className="mt-1 border-t border-linia pt-1">
        <button
          type="button"
          className={`${ITEM} ${canSplitCurrent ? '' : 'opacity-60'}`}
          aria-label="Podziel tę stronę"
          aria-disabled={!canSplitCurrent}
          aria-describedby={splitHint ? 'add-page-split-hint' : undefined}
          onClick={() => {
            if (canSplitCurrent) onSplit();
          }}
        >
          <span className="text-sm font-bold" aria-hidden="true">Podziel tę stronę</span>
          {splitHint ? <span id="add-page-split-hint" className="text-xs text-olowek">{splitHint}</span> : null}
        </button>
      </div>
    </div>
  );
}

type MenuProps = Omit<ListProps, 'onPick'> & { onAdd(kind: PageKind, options?: Options): void };

// „+” dodaje stronę za bieżącą. Radix Popover: Escape zamyka, fokus wraca na przycisk.
export function AddPageMenu({ onAdd, onSplit, ...rest }: MenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="min-h-[44px] min-w-[44px] border border-linia bg-kalka px-3 text-sm font-bold"
        aria-label="Dodaj stronę"
      >
        + Dodaj stronę
      </PopoverTrigger>
      <PopoverContent align="start" className={`${ADD_MENU_LAYER} w-72 p-1`}>
        <AddPageList
          {...rest}
          onPick={(kind, options) => {
            setOpen(false);
            onAdd(kind, options);
          }}
          onSplit={() => {
            setOpen(false);
            onSplit();
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
