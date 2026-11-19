import { Link } from 'react-router';
import { Xmark } from 'iconoir-react';
import indicatorsData from '../../../config/indicators.json';
import { isLibraryIndicatorId, libraryVarId } from '@/core/indicators/registry';
import { isBasic } from '@/core/my-indicators/my-indicators';
import type { LibraryIndex, LibraryVariable } from '@/core/library/query';
import type { Indicator } from '@/core/profile/profile';
import { useMyIndicators } from '../hooks/useMyIndicators';
import { Icon } from '../ui/Icon';

const MAIN = indicatorsData as Indicator[];

const BTN =
  'min-h-[44px] min-w-[44px] px-4 py-2 bg-arkusz border border-linia hover:bg-linia/15 focus:outline-none focus:ring-2 focus:ring-tusz text-xs font-semibold text-tusz cursor-pointer transition-colors inline-flex items-center justify-center';

interface Entry {
  id: string;
  name: string;
  /** Id zmiennej w bibliotece (do linku); brak = bez linku. */
  varId: string | null;
}

function variablesOf(index: LibraryIndex): LibraryVariable[] {
  return Array.isArray(index.variables) ? index.variables : Object.values(index.variables || {});
}

/** Zamienia id z listy „Moje” na nazwę: najpierw wskaźniki główne, potem biblioteka. */
function resolveEntries(list: readonly string[], index: LibraryIndex): Entry[] {
  const vars = variablesOf(index);
  return list.map((id) => {
    const main = MAIN.find((m) => m.id === id);
    if (main) {
      return { id, name: main.name, varId: main.bdlVarId != null ? String(main.bdlVarId) : null };
    }
    const vid = isLibraryIndicatorId(id) ? libraryVarId(id) : null;
    const found = vid ? vars.find((v) => String(v.id) === vid) : undefined;
    return { id, name: found?.name ?? id, varId: vid };
  });
}

/** Sekcja na górze Biblioteki: „Moje wskaźniki” z usuwaniem i przywracaniem podstawowych. */
export function MyIndicatorsSection({ index }: { index: LibraryIndex }) {
  const { list, remove, reset } = useMyIndicators();
  const entries = resolveEntries(list, index);

  return (
    <section data-testid="my-indicators-section" aria-labelledby="my-indicators-heading" className="space-y-3">
      <h2 id="my-indicators-heading" className="text-lg font-bold text-tusz">
        Moje wskaźniki
      </h2>
      {entries.length === 0 ? (
        <p className="text-sm text-olowek">Nie wybrano żadnych wskaźników.</p>
      ) : (
        <ul className="m-0 p-0 list-none border border-linia bg-arkusz divide-y divide-linia">
          {entries.map((e) => (
            <li key={e.id} className="flex items-stretch">
              {e.varId ? (
                <Link
                  to={`/biblioteka/${e.varId}`}
                  className="flex-1 min-h-[44px] px-3 py-2 flex items-center text-sm text-tusz hover:bg-linia/15 focus:outline-none focus:ring-2 focus:ring-tusz"
                >
                  {e.name}
                </Link>
              ) : (
                <span className="flex-1 min-h-[44px] px-3 py-2 flex items-center text-sm text-tusz">{e.name}</span>
              )}
              <button
                type="button"
                onClick={() => remove(e.id)}
                aria-label={`Usuń wskaźnik: ${e.name}`}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-olowek hover:text-tusz hover:bg-linia/15 focus:outline-none focus:ring-2 focus:ring-tusz cursor-pointer shrink-0"
              >
                <Icon icon={Xmark} aria-hidden={true} size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {!isBasic(list) && (
        <button type="button" onClick={reset} className={BTN}>
          Przywróć podstawowe
        </button>
      )}
    </section>
  );
}
