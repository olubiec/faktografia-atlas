import { useState, useEffect } from 'react';
import type { UnitProfile, ProfileIndicatorItem } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import type { MainView } from '../map/hooks/useMainView';
import { unitTitle } from '../../core/units/label';
import { collectFootnotes } from '../../core/profile/footnotes';
import { pickHighlight } from '../../core/profile/highlight';
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
  onClose: () => void;
  className?: string;
  view?: MainView;
  selectUnit?: (teryt: string) => void;
}

export interface ProfileBodyProps {
  profile: UnitProfile;
  units: Unit[];
  onClose?: () => void;
  showCloseButton?: boolean;
  view?: MainView;
  selectUnit?: (teryt: string) => void;
}

/**
 * Treść profilu jednostki (nagłówek, Przegląd, pozostałe wskaźniki, przypisy i źródło).
 * Współdzielona między wersją na komputer (ProfileSheet) a wersją na telefon (ProfileSheetMobile).
 */
export function ProfileBody({
  profile,
  units,
  onClose,
  showCloseButton = true,
  view,
  selectUnit,
}: ProfileBodyProps) {
  const [copied, setCopied] = useState(false);

  const title = profile.unit ? unitTitle(profile.unit) : `TERYT ${profile.teryt}`;
  const tooltipTitle = profile.unit ? profile.unit.name : title;

  // Grupowanie pozostałych wskaźników (z wyłączeniem aktywnego wskaźnika z Przeglądu)
  const remainingIndicators = profile.indicators.filter(
    (item) => item.indicatorId !== view?.indicator.id
  );

  const groupedIndicators = remainingIndicators.reduce<Record<string, ProfileIndicatorItem[]>>(
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

  const highlightedIndicatorId = !view ? pickHighlight(profile.indicators) : null;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Nagłówek */}
      <div className="flex justify-between items-start gap-4 pb-4 border-b border-linia">
        <div className="min-w-0 flex-1 space-y-1">
          <h2
            className="text-2xl font-bold tracking-tight break-words text-tusz"
            title={tooltipTitle}
          >
            {title}
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

      {/* Sekcja Przegląd */}
      {profile.unit && view && (
        <ProfileOverview
          profile={profile}
          units={units}
          view={view}
          selectUnit={selectUnit}
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
      <footer className="pt-4 border-t border-linia text-xs text-olowek space-y-4">
        <div className="flex justify-start">
          <button
            type="button"
            onClick={handleCopyLink}
            className="min-h-[44px] px-4 py-2 border border-linia bg-arkusz hover:bg-kalka transition-colors text-xs font-semibold text-tusz cursor-pointer"
          >
            {copied ? 'Skopiowano' : 'Kopiuj link'}
          </button>
          <span className="sr-only" aria-live="polite">
            {copied ? 'Skopiowano link do schowka' : ''}
          </span>
        </div>
        <div className="space-y-1">
          <Footnotes footnotes={footnotes} />
          <p>{formatSource(latestYear)}</p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Komponent arkusza profilu jednostki (wersja na komputer, 440 px).
 * Prezentuje nagłówek jednostki, Przegląd, przycisk zamknięcia oraz wskaźniki
 * pogrupowane według kategorii ze skonsolidowaną listą przypisów i źródłem danych.
 */
export function ProfileSheet({
  profile,
  units,
  onClose,
  className,
  view,
  selectUnit,
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
        onClose={onClose}
        view={view}
        selectUnit={selectUnit}
      />
    </Sheet>
  );
}
