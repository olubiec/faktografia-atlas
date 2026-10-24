import { useEffect } from 'react';
import { Sheet } from 'react-modal-sheet';
import type { UnitProfile } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import type { MainView } from '../map/hooks/useMainView';
import { ProfileBody } from './ProfileSheet';
import { cn } from '../../lib/utils';

export interface ProfileSheetMobileProps {
  profile: UnitProfile;
  units: Unit[];
  isOpen?: boolean;
  onClose: () => void;
  initialSnap?: number;
  snapPoints?: number[];
  className?: string;
  view?: MainView;
  selectUnit?: (teryt: string) => void;
}

/**
 * Mobilny arkusz profilu jednostki (dolny, przeciągany).
 * Wyświetlany od dołu ekranu z 3 punktami zatrzymania (zwinięty ≈ nagłówek, połowa, pełny).
 * Używa pakietu react-modal-sheet i tokenów Faktografii.
 */
export function ProfileSheetMobile({
  profile,
  units,
  isOpen = true,
  onClose,
  initialSnap = 2,
  snapPoints = [0, 0.18, 0.5, 1],
  className,
  view,
  selectUnit,
}: ProfileSheetMobileProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={snapPoints}
      initialSnap={initialSnap}
      onSnap={(index) => {
        if (index === 0) {
          onClose();
        }
      }}
      unstyled
      className={cn('z-50', className)}
    >
      <Sheet.Container
        unstyled
        className="bg-arkusz border-t border-linia text-tusz flex flex-col shadow-none rounded-none max-w-full"
      >
        <Sheet.Header unstyled className="py-3 flex justify-center items-center cursor-grab">
          <div className="w-12 h-1 bg-olowek/40 rounded-none" />
        </Sheet.Header>
        <Sheet.Content unstyled className="p-4 overflow-y-auto">
          <ProfileBody
            profile={profile}
            units={units}
            onClose={onClose}
            view={view}
            selectUnit={selectUnit}
          />
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop unstyled className="bg-tusz/20" style={{ opacity: 1 }} aria-label="Zamknij arkusz" onClick={onClose} />
    </Sheet>
  );
}
