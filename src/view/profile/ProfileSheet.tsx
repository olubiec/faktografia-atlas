import { useEffect, useState } from 'react';
import type { UnitProfile, ProfileIndicatorItem } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import type { MainView } from '../map/hooks/useMainView';
import { collectFootnotes } from '../../core/profile/footnotes';
import { pickHighlight } from '../../core/profile/highlight';
import { childUnits } from '../../core/profile/sections';
import { unitTitle } from '../../core/units/label';
import { Footnotes } from './Footnotes';
import { Sheet } from '../ui/Sheet';
import { Icon } from '../ui/Icon';
import { ProfileOverview } from './ProfileOverview';
import { ProfileIndicatorRow } from './ProfileIndicatorRow';
import { ProfileChildren } from './ProfileChildren';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { formatSource } from '../../core/format/number';
import { Xmark, Link } from 'iconoir-react';
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
 * Treść profilu jednostki (nagłówek, zakładki: Przegląd, Powiaty/Gminy, Porównaj, przypisy i źródło).
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
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [prevTeryt, setPrevTeryt] = useState<string>(profile.teryt);

  if (profile.teryt !== prevTeryt) {
    setPrevTeryt(profile.teryt);
    setActiveTab('overview');
  }

  const childrenResult = profile.unit ? childUnits(profile.unit, units) : null;
  const unitTitleText = profile.unit ? unitTitle(profile.unit) : `TERYT ${profile.teryt}`;

  // Gdy brak `view` (np. w testach jednostkowych), wyznaczamy zakreślenie dla wskaźnika z najlepszym wynikiem
  const highlightedIndicatorId = !view ? pickHighlight(profile.indicators) : null;

  // Pozostałe wskaźniki bez bieżącego aktywnego (gdy jest view)
  const otherIndicators = view
    ? profile.indicators.filter((item) => item.indicatorId !== view.indicator.id)
    : profile.indicators;

  // Grupowanie wskaźników z zachowaniem kolejności wystąpienia
  const groupedIndicators = otherIndicators.reduce<Record<string, ProfileIndicatorItem[]>>(
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

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Nagłówek */}
      <div className="flex justify-between items-start gap-4 pb-4 border-b border-linia">
        <div className="min-w-0 flex-1 space-y-1">
          <h2
            className="text-2xl font-bold tracking-tight break-words text-tusz"
            title={profile.unit?.name ?? unitTitleText}
          >
            {unitTitleText}
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

      {/* Zakładki profilu */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="overview" className="min-h-[44px]">
            Przegląd
          </TabsTrigger>
          {childrenResult && childrenResult.label ? (
            <TabsTrigger value="children" className="min-h-[44px]">
              {childrenResult.label}
            </TabsTrigger>
          ) : null}
          <TabsTrigger
            value="compare"
            disabled
            className="min-h-[44px] disabled:opacity-50"
          >
            Porównaj <span className="text-xs text-olowek ml-1">(wkrótce)</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 focus-visible:outline-none">
          {/* Sekcja Przeglądu (bieżący wskaźnik i ranking) */}
          {view && onSelectUnit && (
            <ProfileOverview
              profile={profile}
              units={units}
              view={view}
              onSelectUnit={onSelectUnit}
            />
          )}

          {/* Lista pozostałych wskaźników lub komunikat o braku danych */}
          {otherIndicators.length === 0 && !view ? (
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
                        isHighlighted={!view && item.indicatorId === highlightedIndicatorId}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {childrenResult && childrenResult.label && (
          <TabsContent value="children" className="focus-visible:outline-none">
            <ProfileChildren
              profile={profile}
              units={units}
              view={view}
              onSelectUnit={onSelectUnit}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Stopka z przyciskiem Kopiuj link, przypisami i źródłem */}
      <footer className="pt-4 border-t border-linia text-xs text-olowek space-y-3">
        <div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="min-h-[44px] min-w-[44px] px-4 py-2 bg-arkusz border border-linia hover:bg-linia/15 focus:outline-none focus:ring-2 focus:ring-tusz text-xs font-semibold text-tusz cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <Icon icon={Link} size={16} aria-hidden={true} />
            <span>{copied ? 'Skopiowano' : 'Kopiuj link'}</span>
          </button>
          <div aria-live="polite" className="sr-only">
            {copied ? 'Skopiowano link do schowka' : ''}
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
 * Prezentuje nagłówek jednostki, przycisk zamknięcia, przegląd bieżącego wskaźnika
 * oraz pozostałe wskaźniki pogrupowane według kategorii.
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
