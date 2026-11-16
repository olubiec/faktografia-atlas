// Przycisk „Dostosuj układ” otwierający edytor układu w dialogu.
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/ui/dialog';
import { LayoutEditor } from './LayoutEditor';
import { useLayout } from './useLayout';

export function LayoutDialogButton() {
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useLayout();
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-[44px] min-w-[44px] px-4 py-2 bg-arkusz border border-linia hover:bg-linia/15 focus:outline-none focus:ring-2 focus:ring-tusz text-xs font-semibold text-tusz cursor-pointer transition-colors flex items-center justify-center gap-2"
      >
        Dostosuj układ
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto">
          <DialogTitle className="sr-only">Dostosuj układ</DialogTitle>
          <DialogDescription className="sr-only">
            Wybierz, które bloki profilu i kart są widoczne, oraz ich kolejność.
          </DialogDescription>
          <LayoutEditor layout={layout} onChange={setLayout} />
        </DialogContent>
      </Dialog>
    </>
  );
}
