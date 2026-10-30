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

/**
 * Mobilny arkusz profilu jednostki (dolny, przeciągany).
 * Wyświetlany od dołu ekranu na komponentowym BottomSheet w trybie „bez tła” (noBackdrop),
 * z punktami zatrzymania 40% (początkowy) i 100%. Zamknięcie arkusza usuwa parametr ?u= z URL
 * oraz zgłasza wysokość arkusza w pikselach (sheetInset) do widoku mapy.
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
  useEffect(() => {
    if (!isOpen) {
      setSheetInset(0);
      return;
    }

    const updateInset = () => {
      const dialogEl = document.querySelector<HTMLElement>('[role="dialog"]');
      if (dialogEl) {
        const rect = dialogEl.getBoundingClientRect();
        const visibleHeight = Math.max(0, window.innerHeight - rect.y);
        setSheetInset(Math.min(visibleHeight, Math.round(window.innerHeight * 0.45)));
      }
    };

    const observer = new ResizeObserver(() => updateInset());
    const dialogEl = document.querySelector<HTMLElement>('[role="dialog"]');
    if (dialogEl) observer.observe(dialogEl);

    const observerMutation = new MutationObserver(() => updateInset());
    if (dialogEl) observerMutation.observe(dialogEl, { attributes: true, attributeFilter: ['style'] });

    window.addEventListener('resize', updateInset);
    updateInset();

    return () => {
      observer.disconnect();
      observerMutation.disconnect();
      window.removeEventListener('resize', updateInset);
      setSheetInset(0);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const title = profile.unit ? unitTitle(profile.unit) : `TERYT ${profile.teryt}`;

  const handleClose = () => {
    writeUrlState({ u: null });
    onClose();
  };

  const initialSnap = 1;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      snapPoints={[0, 0.4, 1]}
      initialSnap={initialSnap}
      noBackdrop
      title={title}
      className={className}
    >
      <ProfileBody
        showCloseButton={false}
        profile={profile}
        units={units}
        view={view}
        onSelectUnit={onSelectUnit}
        onClose={handleClose}
      />
    </BottomSheet>
  );
}
