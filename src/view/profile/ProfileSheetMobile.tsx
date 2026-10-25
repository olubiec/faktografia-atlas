import type { UnitProfile } from '@/core/profile/profile';
import type { Unit } from '@/core/units/types';
import type { MainView } from '../map/hooks/useMainView';
import { ProfileBody } from './ProfileSheet';
import { BottomSheet } from '@/view/ui/BottomSheet';
import { unitTitle } from '@/core/units/label';
import { writeUrlState } from '@/core/url/state';

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
 * z punktami zatrzymania 40% (początkowy) i 100%. Zamknięcie arkusza usuwa parametr ?u= z URL.
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
  if (!isOpen) return null;

  const title = profile.unit ? unitTitle(profile.unit) : `TERYT ${profile.teryt}`;

  const handleClose = () => {
    writeUrlState({ u: null });
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      snapPoints={[0, 0.4, 1]}
      initialSnap={1}
      noBackdrop
      title={title}
      className={className}
    >
      <ProfileBody
        profile={profile}
        units={units}
        view={view}
        onSelectUnit={onSelectUnit}
        onClose={handleClose}
      />
    </BottomSheet>
  );
}
