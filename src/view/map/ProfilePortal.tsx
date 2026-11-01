import { useEffect, useRef } from 'react';
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
 *
 * Zachowuje stan aktywnej zakładki (activeTab) oraz rozwiniętych sekcji
 * podczas płynnego przełączania między kolumną boczną a BottomSheet przy przekraczaniu progu 768 px.
 */
export function ProfilePortal({ profile, units, view, onSelectUnit, isOpen, onClose }: ProfilePortalProps) {
  const isMobile = useIsMobile();
  const lastActiveTabRef = useRef<string | null>(null);
  const lastExpandedSectionsRef = useRef<string[]>([]);
  const prevTerytRef = useRef<string | null>(profile?.teryt ?? null);

  // Reset stanu po zmianie wybranej jednostki TERYT
  useEffect(() => {
    if (profile && profile.teryt !== prevTerytRef.current) {
      prevTerytRef.current = profile.teryt;
      lastActiveTabRef.current = null;
      lastExpandedSectionsRef.current = [];
    }
  }, [profile]);

  // Śledzenie aktywnej zakładki i stanu sekcji
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

    const handlePointerOrClick = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const trigger = target.closest<HTMLElement>('[data-slot="tabs-trigger"], [role="tab"]');
      if (trigger) {
        const val = trigger.getAttribute('data-value') || trigger.getAttribute('value');
        if (val) {
          lastActiveTabRef.current = val;
        }
      }

      const compareBtn = target.closest<HTMLElement>('button');
      if (compareBtn && compareBtn.textContent?.includes('Porównaj z innym miejscem')) {
        lastActiveTabRef.current = 'compare';
      }

      if (compareBtn && compareBtn.hasAttribute('aria-expanded')) {
        setTimeout(captureExpandedSections, 50);
      }
    };

    const handleResize = () => {
      const activeTrigger = document.querySelector<HTMLElement>(
        '[data-slot="tabs-trigger"][data-state="active"], [role="tab"][data-state="active"], [role="tab"][aria-selected="true"]'
      );
      if (activeTrigger) {
        const val = activeTrigger.getAttribute('data-value') || activeTrigger.getAttribute('value');
        if (val) {
          lastActiveTabRef.current = val;
        }
      }
      captureExpandedSections();
    };

    document.addEventListener('click', handlePointerOrClick, true);
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      document.removeEventListener('click', handlePointerOrClick, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Przywracanie stanu zakładki i sekcji po przełączeniu widoku (desktop <-> mobile)
  useEffect(() => {
    if (!isOpen) return;

    const restoreState = () => {
      const targetTabVal = lastActiveTabRef.current;
      if (targetTabVal && targetTabVal !== 'overview') {
        const trigger = document.querySelector<HTMLButtonElement>(
          `[data-slot="tabs-trigger"][data-value="${targetTabVal}"], [role="tab"][data-value="${targetTabVal}"], [role="tab"][value="${targetTabVal}"]`
        );
        if (trigger && trigger.getAttribute('data-state') !== 'active' && trigger.getAttribute('aria-selected') !== 'true') {
          trigger.click();
        }
      }

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
