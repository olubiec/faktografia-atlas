import { useMemo } from 'react';
import { filterVars, type LibraryIndex, type LibraryQuery } from '@/core/library/query';

export interface LibraryFiltersProps {
  index: LibraryIndex;
  query: LibraryQuery;
  onQueryChange: (query: LibraryQuery) => void;
}

export function LibraryFilters({ index, query, onQueryChange }: LibraryFiltersProps) {
  const matchingVarsForUnits = useMemo(() => {
    return filterVars(index, { ...query, unit: null });
  }, [index, query]);

  const availableUnits = useMemo(() => {
    const unitsSet = new Set<string>();
    for (let i = 0; i < matchingVarsForUnits.length; i++) {
      const u = matchingVarsForUnits[i].unit;
      if (u && u.trim() !== '') {
        unitsSet.add(u.trim());
      }
    }
    return Array.from(unitsSet).sort((a, b) => a.localeCompare(b, 'pl', { sensitivity: 'base' }));
  }, [matchingVarsForUnits]);

  const hasActiveFilters = query.level !== null || query.unit !== null || query.onlyReady;

  const handleLevelChange = (level: 5 | 6 | null) => {
    onQueryChange({ ...query, level });
  };

  const handleUnitChange = (unit: string | null) => {
    onQueryChange({ ...query, unit });
  };

  const handleOnlyReadyChange = (onlyReady: boolean) => {
    onQueryChange({ ...query, onlyReady });
  };

  const handleResetFilters = () => {
    onQueryChange({
      ...query,
      level: null,
      unit: null,
      onlyReady: false,
    });
  };

  return (
    <div
      data-testid="library-filters"
      className="p-4 bg-arkusz border border-linia rounded-none space-y-4 text-tusz"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-olowek">
          Filtry
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="min-h-[44px] min-w-[44px] px-3 py-2 text-xs font-semibold text-tusz border border-linia bg-arkusz hover:bg-linia/20 transition-colors inline-flex items-center justify-center cursor-pointer rounded-none underline underline-offset-2"
          >
            Wyczyść filtry
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-4 text-sm">
        {/* Poziom: Powiaty / Gminy */}
        <div className="space-y-1.5 flex-1 min-w-[240px]">
          <span className="block text-xs font-medium text-olowek">Poziom administracyjny</span>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Poziom administracyjny">
            <button
              type="button"
              aria-pressed={query.level === null}
              onClick={() => handleLevelChange(null)}
              className={`min-h-[44px] min-w-[44px] px-3 py-2 text-xs border transition-colors inline-flex items-center justify-center cursor-pointer rounded-none ${
                query.level === null
                  ? 'bg-tusz text-kalka border-tusz font-bold underline'
                  : 'bg-arkusz text-tusz border-linia font-normal hover:bg-linia/20'
              }`}
            >
              {query.level === null && <span className="mr-1 font-bold">✓</span>}
              Wszystkie
            </button>
            <button
              type="button"
              aria-pressed={query.level === 5}
              onClick={() => handleLevelChange(5)}
              className={`min-h-[44px] min-w-[44px] px-3 py-2 text-xs border transition-colors inline-flex items-center justify-center cursor-pointer rounded-none ${
                query.level === 5
                  ? 'bg-tusz text-kalka border-tusz font-bold underline'
                  : 'bg-arkusz text-tusz border-linia font-normal hover:bg-linia/20'
              }`}
            >
              {query.level === 5 && <span className="mr-1 font-bold">✓</span>}
              Powiaty
            </button>
            <button
              type="button"
              aria-pressed={query.level === 6}
              onClick={() => handleLevelChange(6)}
              className={`min-h-[44px] min-w-[44px] px-3 py-2 text-xs border transition-colors inline-flex items-center justify-center cursor-pointer rounded-none ${
                query.level === 6
                  ? 'bg-tusz text-kalka border-tusz font-bold underline'
                  : 'bg-arkusz text-tusz border-linia font-normal hover:bg-linia/20'
              }`}
            >
              {query.level === 6 && <span className="mr-1 font-bold">✓</span>}
              Gminy
            </button>
          </div>
        </div>

        {/* Jednostka miary */}
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label htmlFor="library-filter-unit" className="block text-xs font-medium text-olowek">
            Jednostka miary
          </label>
          <select
            id="library-filter-unit"
            value={query.unit ?? ''}
            onChange={(e) => handleUnitChange(e.target.value || null)}
            className={`min-h-[44px] w-full px-3 py-2 text-xs border bg-arkusz text-tusz rounded-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-tusz ${
              query.unit !== null
                ? 'border-tusz font-bold ring-1 ring-tusz'
                : 'border-linia font-normal'
            }`}
          >
            <option value="">Wszystkie jednostki</option>
            {availableUnits.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        {/* Tylko już pobrane */}
        <div className="flex items-center min-h-[44px] pt-4 sm:pt-0">
          <label
            htmlFor="library-filter-only-ready"
            className={`inline-flex items-center gap-2 min-h-[44px] px-3 py-2 border cursor-pointer select-none text-xs rounded-none transition-colors ${
              query.onlyReady
                ? 'border-tusz bg-tusz/10 font-bold'
                : 'border-linia bg-arkusz font-normal hover:bg-linia/20'
            }`}
          >
            <input
              type="checkbox"
              id="library-filter-only-ready"
              checked={query.onlyReady}
              onChange={(e) => handleOnlyReadyChange(e.target.checked)}
              className="w-4 h-4 min-w-[16px] cursor-pointer accent-tusz"
            />
            <span>Tylko już pobrane</span>
          </label>
        </div>
      </div>
    </div>
  );
}
