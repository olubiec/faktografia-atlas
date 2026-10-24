import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { UnitProfile } from '@/core/profile/profile';
import type { Unit } from '@/core/units/types';
import type { MainView } from '@/view/map/hooks/useMainView';
import { ProfileSheet } from '@/view/profile/ProfileSheet';
import { ProfileSheetMobile } from '@/view/profile/ProfileSheetMobile';
import tokensJson from '../../../config/tokens.json';

export interface ProfilePortalProps {
  profile: UnitProfile | null;
  units: Unit[];
  view?: MainView;
  onSelectUnit?: (teryt: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const TABLET_BREAKPOINT = tokensJson.breakpoints.tablet; // 768 px

/**
 * Komponent portalujący arkusz profilu do kontenera [data-slot="side"].
 * Automatycznie przełącza pomiędzy wersją na komputer (ProfileSheet)
 * a wersją na telefon (ProfileSheetMobile) w zależności od szerokości ekranu (< 768 px).
 */
export function ProfilePortal({ profile, units, view, onSelectUnit, isOpen, onClose }: ProfilePortalProps) {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < TABLET_BREAKPOINT;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < TABLET_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (typeof document === 'undefined' || !isOpen || !profile) {
    return null;
  }

  const container = document.querySelector('[data-slot="side"]');
  if (!container) {
    return null;
  }

  const content = isMobile ? (
    <ProfileSheetMobile
      profile={profile}
      units={units}
      view={view}
      onSelectUnit={onSelectUnit}
      isOpen={isOpen}
      onClose={onClose}
    />
  ) : (
    <ProfileSheet
      profile={profile}
      units={units}
      view={view}
      onSelectUnit={onSelectUnit}
      onClose={onClose}
    />
  );

  return createPortal(content, container);
}
