import { libraryIndicatorId } from '@/core/indicators/registry';
import { useMyIndicators } from '../hooks/useMyIndicators';

const BTN =
  'min-h-[44px] min-w-[44px] px-4 py-2 border border-linia text-xs font-semibold text-tusz cursor-pointer transition-colors inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-tusz';

/** Dodaje albo usuwa wskaźnik z biblioteki z listy „Moje wskaźniki” (jedna lista dla całego serwisu). */
export function AddToMineButton({ varId, name }: { varId: string | number; name: string }) {
  const { list, add, remove } = useMyIndicators();
  const id = libraryIndicatorId(varId);
  const added = list.includes(id);
  return (
    <button
      type="button"
      data-testid="add-to-mine"
      aria-pressed={added}
      aria-label={added ? `Usuń z Moich wskaźników: ${name}` : `Dodaj do Moich wskaźników: ${name}`}
      onClick={() => (added ? remove(id) : add(id))}
      className={`${BTN} ${added ? 'bg-tusz/5 hover:bg-linia/15' : 'bg-arkusz hover:bg-linia/15'}`}
    >
      {added ? 'Dodano do Moich · usuń' : '+ Dodaj do Moich wskaźników'}
    </button>
  );
}
