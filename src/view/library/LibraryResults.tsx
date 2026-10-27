import { useState } from 'react';
import { Link } from 'react-router';
import { categoryPath, filterVars, type LibraryIndex, type LibraryQuery, type LibraryVariable } from '@/core/library/query';
import { Button } from '@/components/ui/button';

export interface LibraryResultsProps {
  index: LibraryIndex;
  query: LibraryQuery;
  onQueryChange?: (query: LibraryQuery) => void;
}

function getCategoryPathLabel(index: LibraryIndex, v: LibraryVariable): string {
  const catId = v.cat ?? v.categoryId ?? v.subjectId;
  if (!catId) return '';
  const pathObjs = categoryPath(index, String(catId));
  if (pathObjs.length > 0) {
    return pathObjs.map((c) => c.name).join(' › ');
  }
  return String(v.cat ?? '');
}

function getLevelLabel(v: LibraryVariable): string {
  if (v.levels && Array.isArray(v.levels)) {
    if (v.levels.includes(6)) return 'gminy i powiaty';
    if (v.levels.includes(5)) return 'powiaty';
  }
  const levelNum = Number(v.level);
  if (levelNum === 6) return 'gminy i powiaty';
  if (levelNum === 5) return 'powiaty';
  return 'powiaty';
}

function isVariableReady(v: LibraryVariable): boolean {
  return v.has === 1 || v.has === true || v.hasReady === true;
}

export function LibraryResults({
  index,
  query,
  onQueryChange: _onQueryChange,
}: LibraryResultsProps) {
  const [limit, setLimit] = useState(50);
  const [prevQuery, setPrevQuery] = useState(query);
  const [prevIndex, setPrevIndex] = useState(index);

  if (prevQuery !== query || prevIndex !== index) {
    setPrevQuery(query);
    setPrevIndex(index);
    setLimit(50);
  }

  const filtered = filterVars(index, query);
  const visibleVars = filtered.slice(0, limit);
  const hasMore = filtered.length > limit;

  if (filtered.length === 0) {
    return (
      <div
        data-testid="library-results"
        className="py-12 px-4 text-center text-olowek text-sm bg-arkusz border border-linia"
      >
        Brak wyników. Spróbuj innego słowa albo zdejmij filtry.
      </div>
    );
  }

  return (
    <div data-testid="library-results" className="space-y-4">
      <div className="text-xs text-olowek px-1">
        {`Pokazano ${visibleVars.length} z ${filtered.length} wyników`}
      </div>
      <ul className="space-y-3 p-0 m-0 list-none" role="list">
        {visibleVars.map((v) => {
          const categoryPathStr = getCategoryPathLabel(index, v);
          const levelStr = getLevelLabel(v);
          const ready = isVariableReady(v);

          return (
            <li key={v.id}>
              <Link
                to={`/biblioteka/${v.id}`}
                className="block p-4 bg-arkusz border border-linia hover:border-tusz transition-colors text-tusz no-underline min-h-[44px] focus-visible:outline-2 focus-visible:outline-tusz focus-visible:outline-offset-2"
              >
                <div className="flex flex-col gap-2">
                  {categoryPathStr && (
                    <div className="text-xs font-medium text-olowek break-words">
                      {categoryPathStr}
                    </div>
                  )}
                  <div className="text-base font-bold text-tusz leading-snug break-words">
                    {v.name}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-olowek pt-1 border-t border-linia/50">
                    {v.unit && (
                      <span>
                        {`Jednostka: ${v.unit}`}
                      </span>
                    )}
                    <span>
                      {`Poziom: ${levelStr}`}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border ${
                        ready
                          ? 'bg-tusz/5 text-tusz border-linia'
                          : 'bg-kalka text-olowek border-linia'
                      }`}
                    >
                      {ready ? 'można przeglądać' : 'jeszcze niepobrane'}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {hasMore && (
        <div className="pt-2 text-center">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setLimit((prev) => prev + 50)}
            className="min-h-[44px] min-w-[44px] px-6"
          >
            Pokaż więcej
          </Button>
        </div>
      )}
    </div>
  );
}
