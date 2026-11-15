import { useState } from 'react';
import { Link } from 'react-router';
import { categoryPath, filterVars, type LibraryIndex, type LibraryQuery, type LibraryVariable } from '@/core/library/query';
import { Button } from '@/components/ui/button';

export interface LibraryResultsProps {
  index: LibraryIndex;
  query: LibraryQuery;
  onQueryChange?: (query: LibraryQuery) => void;
  /** Ile kart na stronę (domyślnie 50; strona Biblioteki podaje 20). */
  pageSize?: number;
}

// Okruszki: pełna ścieżka (do title/aria-label) i skrócona do 2 ostatnich poziomów
function getCategoryPath(index: LibraryIndex, v: LibraryVariable): { full: string; short: string } {
  const catId = v.cat ?? v.categoryId ?? v.subjectId;
  if (!catId) return { full: '', short: '' };
  const names = categoryPath(index, String(catId)).map((c) => c.name);
  if (names.length === 0) {
    const raw = String(v.cat ?? '');
    return { full: raw, short: raw };
  }
  return { full: names.join(' › '), short: names.slice(-2).join(' › ') };
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
  onQueryChange,
  pageSize = 50,
}: LibraryResultsProps) {
  const [limit, setLimit] = useState(pageSize);
  const [prevQuery, setPrevQuery] = useState(query);
  const [prevIndex, setPrevIndex] = useState(index);

  if (prevQuery !== query || prevIndex !== index) {
    setPrevQuery(query);
    setPrevIndex(index);
    setLimit(pageSize);
  }

  const filtered = filterVars(index, query);
  const visibleVars = filtered.slice(0, limit);
  const hasMore = filtered.length > limit;

  // Przełącznik „tylko z danymi” ↔ „wszystkie”; liczba wszystkich w formacie pl-PL
  const allCount = query.onlyReady ? filterVars(index, { ...query, onlyReady: false }).length : 0;
  const toggle =
    onQueryChange && query.onlyReady ? (
      <Button
        type="button"
        variant="secondary"
        onClick={() => onQueryChange({ ...query, onlyReady: false })}
        className="min-h-[44px] min-w-[44px] px-4"
      >
        {`Pokaż wszystkie (${new Intl.NumberFormat('pl-PL').format(allCount)})`}
      </Button>
    ) : null;

  if (filtered.length === 0) {
    return (
      <div
        data-testid="library-results"
        className="py-12 px-4 text-center text-olowek text-sm bg-arkusz border border-linia space-y-4"
      >
        <p className="m-0">Brak wyników. Spróbuj innego słowa albo zdejmij filtry.</p>
        {toggle && allCount > 0 && (
          <div className="space-y-2">
            <p className="m-0">Są pozycje jeszcze bez pobranych danych.</p>
            {toggle}
          </div>
        )}
      </div>
    );
  }

  return (
    <div data-testid="library-results" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="text-xs text-olowek">
          {`Pokazano ${visibleVars.length} z ${filtered.length} wyników`}
        </div>
        {toggle}
      </div>
      <ul className="space-y-3 p-0 m-0 list-none" role="list">
        {visibleVars.map((v) => {
          const crumbs = getCategoryPath(index, v);
          const levelStr = getLevelLabel(v);
          const ready = isVariableReady(v);

          return (
            <li key={v.id}>
              <Link
                to={`/biblioteka/${v.id}`}
                className="block p-4 bg-arkusz border border-linia hover:border-tusz transition-colors text-tusz no-underline min-h-[44px] focus-visible:outline-2 focus-visible:outline-tusz focus-visible:outline-offset-2"
              >
                <div className="flex flex-col gap-2">
                  {crumbs.short && (
                    <div
                      className="text-xs font-medium text-olowek break-words"
                      title={crumbs.full}
                      aria-label={crumbs.full}
                    >
                      {crumbs.short}
                    </div>
                  )}
                  <div className="text-base font-bold text-tusz leading-snug break-words line-clamp-2">
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
                      {ready ? 'dane gotowe: można przeglądać' : 'jeszcze niepobrane'}
                    </span>
                  </div>
                  {!ready && (
                    <p className="m-0 text-xs text-olowek leading-normal">
                      Tych danych jeszcze nie ma w Atlasie. Zamówienie to zgłoszenie w repozytorium
                      projektu – nie musisz znać GitHuba, wystarczy otworzyć wskaźnik i kliknąć
                      „Zamów ten wskaźnik”.
                    </p>
                  )}
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
            onClick={() => setLimit((prev) => prev + pageSize)}
            className="min-h-[44px] min-w-[44px] px-6"
          >
            Pokaż więcej
          </Button>
        </div>
      )}
    </div>
  );
}
