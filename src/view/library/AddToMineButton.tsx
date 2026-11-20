import { useEffect, useRef, useState } from 'react';
import { libraryIndicatorId } from '@/core/indicators/registry';
import { useMyIndicators } from '../hooks/useMyIndicators';

const BTN =
  'min-h-[44px] min-w-[44px] px-4 py-2 border border-linia text-xs font-semibold text-tusz cursor-pointer transition-colors inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-tusz';

/** Czas wyświetlania komunikatu (to nie animacja, więc bez tokenu motion; wzorzec: COPIED_MS w ShareBar). */
export const STATUS_MS = 3000;

/** Czysta logika przycisku: etykieta, napis, aria i komunikat zależnie od stanu. */
function mineButtonView(added: boolean, name: string) {
  return {
    pressed: added,
    ariaLabel: added ? `Usuń z Moich wskaźników: ${name}` : `Dodaj do Moich wskaźników: ${name}`,
    text: added ? 'Dodano do Moich · usuń' : '+ Dodaj do Moich wskaźników',
    /** Komunikat po kliknięciu (stan PRZED kliknięciem: dodany → klik usuwa). */
    statusAfterClick: added ? 'Usunięto z Moich wskaźników' : 'Dodano do Moich wskaźników',
  };
}

/** Wykonuje akcję zależną od stanu: dodany → usuń, niedodany → dodaj. */
function runMineAction(
  added: boolean,
  id: string,
  actions: { add: (id: string) => void; remove: (id: string) => void }
) {
  if (added) actions.remove(id);
  else actions.add(id);
}

/** Dodaje albo usuwa wskaźnik z biblioteki z listy „Moje wskaźniki” (jedna lista dla całego serwisu). */
export function AddToMineButton({ varId, name }: { varId: string | number; name: string }) {
  const { list, add, remove } = useMyIndicators();
  const [status, setStatus] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = libraryIndicatorId(varId);
  const added = list.includes(id);
  const view = mineButtonView(added, name);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const handleClick = () => {
    runMineAction(added, id, { add, remove });
    setStatus(view.statusAfterClick);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(''), STATUS_MS);
  };

  return (
    <span className="inline-flex flex-wrap items-center gap-2 max-w-full">
      <button
        type="button"
        data-testid="add-to-mine"
        aria-pressed={view.pressed}
        aria-label={view.ariaLabel}
        onClick={handleClick}
        className={`${BTN} ${added ? 'bg-tusz/5 hover:bg-linia/15' : 'bg-arkusz hover:bg-linia/15'}`}
      >
        {view.text}
      </button>
      <span role="status" className="text-xs text-olowek">
        {status}
      </span>
    </span>
  );
}

// Czysta logika wystawiona jako pola komponentu (do testów; reguła lintera dopuszcza tylko komponenty i stałe).
AddToMineButton.view = mineButtonView;
AddToMineButton.run = runMineAction;
