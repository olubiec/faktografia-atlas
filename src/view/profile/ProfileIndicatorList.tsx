import { useState } from 'react';
import type { ProfileIndicatorItem } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import type { Footnote as FootnoteItem } from '../../core/profile/footnotes';
import { BASIC_INDICATORS } from '../../core/indicators/basic';
import { orderByList } from '../../core/profile/indicator-order';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { DataMenu } from '../data-menu/DataMenu';
import { ProfileIndicatorRow } from './ProfileIndicatorRow';

export interface ChangeIndicatorWindowProps {
  /** Podpis przycisku, np. „Zmień wskaźnik”. */
  label: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  layout?: 'columns' | 'stack';
}

/**
 * Przycisk otwierający to samo menu danych co na mapie (DataMenu) w oknie na cały ekran.
 * Wybór oddaje przez onSelect(id) i zamyka okno; stanu wskaźnika tu nie ma.
 */
export function ChangeIndicatorWindow({ label, selectedId, onSelect, layout = 'columns' }: ChangeIndicatorWindowProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-haspopup="dialog"
          className="min-h-[44px] min-w-[44px] px-4 py-2 bg-arkusz border border-linia hover:bg-linia/20 focus-visible:outline-2 focus-visible:outline-tusz text-xs font-semibold text-tusz cursor-pointer transition-colors"
        >
          {label}
        </button>
      </DialogTrigger>
      <DialogContent
        data-slot="data-menu-window"
        className="z-[10000] inset-0 top-0 left-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden border-0 bg-arkusz p-4 md:p-6"
      >
        <DialogHeader className="pr-12">
          <DialogTitle>Wybierz dane</DialogTitle>
          <DialogDescription>Dział, grupa, wskaźnik. Pokazujemy tylko dane, które mamy.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto">
          <DataMenu
            selectedId={selectedId}
            layout={layout}
            onClose={() => setOpen(false)}
            onSelect={(id) => {
              onSelect(id);
              setOpen(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Stały zestaw 7 podstawowych wskaźników (bez bieżącego, który jest w przeglądzie), pogrupowany działami. */
export function ProfileBasicList({
  items,
  units,
  footnotes,
  onlyBasic = true,
}: {
  items: ProfileIndicatorItem[];
  units: Unit[];
  footnotes: FootnoteItem[];
  onlyBasic?: boolean;
}) {
  const shown = onlyBasic ? orderByList(items, BASIC_INDICATORS) : items;
  const groups = new Map<string, ProfileIndicatorItem[]>();
  for (const item of shown) {
    const g = item.indicator.group || 'Inne';
    groups.set(g, [...(groups.get(g) ?? []), item]);
  }
  return (
    <div className="my-2" data-testid="profile-indicator-list">
      <div className="divide-y divide-linia">
        {[...groups.entries()].map(([name, list]) => (
          <div key={name} className="pt-4 pb-2 first:pt-2">
            <h3 className="text-xs font-bold tracking-wider text-olowek mb-2">{name}</h3>
            {list.map((item) => (
              <div key={item.indicatorId} className="border-b border-linia last:border-b-0">
                <ProfileIndicatorRow item={item} units={units} footnotes={footnotes} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
