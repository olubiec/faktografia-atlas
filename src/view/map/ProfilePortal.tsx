import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { UnitProfile } from '@/core/profile/profile';
import type { Unit } from '@/core/units/types';
import type { MainView } from '@/view/map/hooks/useMainView';
import { ProfileSheet, ProfileBody } from '@/view/profile/ProfileSheet';
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
 *
 * Trzyma stan aktywnej zakładki (activeTab) i przekazuje go w dół; zachowuje też rozwinięte sekcji
 * podczas płynnego przełączania między kolumną boczną a BottomSheet przy przekraczaniu progu 768 px.
 */
export function ProfilePortal({ profile, units, view, onSelectUnit, isOpen, onClose }: ProfilePortalProps) {
  const isMobile = useIsMobile();
  const lastExpandedSectionsRef = useRef<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>(ProfileBody.initialTab);
  const [prevTeryt, setPrevTeryt] = useState<string | null>(profile?.teryt ?? null);

  // Reset zakładki po zmianie jednostki (albo „compare” przy ?c=) – ta sama logika co dawniej w ProfileBody
  if (profile && profile.teryt !== prevTeryt) {
    setPrevTeryt(profile.teryt);
    setActiveTab(ProfileBody.initialTab());
  }

  // Zmiana jednostki czyści zapamiętane sekcje (poza renderem)
  useEffect(() => {
    lastExpandedSectionsRef.current = [];
  }, [profile?.teryt]);

  // Powrót w historii do adresu z parą ?c= otwiera porównanie
  useEffect(() => {
    const onPop = () => {
      if (ProfileBody.hasComparePair()) setActiveTab('compare');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Śledzenie rozwiniętych sekcji (zakładka jest już w stanie portalu)
  useEffect(() => {
    if (!isOpen) return;

    const captureExpandedSections = () => {
      const expanded = document.querySelectorAll<HTMLButtonElement>('button[aria-expanded="true"]');
      const keys: string[] = [];
      expanded.forEach((btn) => {
        const key = btn.getAttribute('aria-label') || btn.querySelector('span')?.textContent?.trim() || btn.textContent?.trim();
        if (key) keys.push(key);
      });
      lastExpandedSectionsRef.current = keys;
    };

    const handleClick = (e: Event) => {
      const btn = (e.target as HTMLElement | null)?.closest<HTMLElement>('button');
      if (btn && btn.hasAttribute('aria-expanded')) {
        setTimeout(captureExpandedSections, 50);
      }
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('resize', captureExpandedSections, { passive: true });

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('resize', captureExpandedSections);
    };
  }, [isOpen]);

  // Przywracanie rozwiniętych sekcji po przełączeniu widoku (komputer <-> telefon)
  useEffect(() => {
    if (!isOpen) return;

    const restoreState = () => {
      if (lastExpandedSectionsRef.current.length > 0) {
        const closedButtons = document.querySelectorAll<HTMLButtonElement>('button[aria-expanded="false"]');
        closedButtons.forEach((btn) => {
          const key = btn.getAttribute('aria-label') || btn.querySelector('span')?.textContent?.trim() || btn.textContent?.trim();
          if (key && lastExpandedSectionsRef.current.includes(key)) {
            btn.click();
          }
        });
      }
    };

    restoreState();
    const animId = requestAnimationFrame(restoreState);
    const timeoutId = setTimeout(restoreState, 50);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(timeoutId);
    };
  }, [isMobile, isOpen]);

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
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />,
    container
  );
}
