import { useState } from 'react';
import type { ProfileIndicatorItem } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import type { Footnote as FootnoteItem } from '../../core/profile/footnotes';
import { BASIC_INDICATORS } from '../../core/indicators/basic';
import { orderByList } from '../../core/profile/indicator-order';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Xmark } from 'iconoir-react';
import { Icon } from '../ui/Icon';
import { useIsMobile } from '../hooks/useIsMobile';
import { useExtraItems } from './useExtraItems';
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
export function ChangeIndicatorWindow({ label, selectedId, onSelect, layout }: ChangeIndicatorWindowProps) {
  const [open, setOpen] = useState(false);
  // Telefon: jeden widok naraz (dział → grupa → wskaźnik), tak jak przy wyborze danych dla mapy.
  const mobile = useIsMobile();
  const menuLayout = layout ?? (mobile ? 'stack' : 'columns');
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
        <div className="min-h-0 overflow-y-auto overscroll-contain">
          <DataMenu
            selectedId={selectedId}
            layout={menuLayout}
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
  teryt,
  items,
  units,
  footnotes,
  onlyBasic = true,
}: {
  teryt: string;
  items: ProfileIndicatorItem[];
  units: Unit[];
  footnotes: FootnoteItem[];
  onlyBasic?: boolean;
}) {
  const [extra, setExtra] = useState<string[]>([]);
  const basic = orderByList(items, BASIC_INDICATORS);
  const inProfile = new Set(items.map((i) => i.indicatorId));
  const fetched = useExtraItems(teryt, extra, units, inProfile);
  const added = [
    ...items.filter((i) => extra.includes(i.indicatorId) && !basic.includes(i)),
    ...fetched.filter((i) => !inProfile.has(i.indicatorId)),
  ];
  const shown = onlyBasic ? [...basic, ...added] : items;
  const missing = extra.some((id) => !shown.some((i) => i.indicatorId === id));
  const remove = (id: string) => setExtra((p) => p.filter((x) => x !== id));
  const groups = new Map<string, ProfileIndicatorItem[]>();
  for (const item of shown) {
    const g = item.indicator.group || 'Inne';
    groups.set(g, [...(groups.get(g) ?? []), item]);
  }
  return (
    <div className="my-2" data-testid="profile-indicator-list">
      {onlyBasic && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <ChangeIndicatorWindow
            label="Dodaj wskaźnik"
            selectedId={null}
            onSelect={(id) => setExtra((p) => (p.includes(id) ? p : [...p, id]))}
          />
          {extra.length > 0 && (
            <button type="button" onClick={() => setExtra([])} className="min-h-[44px] px-4 py-2 border border-linia bg-arkusz text-xs font-semibold cursor-pointer">
              Tylko podstawowe
            </button>
          )}
          {missing && <p className="text-xs text-olowek">Dla tego miejsca nie mamy części wybranych danych.</p>}
        </div>
      )}
      <div className="divide-y divide-linia">
        {[...groups.entries()].map(([name, list]) => (
          <div key={name} className="pt-4 pb-2 first:pt-2">
            <h3 className="text-xs font-bold tracking-wider text-olowek mb-2">{name}</h3>
            {list.map((item) => (
              <div key={item.indicatorId} className="flex items-start gap-2 border-b border-linia last:border-b-0">
                <div className="min-w-0 flex-1">
                  <ProfileIndicatorRow item={item} units={units} footnotes={footnotes} />
                </div>
                {extra.includes(item.indicatorId) && (
                  <button
                    type="button"
                    aria-label={`Usuń z listy: ${item.indicator.name}`}
                    onClick={() => remove(item.indicatorId)}
                    className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center border border-linia bg-arkusz text-tusz hover:bg-linia/20 focus-visible:outline-2 focus-visible:outline-tusz cursor-pointer"
                  >
                    <Icon icon={Xmark} size={20} aria-hidden={true} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
