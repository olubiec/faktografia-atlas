import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { prepareLibraryIndex } from '@/core/library/index-contract';
import { loadLibraryIndex, resetLibraryCache } from '@/core/library/load-library';
import { type LibraryIndex, type LibraryQuery } from '@/core/library/query';
import { Header } from '../Header';
import { CategoryTiles } from '../library/CategoryTiles';
import { LibraryFilters } from '../library/LibraryFilters';
import { LibraryResults } from '../library/LibraryResults';
import { LibrarySearchBar } from '../library/LibrarySearchBar';
import { SiteFooter } from '../layout/SiteFooter';

type PageStatus = 'loading' | 'error' | 'empty' | 'ready';

const POPULAR_SEARCHES = ['Ludność', 'Bezrobocie', 'Wynagrodzenie', 'Mieszkania'] as const;

function parseQueryFromParams(params: URLSearchParams): LibraryQuery {
  const k = params.get('k');
  const q = params.get('q');
  const l = params.get('l');
  const j = params.get('j');
  const p = params.get('p');

  return {
    cat: k && k.trim() !== '' ? k : null,
    text: q ?? '',
    level: l === '5' ? 5 : l === '6' ? 6 : null,
    unit: j && j.trim() !== '' ? j : null,
    onlyReady: p === '1' || p === 'true',
  };
}

export function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = useMemo(() => parseQueryFromParams(searchParams), [searchParams]);
  const [status, setStatus] = useState<PageStatus>('loading');
  const [index, setIndex] = useState<LibraryIndex | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus('loading');
      let networkError = false;

      const customFetch: typeof fetch = async (...args) => {
        try {
          return await fetch(...args);
        } catch (err) {
          networkError = true;
          throw err;
        }
      };

      try {
        const rawData = await loadLibraryIndex(customFetch);
        if (cancelled) return;

        if (!rawData) {
          setStatus(networkError ? 'error' : 'empty');
          setIndex(null);
          return;
        }

        const prepared = prepareLibraryIndex(rawData) ?? (rawData as LibraryIndex);
        if (
          prepared &&
          (Array.isArray(prepared.variables)
            ? prepared.variables.length > 0
            : Object.keys(prepared.variables || {}).length > 0)
        ) {
          setIndex(prepared);
          setStatus('ready');
        } else {
          setStatus('empty');
          setIndex(null);
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
          setIndex(null);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const handleRetry = () => {
    resetLibraryCache();
    setRetryCount((prev) => prev + 1);
  };

  const handleQueryChange = (newQuery: LibraryQuery) => {
    const nextParams = new URLSearchParams(searchParams);

    if (newQuery.cat) {
      nextParams.set('k', newQuery.cat);
    } else {
      nextParams.delete('k');
    }

    if (newQuery.text) {
      nextParams.set('q', newQuery.text);
    } else {
      nextParams.delete('q');
    }

    if (newQuery.level === 5 || newQuery.level === 6) {
      nextParams.set('l', String(newQuery.level));
    } else {
      nextParams.delete('l');
    }

    if (newQuery.unit) {
      nextParams.set('j', newQuery.unit);
    } else {
      nextParams.delete('j');
    }

    if (newQuery.onlyReady) {
      nextParams.set('p', '1');
    } else {
      nextParams.delete('p');
    }

    setSearchParams(nextParams);
  };

  const handlePick = (id: string | number) => {
    navigate(`/biblioteka/${id}`);
  };

  const allVars = index
    ? Array.isArray(index.variables)
      ? index.variables
      : Object.values(index.variables || {})
    : [];

  const totalCount = allVars.length;
  const readyCount = allVars.filter(
    (v) => v.has === 1 || v.has === true || v.hasReady === true
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-kalka text-tusz">
      <Header />
      <main className="flex-grow p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-[800] leading-[1.05] tracking-[-0.02em]">
            Biblioteka wskaźników GUS
          </h1>
          {status === 'ready' && (
            <p className="text-sm font-[400] text-olowek leading-[1.6]">
              {totalCount} wskaźników GUS, z czego {readyCount} można już przeglądać
            </p>
          )}
        </header>

        {status === 'loading' && (
          <div className="py-12 text-center text-olowek text-sm" role="status">
            Ładowanie...
          </div>
        )}

        {status === 'error' && (
          <div className="py-12 text-center space-y-4">
            <p className="text-sm text-tusz">Wystąpił błąd podczas pobierania spisu biblioteki.</p>
            <button
              type="button"
              onClick={handleRetry}
              className="min-h-[44px] min-w-[44px] px-4 py-2 border border-linia bg-arkusz hover:bg-linia/20 transition-colors text-tusz text-sm font-medium cursor-pointer rounded-none inline-flex items-center justify-center"
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        {status === 'empty' && (
          <div className="py-12 text-center text-olowek text-sm">
            Biblioteka dopiero się buduje – pierwsze wskaźniki pojawią się wkrótce
          </div>
        )}

        {status === 'ready' && index && (
          <div className="flex flex-col space-y-6">
            <div className="order-4 md:order-1">
              <CategoryTiles index={index} query={query} onQueryChange={handleQueryChange} />
            </div>
            <div className="order-1 md:order-2 space-y-3">
              <LibrarySearchBar
                index={index}
                query={query}
                onQueryChange={handleQueryChange}
                onPick={handlePick}
              />
              <div data-testid="popular-searches" className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-mono text-olowek">Popularne wyszukiwania:</span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SEARCHES.map((term) => {
                    const isActive = query.text.toLowerCase() === term.toLowerCase();
                    return (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleQueryChange({ ...query, text: isActive ? '' : term })}
                        className={`min-h-[44px] px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer rounded-none inline-flex items-center justify-center ${
                          isActive
                            ? 'bg-tusz text-kalka border-tusz font-bold'
                            : 'bg-arkusz text-tusz border-linia font-normal hover:bg-linia/20'
                        }`}
                      >
                        {term}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="order-2 md:order-3">
              <LibraryFilters index={index} query={query} onQueryChange={handleQueryChange} />
            </div>
            <div className="order-3 md:order-4">
              <LibraryResults index={index} query={query} onQueryChange={handleQueryChange} />
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

export default Library;
