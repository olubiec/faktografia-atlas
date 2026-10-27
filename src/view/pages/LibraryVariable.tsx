import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { loadUnits } from '../../core/data/load-atlas-data';
import { prepareLibraryIndex } from '../../core/library/index-contract';
import {
  loadLibraryIndex,
  loadLibraryValues,
  valuesByTeryt,
  type LibraryValues,
} from '../../core/library/load-library';
import {
  categoryPath,
  type LibraryIndex,
  type LibraryVariable as LibVar,
} from '../../core/library/query';
import { rankUnits, topBottom } from '../../core/ranking/ranking';
import { unitLabel } from '../../core/units/label';
import type { Unit, UnitLevel } from '../../core/units/types';
import { cn } from '../../lib/utils';
import { Header } from '../Header';
import { DownloadCsv } from '../library/DownloadCsv';
import { OrderButton } from '../library/OrderButton';
import { RankingBars } from '../ranking/RankingBars';

type PageStatus = 'loading' | 'error' | 'not_found' | 'not_downloaded' | 'ready';

export function LibraryVariable() {
  const { id } = useParams<{ id: string }>();

  const [status, setStatus] = useState<PageStatus>('loading');
  const [index, setIndex] = useState<LibraryIndex | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [variable, setVariable] = useState<LibVar | null>(null);
  const [rawValues, setRawValues] = useState<LibraryValues | null>(null);

  const [overrideLevel, setOverrideLevel] = useState<UnitLevel | null>(null);
  const [overrideYear, setOverrideYear] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!id) {
        setStatus('not_found');
        return;
      }

      setStatus('loading');

      try {
        const [loadedUnits, rawIndex] = await Promise.all([
          loadUnits(),
          loadLibraryIndex(),
        ]);

        if (cancelled) return;
        setUnits(loadedUnits);

        if (!rawIndex) {
          setStatus('not_found');
          return;
        }

        const prepared = prepareLibraryIndex(rawIndex) ?? (rawIndex as LibraryIndex);
        setIndex(prepared);

        const vars = Array.isArray(prepared.variables)
          ? prepared.variables
          : Object.values(prepared.variables || {});

        const foundVar = vars.find((v) => String(v.id) === String(id));

        if (!foundVar) {
          setStatus('not_found');
          return;
        }

        setVariable(foundVar);

        const isReady =
          foundVar.has === 1 ||
          foundVar.has === true ||
          foundVar.hasReady === true;

        if (!isReady) {
          setStatus('not_downloaded');
          return;
        }

        const valData = await loadLibraryValues(String(id));
        if (cancelled) return;

        if (!valData) {
          setStatus('not_downloaded');
          return;
        }

        setRawValues(valData);
        setStatus('ready');
      } catch {
        if (!cancelled) {
          setStatus('error');
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const availableLevels = useMemo(() => {
    if (!rawValues) return [];
    const levels: { level: UnitLevel; label: string }[] = [];

    if (rawValues.l5 || rawValues.pow || rawValues['5']) {
      levels.push({ level: 'pow', label: 'Powiaty' });
    }
    if (rawValues.l6 || rawValues.gmi || rawValues['6']) {
      levels.push({ level: 'gmi', label: 'Gminy' });
    }
    if (rawValues.l3 || rawValues.woj || rawValues['3']) {
      levels.push({ level: 'woj', label: 'Województwa' });
    }

    if (levels.length === 0 && variable) {
      const lvl = Number(variable.level);
      if (lvl === 6) levels.push({ level: 'gmi', label: 'Gminy' });
      else if (lvl === 3) levels.push({ level: 'woj', label: 'Województwa' });
      else levels.push({ level: 'pow', label: 'Powiaty' });
    }

    return levels;
  }, [rawValues, variable]);

  const selectedLevel: UnitLevel = useMemo(() => {
    if (
      overrideLevel !== null &&
      availableLevels.some((l) => l.level === overrideLevel)
    ) {
      return overrideLevel;
    }
    return availableLevels[0]?.level ?? 'pow';
  }, [availableLevels, overrideLevel]);

  const indicatorValues = useMemo(() => {
    if (!rawValues || units.length === 0) return null;
    return valuesByTeryt(rawValues, selectedLevel, units);
  }, [rawValues, selectedLevel, units]);

  const years = useMemo(() => {
    return indicatorValues?.years ?? [];
  }, [indicatorValues]);

  const selectedYear: number | null = useMemo(() => {
    if (years.length === 0) return null;
    if (overrideYear !== null && years.includes(overrideYear)) {
      return overrideYear;
    }
    return years[years.length - 1];
  }, [years, overrideYear]);

  const pathCategories = useMemo(() => {
    if (!index || !variable || variable.cat == null) return [];
    return categoryPath(index, String(variable.cat));
  }, [index, variable]);

  const categoryPathText = useMemo(() => {
    return pathCategories.map((c) => c.name).join(' › ');
  }, [pathCategories]);

  const unitMap = useMemo(
    () => new Map(units.map((u) => [u.teryt, u])),
    [units]
  );

  const rankedItems = useMemo(() => {
    if (!indicatorValues || selectedYear === null || units.length === 0) return [];
    const result = rankUnits({
      values: indicatorValues,
      units,
      level: selectedLevel,
      year: selectedYear,
    });

    return result.items.map((item) => {
      const u = unitMap.get(item.teryt);
      return {
        ...item,
        name: u ? unitLabel(u) : item.name,
      };
    });
  }, [indicatorValues, units, selectedLevel, selectedYear, unitMap]);

  const { top, bottom } = useMemo(
    () => topBottom(rankedItems, 10),
    [rankedItems]
  );

  const levelLabel =
    selectedLevel === 'gmi'
      ? 'Gminy'
      : selectedLevel === 'pow'
      ? 'Powiaty'
      : 'Województwa';

  return (
    <div className="min-h-screen flex flex-col bg-kalka text-tusz">
      <Header />
      <main className="flex-grow p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        <div>
          <Link
            to="/biblioteka"
            className="text-xs text-olowek hover:text-tusz font-mono inline-flex items-center gap-1 min-h-[44px] px-1 py-2 focus:outline-none focus:ring-1 focus:ring-tusz"
          >
            ‹ Powrót do biblioteki
          </Link>
        </div>

        {status === 'loading' && (
          <div className="py-12 text-center text-olowek text-sm" role="status">
            Ładowanie...
          </div>
        )}

        {status === 'error' && (
          <div className="py-12 text-center space-y-4">
            <p className="text-sm text-tusz">
              Wystąpił błąd podczas wczytywania wskaźnika.
            </p>
            <Link
              to="/biblioteka"
              className="min-h-[44px] min-w-[44px] px-4 py-2 border border-linia bg-arkusz hover:bg-linia/20 transition-colors text-tusz text-sm font-medium inline-flex items-center justify-center cursor-pointer"
            >
              Powrót do biblioteki
            </Link>
          </div>
        )}

        {status === 'not_found' && (
          <div className="py-12 text-center space-y-4">
            <h2 className="text-xl font-bold text-tusz">
              Nie znaleziono wskaźnika
            </h2>
            <p className="text-sm text-olowek">
              Wskaźnik o podanym identyfikatorze nie istnieje w bibliotece.
            </p>
            <Link
              to="/biblioteka"
              className="min-h-[44px] min-w-[44px] px-4 py-2 border border-linia bg-arkusz hover:bg-linia/20 transition-colors text-tusz text-sm font-medium inline-flex items-center justify-center cursor-pointer"
            >
              Powrót do biblioteki
            </Link>
          </div>
        )}

        {status === 'not_downloaded' && variable && (
          <div className="space-y-6">
            <header className="space-y-1">
              {categoryPathText && (
                <p className="text-xs text-olowek font-mono">{categoryPathText}</p>
              )}
              <h1 className="text-2xl md:text-3xl font-[800] leading-[1.1] tracking-[-0.02em] text-tusz">
                {variable.name}
              </h1>
              {variable.unit && (
                <p className="text-xs text-olowek font-mono">
                  Jednostka: {variable.unit}
                </p>
              )}
            </header>

            <div className="bg-arkusz border border-linia p-6 space-y-4">
              <p className="text-sm font-semibold text-tusz m-0">
                Ten wskaźnik jeszcze nie został pobrany
              </p>
              <OrderButton variable={variable} />
            </div>
          </div>
        )}

        {status === 'ready' && variable && (
          <div className="space-y-6">
            <header className="space-y-1">
              {categoryPathText && (
                <p className="text-xs text-olowek font-mono">{categoryPathText}</p>
              )}
              <h1 className="text-2xl md:text-3xl font-[800] leading-[1.1] tracking-[-0.02em] text-tusz">
                {variable.name}
              </h1>
              {variable.unit && (
                <p className="text-xs text-olowek font-mono">
                  Jednostka: {variable.unit}
                </p>
              )}
            </header>

            <div className="flex flex-wrap items-center justify-between gap-4 bg-arkusz border border-linia p-4">
              <div className="flex flex-wrap items-center gap-4">
                {availableLevels.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-olowek">Poziom:</span>
                    <div className="flex border border-linia bg-arkusz">
                      {availableLevels.map((lvl) => (
                        <button
                          type="button"
                          key={lvl.level}
                          onClick={() => setOverrideLevel(lvl.level)}
                          className={cn(
                            'px-3 py-1.5 text-xs font-semibold min-h-[44px] cursor-pointer transition-colors',
                            selectedLevel === lvl.level
                              ? 'bg-tusz text-kalka'
                              : 'hover:bg-linia/20 text-tusz'
                          )}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {years.length > 0 && selectedYear !== null && (
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="year-select"
                      className="text-xs font-mono text-olowek"
                    >
                      Rok:
                    </label>
                    <select
                      id="year-select"
                      value={selectedYear}
                      onChange={(e) => setOverrideYear(Number(e.target.value))}
                      className="px-3 py-2 min-h-[44px] text-xs font-semibold bg-arkusz border border-linia text-tusz focus:outline-none focus:ring-1 focus:ring-tusz cursor-pointer"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {selectedYear !== null && (
                <DownloadCsv
                  name={variable.name}
                  unit={variable.unit}
                  level={levelLabel}
                  year={selectedYear}
                  rows={rankedItems}
                  className="min-h-[44px]"
                />
              )}
            </div>

            <section className="space-y-4">
              <h2 className="text-lg font-bold text-tusz">Ranking</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RankingBars
                  items={top}
                  unit={variable.unit}
                  title="10 najwyżej"
                  limit={10}
                />
                <RankingBars
                  items={bottom}
                  unit={variable.unit}
                  title="10 najniżej"
                  limit={10}
                />
              </div>
            </section>

            <footer className="pt-6 border-t border-linia text-xs text-olowek font-mono">
              Źródło: GUS, Bank Danych Lokalnych (CC BY 4.0)
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}

export default LibraryVariable;
