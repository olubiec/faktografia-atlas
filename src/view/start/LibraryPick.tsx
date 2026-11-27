import { useState } from 'react';
import { DialogTrigger } from '@/components/ui/dialog';
import { DataMenu } from '@/view/data-menu/DataMenu';
import { useIsMobile } from '@/view/hooks/useIsMobile';
import { Window } from '@/view/ui/Window';
import { TEXT_LINK } from './ListPodium';

export interface LibraryPickProps {
  selectedId: string | null;
  onPick: (id: string) => void;
}

/**
 * „+ Więcej danych”: to samo menu wyboru danych co na mapie (cała biblioteka), w oknie na cały ekran na telefonie
 * i w oknie pośrodku na komputerze. Spis (available.json) pobiera się dopiero po otwarciu okna.
 */
export function LibraryPick({ selectedId, onPick }: LibraryPickProps) {
  const [open, setOpen] = useState(false);
  const mobile = useIsMobile();
  return (
    <Window
      open={open}
      onOpenChange={setOpen}
      mode={mobile ? 'fullscreen' : 'dialog'}
      slot="library-pick-window"
      title="Wybierz dane"
      description="Pokażemy 5 najwyższych i 5 najniższych wartości wybranego wskaźnika."
      trigger={
        <DialogTrigger asChild>
          <button type="button" aria-haspopup="dialog" data-slot="library-pick" className={`${TEXT_LINK} cursor-pointer font-bold`}>
            + Więcej danych
          </button>
        </DialogTrigger>
      }
    >
      <DataMenu selectedId={selectedId} onSelect={onPick} onClose={() => setOpen(false)} layout={mobile ? 'stack' : 'columns'} />
    </Window>
  );
}
