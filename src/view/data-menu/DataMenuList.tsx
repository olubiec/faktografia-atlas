import type { CatalogEntry } from '@/core/catalog/tree';

// Wiersze wskaźników w menu wyboru danych. Czysty komponent (bez stanu): lista + „Pokaż więcej”.

export const PAGE_SIZE = 50;
const LEVEL_NAMES = { woj: 'woj.', pow: 'powiaty', gmi: 'gminy' } as const;

export const rowClass =
  'flex min-h-[44px] w-full items-center justify-between gap-3 border border-linia bg-arkusz px-3 py-2 text-left text-sm text-tusz hover:bg-linia/20 focus-visible:outline-2 focus-visible:outline-tusz cursor-pointer disabled:cursor-not-allowed disabled:text-olowek disabled:hover:bg-arkusz';

export type DataMenuListProps = {
  entries: CatalogEntry[];
  selectedId: string | null;
  onPick: (id: string) => void;
  isDisabled?: (entry: CatalogEntry) => boolean;
  /** Ile wierszy pokazać (po 50, „Pokaż więcej” dokłada kolejne). */
  limit: number;
  onMore: () => void;
  /** Ścieżka „Dział › Grupa” pod nazwą (w wynikach szukania). */
  showPath?: boolean;
};

export function DataMenuList({ entries, selectedId, onPick, isDisabled, limit, onMore, showPath = false }: DataMenuListProps) {
  const shown = entries.slice(0, limit);
  return (
    <ul className="flex flex-col gap-1" aria-label="Wskaźniki">
      {shown.map((e, i) => {
        const disabled = isDisabled?.(e) ?? false;
        const newTopic = !showPath && e.topic !== '' && e.topic !== shown[i - 1]?.topic;
        return (
          <li key={e.id} className="flex flex-col gap-1">
            {newTopic && <h3 className="pt-2 text-xs font-bold uppercase text-olowek">{e.topic}</h3>}
            <button
              type="button"
              disabled={disabled}
              aria-current={e.id === selectedId ? 'true' : undefined}
              onClick={() => onPick(e.id)}
              className={`${rowClass} ${e.id === selectedId ? 'border-tusz font-bold' : ''}`}
            >
              <span className="min-w-0">
                <span className="block break-words font-semibold">{e.name}</span>
                {showPath && <span className="block break-words text-xs text-olowek">{`${e.section} › ${e.group}`}</span>}
                {disabled && <span className="block text-xs text-olowek">Brak danych na tym poziomie</span>}
              </span>
              <span className="shrink-0 text-xs text-olowek">{e.levels.map((l) => LEVEL_NAMES[l]).join(' · ')}</span>
            </button>
          </li>
        );
      })}
      {entries.length > limit && (
        <li>
          <button type="button" className={rowClass} onClick={onMore}>
            {`Pokaż więcej (${entries.length - limit})`}
          </button>
        </li>
      )}
    </ul>
  );
}
