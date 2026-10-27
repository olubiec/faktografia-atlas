import {
  categoryPath,
  childCategories,
  countByCategory,
  type LibraryIndex,
  type LibraryQuery,
} from '@/core/library/query';

export interface CategoryTilesProps {
  index: LibraryIndex;
  query: LibraryQuery;
  onQueryChange: (query: LibraryQuery) => void;
}

function formatCountLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (count === 1) return '1 wskaźnik';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} wskaźniki`;
  }
  return `${count} wskaźników`;
}

export function CategoryTiles({ index, query, onQueryChange }: CategoryTilesProps) {
  const counts = countByCategory(index, query);
  const activeCat = query.cat && query.cat.trim() !== '' ? query.cat : null;
  const subCategories = childCategories(index, activeCat);
  const path = activeCat ? categoryPath(index, activeCat) : [];

  return (
    <div data-testid="category-tiles" className="space-y-4">
      {activeCat && (
        <nav aria-label="Ścieżka kategorii" className="flex items-center">
          <ol className="flex flex-wrap items-center gap-1 text-sm">
            <li>
              <button
                type="button"
                onClick={() => onQueryChange({ ...query, cat: null })}
                className="min-h-[44px] min-w-[44px] px-2 py-1 inline-flex items-center text-tusz hover:underline underline-offset-4 cursor-pointer rounded-none border border-transparent font-medium transition-colors focus-visible:outline-2 focus-visible:outline-tusz focus-visible:outline-offset-2"
              >
                Wszystkie
              </button>
            </li>
            {path.map((item, idx) => {
              const isLast = idx === path.length - 1;
              return (
                <li key={item.id} className="flex items-center">
                  <span aria-hidden="true" className="text-olowek select-none px-1">
                    ›
                  </span>
                  <button
                    type="button"
                    {...(isLast ? { 'aria-current': 'page' } : {})}
                    onClick={() => onQueryChange({ ...query, cat: item.id })}
                    className={`min-h-[44px] min-w-[44px] px-2 py-1 inline-flex items-center hover:underline underline-offset-4 cursor-pointer rounded-none border border-transparent transition-colors focus-visible:outline-2 focus-visible:outline-tusz focus-visible:outline-offset-2 ${
                      isLast ? 'font-bold text-tusz' : 'font-medium text-tusz'
                    }`}
                  >
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {subCategories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {subCategories.map((cat) => {
            const count = counts[cat.id] ?? 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onQueryChange({ ...query, cat: cat.id })}
                className="min-h-[44px] min-w-[44px] p-3 text-left border border-linia bg-arkusz hover:bg-linia/20 active:bg-linia/30 transition-colors cursor-pointer flex flex-col justify-between rounded-none focus-visible:outline-2 focus-visible:outline-tusz focus-visible:outline-offset-2 group"
              >
                <span className="font-semibold text-sm text-tusz leading-snug group-hover:underline decoration-tusz">
                  {cat.name}
                </span>
                <span className="text-xs text-olowek mt-2 font-normal">
                  {formatCountLabel(count)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
