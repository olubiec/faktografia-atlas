import { useState } from 'react';
import { Plus, Xmark } from 'iconoir-react';
import type { ProfileIndicatorItem, UnitProfile } from '../../core/profile/profile';
import { isBasic, type MyIndicators } from '../../core/my-indicators/my-indicators';
import { AddIndicatorWindow } from '../profile/AddIndicatorWindow';
import { Icon } from '../ui/Icon';

export interface CompareIndicatorPickerProps {
  /** Wszystkie wskaźniki profilu (z nich buduje się nazwy i listę do dodania). */
  items: ProfileIndicatorItem[];
  /** Aktualna lista „Moje wskaźniki”. */
  list: MyIndicators;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onReset: () => void;
}

const BTN =
  'min-h-[44px] min-w-[44px] px-4 py-2 bg-arkusz border border-linia hover:bg-linia/15 focus:outline-none focus:ring-2 focus:ring-tusz text-xs font-semibold text-tusz cursor-pointer transition-colors flex items-center justify-center gap-2';

/** Zostawia w profilu tylko wskaźniki z listy (kolejność profilu). */
function restrictProfile(profile: UnitProfile, list: MyIndicators): UnitProfile {
  return { ...profile, indicators: profile.indicators.filter((i) => list.includes(i.indicatorId)) };
}

/**
 * Wskaźniki w porównaniu: każdy z przyciskiem ×, „+ Dodaj wskaźnik” (także z biblioteki)
 * i „Przywróć podstawowe”. Lista jest wspólna z innymi ekranami („Moje wskaźniki”).
 */
export function CompareIndicatorPicker({ items, list, onAdd, onRemove, onReset }: CompareIndicatorPickerProps) {
  const [open, setOpen] = useState(false);
  const shown = items.filter((i) => list.includes(i.indicatorId));
  const available = items.filter((i) => !list.includes(i.indicatorId));

  return (
    <div className="mb-4" data-testid="compare-indicator-picker">
      {shown.length === 0 && (
        <p className="py-2 text-sm text-olowek">Nie wybrano żadnych wskaźników. Dodaj pierwszy.</p>
      )}
      <ul className="flex flex-wrap gap-2">
        {shown.map((item) => (
          <li key={item.indicatorId} className="flex items-center border border-linia bg-arkusz">
            <span className="pl-3 text-xs text-tusz">{item.indicator.name}</span>
            <button
              type="button"
              onClick={() => onRemove(item.indicatorId)}
              aria-label={`Usuń wskaźnik: ${item.indicator.name}`}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-olowek hover:text-tusz hover:bg-linia/15 focus:outline-none focus:ring-2 focus:ring-tusz cursor-pointer shrink-0"
            >
              <Icon icon={Xmark} aria-hidden={true} size={16} />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-2 pt-3">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={BTN}>
          <Icon icon={Plus} size={16} aria-hidden={true} />
          <span>Dodaj wskaźnik</span>
        </button>
        {!isBasic(list) && (
          <button type="button" onClick={onReset} className={BTN}>
            Przywróć podstawowe
          </button>
        )}
      </div>
      {open && <AddIndicatorWindow items={available} onAdd={onAdd} />}
    </div>
  );
}

/** Czysta logika (poza plikiem eksportujemy ją tak jak w PlacePicker). */
CompareIndicatorPicker.restrictProfile = restrictProfile;
