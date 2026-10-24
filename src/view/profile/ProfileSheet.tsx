import { useEffect, useState } from 'react';
import type { UnitProfile, ProfileIndicatorItem } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import type { MainView } from '../map/hooks/useMainView';
import { collectFootnotes } from '../../core/profile/footnotes';
import { pickHighlight } from '../../core/profile/highlight';
import { unitTitle } from '../../core/units/label';
import { Footnotes } from './Footnotes';
import { Sheet } from '../ui/Sheet';
import { Icon } from '../ui/Icon';
import { ProfileIndicatorRow } from './ProfileIndicatorRow';
import { ProfileOverview } from './ProfileOverview';
import { formatSource } from '../../core/format/number';
import { Xmark } from 'iconoir-react';
import { cn } from '../../lib/utils';

export interface ProfileSheetProps {
  profile: UnitProfile;
  units: Unit[];
  view?: MainView;
  onSelectUnit?: (teryt: string) => void;
  onClose: () => void;
  className?: string;
}

export interface ProfileBodyProps {
  profile: UnitProfile;
  units: Unit[];
  view?: MainView;
  onSelectUnit?: (teryt: string) => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

/**
 * Treść profilu jednostki (nagłówek, przegląd bieżącego wskaźnika z rankingiem,
 * lista pozostałych wskaźników, przycisk Kopiuj link, przypisy i źródło).
 * Współdzielona między wersją na komputer (ProfileSheet) a wersją na telefon (ProfileSheetMobile).
 */
export function ProfileBody({
  profile,
  units,
  view,
  onSelectUnit,
  onClose,
  showCloseButton = true,
}: ProfileBodyProps) {
  const headerTitle = profile.unit ? unitTitle(profile.unit) : `TERYT ${profile.teryt}`;
  const rawUnitName = profile.unit ? profile.unit.name : headerTitle;
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  // Filtrowanie wskaźników: bieżący wskaźnik trafia do ProfileOverview i nie jest powtarzany na liście poniżej
  const filteredIndicators = view
    ? profile.indicators.filter((item) => item.indicatorId !== view.indicator.id)
    : profile.indicators;

  // Grupowanie pozostałych wskaźników z zachowaniem kolejności wystąpienia
  const groupedIndicators = filteredIndicators.reduce<Record<string, ProfileIndicatorItem[]>>(
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

  // Zbieranie skonsolidowanej listy numerowanych przypisów dla profilu
  const footnotes = collectFootnotes(profile.indicators, units);

  // Wyznaczenie zakreślenia wyłącznie w starym trybie (gdy view nie jest przekazany)
  const highlightedIndicatorId = !view ? pickHighlight(profile.indicators) : null;

  return (
    <div className="space-y-4">
      {/* Nagłówek */}
      <div className="flex justify-between items-start gap-4 pb-4 border-b border-linia">
        <div className="min-w-0 flex-1 space-y-1">
          <h2
            className="text-2xl font-bold tracking-tight break-words text-tusz"
            title={rawUnitName}
          >
            {headerTitle}
          </h2>
          <p className="text-xs text-olowek font-mono">
            {`TERYT ${profile.teryt}`}
          </p>
        </div>
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij"
            className="min-h-[44px] min-w-[44px] p-2 flex items-center justify-center border border-linia bg-arkusz hover:bg-kalka transition-colors text-tusz shrink-0 cursor-pointer"
          >
            <Icon icon={Xmark} aria-hidden={true} size={20} />
          </button>
        )}
      </div>

      {/* Przegląd bieżącego wskaźnika i ranking */}
      {view && (
        <ProfileOverview
          profile={profile}
          units={units}
          view={view}
          onSelectUnit={onSelectUnit}
        />
      )}

      {/* Lista pozostałych wskaźników lub komunikat o braku danych */}
      {profile.indicators.length === 0 ? (
        <p className="py-6 text-sm text-olowek text-center">
          Brak danych profilu dla tej jednostki.
        </p>
      ) : (
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
                    footnotes={footnotes}
                    isHighlighted={item.indicatorId === highlightedIndicatorId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stopka z przyciskiem Kopiuj link, przypisami i źródłem */}
      <footer className="pt-4 border-t border-linia text-xs text-olowek space-y-3">
        <div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="min-h-[44px] min-w-[44px] px-4 py-2 border border-linia bg-arkusz hover:bg-kalka transition-colors text-tusz font-semibold cursor-pointer text-xs flex items-center justify-center"
          >
            {copied ? 'Skopiowano' : 'Kopiuj link'}
          </button>
          <div aria-live="polite" className="sr-only">
            {copied ? 'Skopiowano link do profilu' : ''}
          </div>
        </div>

        <Footnotes footnotes={footnotes} />
        <p>{formatSource(latestYear)}</p>
      </footer>
    </div>
  );
}

/**
 * Komponent arkusza profilu jednostki (wersja na komputer, 440 px).
 * Prezentuje nagłówek jednostki, przegląd wskaźnika z rankingiem, przycisk zamknięcia
 * oraz pozostałe wskaźniki pogrupowane według kategorii ze skonsolidowaną listą przypisów i źródłem danych.
 */
export function ProfileSheet({
  profile,
  units,
  view,
  onSelectUnit,
  onClose,
  className,
}: ProfileSheetProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <Sheet className={cn('w-full max-w-[440px]', className)}>
      <ProfileBody
        profile={profile}
        units={units}
        view={view}
        onSelectUnit={onSelectUnit}
        onClose={onClose}
      />
    </Sheet>
  );
}
