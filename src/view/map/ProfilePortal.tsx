import { createPortal } from 'react-dom';
import type { UnitProfile } from '@/core/profile/profile';
import type { Unit } from '@/core/units/types';
import type { MainView } from '@/view/map/hooks/useMainView';
import { ProfileSheet } from '@/view/profile/ProfileSheet';
import { ProfileSheetMobile } from '@/view/profile/ProfileSheetMobile';
import { useIsMobile } from '@/view/hooks/useIsMobile';

export interface ProfilePortalProps {
  profile: UnitProfile | null;
  units: Unit[];
  view?: MainView;
  onSelectUnit?: (teryt: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Komponent portalujący arkusz profilu do kontenera [data-slot="side"] na komputerze
 * lub do document.body na urządzeniu mobilnym (< 768 px), co pozwala profilowi
 * na telefonie unosić się nad mapą w dolnym arkuszu (BottomSheet).
 */
export function ProfilePortal({ profile, units, view, onSelectUnit, isOpen, onClose }: ProfilePortalProps) {
  const isMobile = useIsMobile();

  if (typeof document === 'undefined' || !isOpen || !profile) {
    return null;
  }

  if (isMobile) {
    return createPortal(
      <ProfileSheetMobile
        profile={profile}
        units={units}
        view={view}
        onSelectUnit={onSelectUnit}
        isOpen={isOpen}
        onClose={onClose}
      />,
      document.body
    );
  }

  const container = document.querySelector('[data-slot="side"]');
  if (!container) {
    return null;
  }

  return createPortal(
    <ProfileSheet
      profile={profile}
      units={units}
      view={view}
      onSelectUnit={onSelectUnit}
      onClose={onClose}
    />,
    container
  );
}
