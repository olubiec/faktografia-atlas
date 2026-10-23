import { BottomSheet } from '../ui/BottomSheet';
import type { UnitProfile } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import { ProfileBody } from './ProfileSheet';

export interface ProfileSheetMobileProps {
  profile: UnitProfile;
  units: Unit[];
  isOpen?: boolean;
  onClose: () => void;
  className?: string;
}

/**
 * Mobilny arkusz profilu jednostki (dolny, przeciągany).
 * Wyświetlany od dołu ekranu z punktami zatrzymania 40% i 100%.
 * Używa wspólnego komponentu BottomSheet.
 */
export function ProfileSheetMobile({
  profile,
  units,
  isOpen = true,
  onClose,
  className,
}: ProfileSheetMobileProps) {
  if (!isOpen) return null;

  const unitName = profile.unit ? profile.unit.name : `TERYT ${profile.teryt}`;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[1, 0.4]}
      initialSnap={1}
      noBackdrop={true}
      title={unitName}
      className={className}
    >
      <ProfileBody profile={profile} units={units} onClose={onClose} />
    </BottomSheet>
  );
}
