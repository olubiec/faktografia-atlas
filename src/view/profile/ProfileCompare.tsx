import type { UnitProfile } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import type { MainView } from '../map/hooks/useMainView';
import { CompareMaps } from './CompareMaps';
import { ProfileCompareTable } from './ProfileCompareTable';

export interface ProfileCompareProps {
  profileA: UnitProfile;
  profileB: UnitProfile | null;
  units?: Unit[];
  view?: MainView;
  onSelectUnit?: (teryt: string) => void;
  className?: string;
}

/**
 * Komponent zakładek/sekcji porównania profilu.
 * Gdy podano drugi profil (profileB), renderuje mapki porównawcze (CompareMaps)
 * oraz tabelę porównawczą (ProfileCompareTable).
 * W przeciwnym razie wyświetla komunikat o zachęcie do wyboru drugiego miejsca.
 */
export function ProfileCompare({
  profileA,
  profileB,
  units,
  view,
  onSelectUnit,
  className,
}: ProfileCompareProps) {
  if (!profileB) {
    return (
      <div className={className} data-slot="profile-compare">
        <p className="py-6 text-sm text-olowek text-center">
          Wybierz drugie miejsce, aby porównać wskaźniki.
        </p>
      </div>
    );
  }

  return (
    <div className={className} data-slot="profile-compare">
      <CompareMaps
        profileA={profileA}
        profileB={profileB}
        units={units}
        view={view}
        onSelectUnit={onSelectUnit}
      />
      <ProfileCompareTable profileA={profileA} profileB={profileB} />
    </div>
  );
}

if (typeof window !== 'undefined') {
  (window as any).__ProfileCompare = ProfileCompare;
}
