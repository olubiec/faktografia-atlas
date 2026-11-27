import { useState } from 'react';
import { NavArrowRight } from 'iconoir-react';
import { DialogTrigger } from '@/components/ui/dialog';
import { Window } from '@/view/ui/Window';
import { Icon } from '@/view/ui/Icon';
import { DataMenu } from './DataMenu';
import { clearMenuUrl, readMenuUrl } from './menuUrl';

export type DataMenuWindowProps = {
  indicatorId: string;
  indicatorName: string;
  year?: number | null;
  onSelect: (id: string) => void;
  /** 'columns' = komputer, 'stack' = telefon (jeden widok naraz). */
  layout?: 'columns' | 'stack';
  /** Podpis nad nazwą wskaźnika w przycisku (domyślnie „Wybierz dane”), np. z liczbą wskaźników. */
  label?: string;
  /** false = okno nie czyta ani nie czyści adresu ?menu=dane (poza mapą, np. na stronie startowej). */
  syncUrl?: boolean;
  /** Atrybut data-slot przycisku (testy). */
  triggerSlot?: string;
};

/**
 * Jedyny sposób wyboru wskaźnika na mapie: przycisk „Wybierz dane” (pod nim bieżący wskaźnik i rok)
 * otwiera okno na cały ekran z szukajką u góry i działami pod nią (to samo menu co dawna Biblioteka).
 * Zbudowane na Dialog: Esc zamyka, fokus wraca na przycisk. Adres ?menu=dane&q=… otwiera okno z frazą.
 */
export function DataMenuWindow({ indicatorId, indicatorName, year = null, onSelect, layout = 'columns', label = 'Wybierz dane', syncUrl = true, triggerSlot }: DataMenuWindowProps) {
  const [initial] = useState(() => (syncUrl ? readMenuUrl() : { open: false, query: '' }));
  const [open, setOpen] = useState(initial.open);
  const change = (next: boolean) => {
    setOpen(next);
    if (!next && syncUrl) clearMenuUrl();
  };
  const trigger = (
    <DialogTrigger asChild>
      <button
        type="button"
        aria-haspopup="dialog"
        data-slot={triggerSlot}
        className="flex min-h-[44px] w-full items-center justify-between gap-2 border border-linia bg-arkusz px-3 py-2 text-left text-tusz hover:bg-linia/20 focus-visible:outline-2 focus-visible:outline-tusz cursor-pointer"
      >
        <span className="flex min-w-0 flex-col">
          <span className="text-xs text-olowek">{label}</span>
          <span className="min-w-0 break-words text-base font-bold">
            {indicatorName}{year != null ? `, ${year}` : ''}
          </span>
        </span>
        <Icon icon={NavArrowRight} aria-hidden={true} size={20} />
      </button>
    </DialogTrigger>
  );
  return (
    <Window
      open={open}
      onOpenChange={change}
      mode="fullscreen"
      slot="data-menu-window"
      className="h-dvh w-screen"
      title="Wybierz dane"
      description="Dział, grupa, wskaźnik. Pokazujemy tylko dane, które mamy."
      trigger={trigger}
    >
      <DataMenu
        selectedId={indicatorId}
        onSelect={onSelect}
        onClose={() => change(false)}
        layout={layout}
        initialQuery={initial.query}
      />
    </Window>
  );
}
