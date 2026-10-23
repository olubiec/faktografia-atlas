import { createPortal } from 'react-dom';
import type { UnitProfile } from '@/core/profile/profile';
import type { Unit } from '@/core/units/types';
import { ProfileSheet } from '@/view/profile/ProfileSheet';
import { ProfileSheetMobile } from '@/view/profile/ProfileSheetMobile';
import { useIsMobile } from '@/view/hooks/useIsMobile';

export interface ProfilePortalProps {
  profile: UnitProfile | null;
  units: Unit[];
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Komponent portalujący arkusz profilu do kontenera [data-slot="side"].
 * Automatycznie przełącza pomiędzy wersją na komputer (ProfileSheet)
 * a wersją na telefon (ProfileSheetMobile) w zależności od szerokości ekranu (< 768 px).
 */
export function ProfilePortal({ profile, units, isOpen, onClose }: ProfilePortalProps) {
  const isMobile = useIsMobile();

  if (typeof document === 'undefined' || !isOpen || !profile) {
    return null;
  }

  const container = document.querySelector('[data-slot="side"]');
  if (!container) {
    return null;
  }

  const content = isMobile ? (
    <ProfileSheetMobile profile={profile} units={units} isOpen={isOpen} onClose={onClose} />
  ) : (
    <ProfileSheet profile={profile} units={units} onClose={onClose} />
  );

  return createPortal(content, container);
}
