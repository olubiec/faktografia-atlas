import { useState } from 'react';
import { NavArrowRight } from 'iconoir-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
};

/**
 * Jedyny sposób wyboru wskaźnika na mapie: przycisk „Wybierz dane” (pod nim bieżący wskaźnik i rok)
 * otwiera okno na cały ekran z szukajką u góry i działami pod nią (to samo menu co dawna Biblioteka).
 * Zbudowane na Dialog: Esc zamyka, fokus wraca na przycisk. Adres ?menu=dane&q=… otwiera okno z frazą.
 */
export function DataMenuWindow({ indicatorId, indicatorName, year = null, onSelect, layout = 'columns' }: DataMenuWindowProps) {
  const [initial] = useState(readMenuUrl);
  const [open, setOpen] = useState(initial.open);
  const change = (next: boolean) => {
    setOpen(next);
    if (!next) clearMenuUrl();
  };
  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-haspopup="dialog"
          className="flex min-h-[44px] w-full items-center justify-between gap-2 border border-linia bg-arkusz px-3 py-2 text-left text-tusz hover:bg-linia/20 focus-visible:outline-2 focus-visible:outline-tusz cursor-pointer"
        >
          <span className="flex min-w-0 flex-col">
            <span className="text-xs text-olowek">Wybierz dane</span>
            <span className="min-w-0 break-words text-base font-bold">
              {indicatorName}{year != null ? `, ${year}` : ''}
            </span>
          </span>
          <Icon icon={NavArrowRight} aria-hidden={true} size={20} />
        </button>
      </DialogTrigger>
      <DialogContent
        // z powyżej arkusza telefonu (react-modal-sheet daje mu 9999); okno otwiera się z arkusza.
        data-slot="data-menu-window"
        className="z-[10000] inset-0 top-0 left-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden border-0 bg-arkusz p-4 md:p-6"
      >
        <DialogHeader className="pr-12">
          <DialogTitle>Wybierz dane</DialogTitle>
          <DialogDescription>Dział, grupa, wskaźnik. Pokazujemy tylko dane, które mamy.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto">
          <DataMenu
            selectedId={indicatorId}
            onSelect={onSelect}
            onClose={() => change(false)}
            layout={layout}
            initialQuery={initial.query}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
