import { useEffect } from 'react';
import type { UnitProfile, ProfileIndicatorItem } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import { Sheet } from '../ui/Sheet';
import { Icon } from '../ui/Icon';
import { ProfileIndicatorRow } from './ProfileIndicatorRow';
import { formatSource } from '../../core/format/number';
import { Xmark } from 'iconoir-react';
import { cn } from '../../lib/utils';

export interface ProfileSheetProps {
  profile: UnitProfile;
  units: Unit[];
  onClose: () => void;
  className?: string;
}

function getLevelLabel(level?: string | null): string {
  switch (level) {
    case 'woj':
      return 'Województwo';
    case 'pow':
      return 'Powiat';
    case 'gmi':
      return 'Gmina';
    default:
      return 'Jednostka';
  }
}

/**
 * Komponent arkusza profilu jednostki (wersja na komputer, 440 px).
 * Prezentuje nagłówek jednostki, przycisk zamknięcia oraz wskaźniki
 * pogrupowane według kategorii z podanym źródłem danych.
 */
export function ProfileSheet({ profile, units, onClose, className }: ProfileSheetProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const unitName = profile.unit ? profile.unit.name : `TERYT ${profile.teryt}`;
  const levelLabel = profile.unit ? getLevelLabel(profile.unit.level) : 'Jednostka';

  // Grupowanie wskaźników z zachowaniem kolejności wystąpienia
  const groupedIndicators = profile.indicators.reduce<Record<string, ProfileIndicatorItem[]>>(
    (acc, item) => {
      const group = item.indicator.group || 'Inne';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(item);
      return acc;
    },
    {}
  );

  // Szukanie najnowszego roku dla formatSource
  const latestYear = profile.indicators.reduce<number | null>((max, ind) => {
    if (ind.year === null) return max;
    return max === null ? ind.year : Math.max(max, ind.year);
  }, null);

  return (
    <Sheet className={cn('w-full max-w-[440px]', className)}>
      {/* Nagłówek */}
      <div className="flex justify-between items-start gap-4 pb-4 border-b border-linia">
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="text-2xl font-bold tracking-tight break-words text-tusz">
            {unitName}
          </h2>
          <p className="text-xs text-olowek font-mono">
            {`${levelLabel} • TERYT ${profile.teryt}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zamknij"
          className="min-h-[44px] min-w-[44px] p-2 flex items-center justify-center border border-linia bg-arkusz hover:bg-kalka transition-colors text-tusz shrink-0 cursor-pointer"
        >
          <Icon icon={Xmark} aria-hidden={true} size={20} />
        </button>
      </div>

      {/* Lista wskaźników wg grup */}
      <div className="divide-y divide-linia my-2">
        {Object.entries(groupedIndicators).map(([groupName, items]) => (
          <div key={groupName} className="pt-4 pb-2 first:pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-olowek mb-2">
              {groupName}
            </h3>
            <div>
              {items.map((item) => (
                <ProfileIndicatorRow
                  key={item.indicatorId}
                  item={item}
                  units={units}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Stopka ze źródłem */}
      <footer className="pt-4 border-t border-linia text-xs text-olowek">
        <p>{formatSource(latestYear)}</p>
      </footer>
    </Sheet>
  );
}
