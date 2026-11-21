import { useMemo } from 'react';
import { searchOutcome } from '@/core/catalog/search';
import type { CatalogEntry, CatalogTree } from '@/core/catalog/tree';
import { SearchField } from '@/view/ui/SearchField';
import { DataMenuList } from './DataMenuList';

export const MIN_QUERY = 2;

export function DataMenuSearchField({ value, onChange }: { value: string; onChange: (text: string) => void }) {
  return (
    <SearchField
      id="data-menu-search"
      label="Szukaj wskaźnika"
      placeholder="np. bezrobocie, zarobki, mieszkania"
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export type DataMenuResultsProps = {
  tree: CatalogTree;
  text: string;
  selectedId: string | null;
  onPick: (id: string) => void;
  onOpenSection: (sectionName: string) => void;
  isDisabled?: (entry: CatalogEntry) => boolean;
  limit: number;
  onMore: () => void;
};

/** Wyniki szukania albo komunikat „Nie mamy jeszcze tych danych o „…”.” z najbliższym działem. */
export function DataMenuResults({ tree, text, selectedId, onPick, onOpenSection, isDisabled, limit, onMore }: DataMenuResultsProps) {
  const outcome = useMemo(() => searchOutcome(tree, text), [tree, text]);
  if (outcome.kind === 'none') {
    return (
      <div className="flex flex-col gap-2 text-sm" role="status">
        <p>{outcome.message}</p>
        {outcome.nearestSection && (
          <p>
            {'Najbliższy dział: '}
            <button
              type="button"
              className="min-h-[44px] px-1 font-semibold underline underline-offset-4 cursor-pointer"
              onClick={() => onOpenSection(outcome.nearestSection!)}
            >
              {outcome.nearestSection}
            </button>
          </p>
        )}
      </div>
    );
  }
  const entries = outcome.hits.map((h) => h.entry);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-olowek" role="status">{`Wyniki: ${entries.length}`}</p>
      <DataMenuList
        entries={entries}
        selectedId={selectedId}
        onPick={onPick}
        isDisabled={isDisabled}
        limit={limit}
        onMore={onMore}
        showPath
      />
    </div>
  );
}
