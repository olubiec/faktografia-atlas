import { Xmark } from 'iconoir-react';
import { Icon } from '../ui/Icon';

/** Lista dodanych wskaźników porównania, każdy z przyciskiem „X” (usuń). */
export function ExtraIndicatorList({ ids, names, onRemove }: { ids: string[]; names: Map<string, string>; onRemove: (id: string) => void }) {
  if (ids.length === 0) return null;
  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0 pb-2" aria-label="Dodane wskaźniki">
      {ids.map((id) => {
        const name = names.get(id) ?? id;
        return (
          <li key={id} className="flex items-center justify-between gap-2 border border-linia px-3 text-sm text-tusz">
            <span className="min-w-0 break-words">{name}</span>
            <button
              type="button"
              aria-label={`Usuń z porównania: ${name}`}
              onClick={() => onRemove(id)}
              className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center bg-arkusz text-tusz cursor-pointer"
            >
              <Icon icon={Xmark} size={18} aria-hidden={true} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
