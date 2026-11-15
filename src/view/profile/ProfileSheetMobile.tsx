import { useEffect } from 'react';
import type { UnitProfile } from '@/core/profile/profile';
import type { Unit } from '@/core/units/types';
import type { MainView } from '../map/hooks/useMainView';
import { ProfileBody } from './ProfileSheet';
import { BottomSheet } from '@/view/ui/BottomSheet';
import { unitTitle } from '@/core/units/label';
import { writeUrlState } from '@/core/url/state';
import { setSheetInset } from '@/view/map/sheetInset';

export interface ProfileSheetMobileProps {
  profile: UnitProfile;
  units: Unit[];
  view?: MainView;
  onSelectUnit?: (teryt: string) => void;
  isOpen?: boolean;
  onClose: () => void;
  className?: string;
}

/** Ucieczka wartości do selektora; w środowisku bez CSS.escape (jsdom) tylko cudzysłów i ukośnik. */
function escapeAttr(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(value);
  return value.replace(/["\\]/g, '\\$&');
}

/**
 * Mobilny arkusz profilu jednostki (dolny, przeciągany).
 * Wyświetlany od dołu ekranu na komponentowym BottomSheet w trybie „bez tła” (noBackdrop),
 * z punktami zatrzymania 40% (początkowy) i 100%. Zamknięcie arkusza usuwa parametr ?u= z URL
 * oraz zgłasza wysokość arkusza w pikselach (sheetInset do maks. 45% wysokości) do widoku mapy.
 */
export function ProfileSheetMobile({
  profile,
  units,
  view,
  onSelectUnit,
  isOpen = true,
  onClose,
  className,
}: ProfileSheetMobileProps) {
  const dialogTitle = profile.unit ? unitTitle(profile.unit) : `TERYT ${profile.teryt}`;

  useEffect(() => {
    if (!isOpen) {
      setSheetInset(0);
      return;
    }

    let styleObserver: MutationObserver | null = null;
    // Własne okno arkusza (po tytule), bo w DOM bywa też zamykany arkusz wskaźnika
    const selector = `[role="dialog"][aria-label="${escapeAttr(dialogTitle)}"]`;

    const updateInset = () => {
      const dialogEl = document.querySelector<HTMLElement>(selector);
      if (dialogEl) {
        const rect = dialogEl.getBoundingClientRect();
        const visibleHeight = Math.max(0, window.innerHeight - rect.y);
        const maxInset = Math.round(window.innerHeight * 0.45);
        setSheetInset(Math.min(visibleHeight, maxInset));
      }
    };

    const attachObserver = () => {
      const dialogEl = document.querySelector<HTMLElement>(selector);
      if (dialogEl) {
        updateInset();
        styleObserver = new MutationObserver(updateInset);
        styleObserver.observe(dialogEl, { attributes: true, attributeFilter: ['style'] });
        return true;
      }
      return false;
    };

    if (!attachObserver()) {
      const domObserver = new MutationObserver(() => {
        if (attachObserver()) {
          domObserver.disconnect();
        }
      });
      domObserver.observe(document.body, { childList: true, subtree: true });

      window.addEventListener('resize', updateInset);

      return () => {
        domObserver.disconnect();
        styleObserver?.disconnect();
        window.removeEventListener('resize', updateInset);
        setSheetInset(0);
      };
    }

    window.addEventListener('resize', updateInset);

    return () => {
      styleObserver?.disconnect();
      window.removeEventListener('resize', updateInset);
      setSheetInset(0);
    };
  }, [isOpen, dialogTitle]);

  if (!isOpen) return null;

  const title = dialogTitle;

  const handleClose = () => {
    writeUrlState({ u: null });
    onClose();
  };

  const isSheetFull =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('sheet') === 'full';

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      snapPoints={[0, 0.4, 1]}
      initialSnap={isSheetFull ? 2 : 1}
      noBackdrop
      title={title}
      className={className}
    >
      {/* Kolumna przycina zakreślenie (rough-notation rysuje poza polem liczby) */}
      <div data-testid="profile-sheet-column" className="min-w-0 max-w-full overflow-x-clip">
        <ProfileBody
          profile={profile}
          units={units}
          view={view}
          onSelectUnit={onSelectUnit}
          onClose={handleClose}
          showCloseButton={false}
        />
      </div>
    </BottomSheet>
  );
}
