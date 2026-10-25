import type { UnitProfile } from '../../core/profile/profile';
import { ProfileCompareTable } from './ProfileCompareTable';

export interface ProfileCompareProps {
  profileA: UnitProfile;
  profileB: UnitProfile | null;
  className?: string;
}

/**
 * Komponent zakładek/sekcji porównania profilu.
 * Gdy podano drugi profil (profileB), renderuje tabelę porównawczą (ProfileCompareTable).
 * W przeciwnym razie wyświetla komunikat o zachęcie do wyboru drugiego miejsca.
 */
export function ProfileCompare({
  profileA,
  profileB,
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
      <ProfileCompareTable profileA={profileA} profileB={profileB} />
    </div>
  );
}
