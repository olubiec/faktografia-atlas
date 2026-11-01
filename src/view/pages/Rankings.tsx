import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { loadAdminTopo, loadUnits } from '@/core/data/load-atlas-data';
import { loadIndicatorValues } from '@/core/data/load-values';
import { rankUnits, topBottom, type RankedUnit } from '@/core/ranking/ranking';
import { buildChoropleth } from '@/core/map/choropleth';
import { classColorToken } from '@/core/map/classes';
import { mapShapes } from '@/core/share/map-shapes';
import { loadGeoData } from '@/view/map/layers/admin';
import { formatValue } from '@/core/format/number';
import { unitLabel } from '@/core/units/label';
import type { Indicator, IndicatorValues } from '@/core/profile/profile';
import type { Unit, UnitLevel } from '@/core/units/types';
import { SiteLayout } from '@/view/layout/SiteLayout';
import { Icon } from '@/view/ui/Icon';
import { Search } from 'iconoir-react';
import { cn } from '@/lib/utils';
import indicatorsData from '../../../config/indicators.json';

const indicators = indicatorsData as Indicator[];

export function Rankings() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filtry z URL lub domyślne
  const initialIndicatorId = searchParams.get('i') || 'density';
  const initialLevel = (searchParams.get('l') as UnitLevel) || 'pow';
  const initialYearParam = searchParams.get('y') ? Number(searchParams.get('y')) : null;

  const [selectedGroup, setSelectedGroup] = useState<string>('Wszystkie');
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>(initialIndicatorId);
  const [selectedLevel, setSelectedLevel] = useState<UnitLevel>(initialLevel);
  const [selectedYear, setSelectedYear] = useState<number | null>(initialYearParam);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTeryt, setSelectedTeryt] = useState<string | null>(null);

  // Stan wczytanych danych
  const [units, setUnits] = useState<Unit[]>([]);
  const [topoData, setTopoData] = useState<any>(null);
  const [indicatorValues, setIndicatorValues] = useState<IndicatorValues | null>(null);
  const [loadedIndicatorId, setLoadedIndicatorId] = useState<string | null>(null);

  // Grupy wskaźników
  const groups = useMemo(() => {
    const set = new Set<string>();
    indicators.forEach((ind) => {
      if (ind.group) set.add(ind.group);
    });
    return ['Wszystkie', ...Array.from(set)];
  }, []);

  // Wskaźniki w wybranej grupie
  const filteredIndicators = useMemo(() => {
    if (selectedGroup === 'Wszystkie') return indicators;
    return indicators.filter((ind) => ind.group === selectedGroup);
  }, [selectedGroup]);

  // Aktualny wskaźnik
  const currentIndicator = useMemo(() => {
    return (
      indicators.find((ind) => ind.id === selectedIndicatorId) ||
      indicators[0]
    );
  }, [selectedIndicatorId]);

  // Wczytywanie jednostek i topo
  useEffect(() => {
    let cancelled = false;
    Promise.all([loadUnits(), loadAdminTopo()]).then(([u, topo]) => {
      if (!cancelled) {
        setUnits(u);
        setTopoData(topo);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Wczytywanie wartości dla wskaźnika
  useEffect(() => {
    let cancelled = false;
    loadIndicatorValues(currentIndicator.id).then((vals) => {
      if (!cancelled) {
        setIndicatorValues(vals);
        setLoadedIndicatorId(currentIndicator.id);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [currentIndicator.id]);

  const isLoading = loadedIndicatorId !== currentIndicator.id;

  // Lata dla wskaźnika
  const availableYears = useMemo(() => {
    return indicatorValues?.years ?? [];
  }, [indicatorValues]);

  // Synchronizacja wybranego roku
  const activeYear = useMemo(() => {
    if (availableYears.length === 0) return null;
    if (selectedYear !== null && availableYears.includes(selectedYear)) {
      return selectedYear;
    }
    return availableYears[availableYears.length - 1];
  }, [availableYears, selectedYear]);

  // Obsługa zmiany wskaźnika
  const handleIndicatorChange = (newId: string) => {
    setSelectedIndicatorId(newId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('i', newId);
      return next;
    });
  };

  // Obsługa zmiany poziomu
  const handleLevelChange = (newLevel: UnitLevel) => {
    setSelectedLevel(newLevel);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('l', newLevel);
      return next;
    });
  };

  // Obsługa zmiany roku
  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('y', String(newYear));
      return next;
    });
  };

  // Mapa jednostek po TERYT
  const unitMap = useMemo(() => {
    const map = new Map<string, Unit>();
    units.forEach((u) => map.set(u.teryt, u));
    return map;
  }, [units]);

  // Obliczenie rankingu
  const rankedResult = useMemo(() => {
    if (!indicatorValues || activeYear === null || units.length === 0) {
      return [] as RankedUnit[];
    }
    const res = rankUnits({
      values: indicatorValues,
      units,
      level: selectedLevel,
      year: activeYear,
      higherIsBetter: currentIndicator.higherIsBetter,
    });

    return res.items.map((item) => {
      const u = unitMap.get(item.teryt);
      return {
        ...item,
        name: u ? unitLabel(u, { short: true }) : item.name,
      };
    });
  }, [indicatorValues, activeYear, units, selectedLevel, currentIndicator.higherIsBetter, unitMap]);

  // Mediana
  const median = useMemo(() => {
    if (rankedResult.length === 0) return null;
    const sorted = [...rankedResult].map((r) => r.value).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }, [rankedResult]);

  // Najwyżej i najniżej (top / bottom 10)
  const { top, bottom } = useMemo(() => {
    return topBottom(rankedResult, 10);
  }, [rankedResult]);

  // Choroplet i rozkład 5 klas
  const choropleth = useMemo(() => {
    if (!indicatorValues || activeYear === null || units.length === 0) return null;
    return buildChoropleth({
      values: indicatorValues,
      units,
      level: selectedLevel,
      year: activeYear,
      n: 5,
    });
  }, [indicatorValues, activeYear, units, selectedLevel]);

  // Zliczenie rozkładu klas
  const classDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    let noDataCount = 0;
    if (!choropleth) return { counts, noDataCount };

    rankedResult.forEach((item) => {
      const cls = choropleth.classByTeryt[item.teryt];
      if (typeof cls === 'number' && cls >= 0 && cls < 5) {
        counts[cls]++;
      } else {
        noDataCount++;
      }
    });

    return { counts, noDataCount };
  }, [rankedResult, choropleth]);

  // Cechy GeoJSON dla mini-mapy
  const geoFeatures = useMemo(() => {
    if (!topoData) return [];
    const { wojFeatures, powFeatures } = loadGeoData(topoData);
    if (selectedLevel === 'woj') {
      return wojFeatures.features;
    }
    return powFeatures.features;
  }, [topoData, selectedLevel]);

  // Kształty mini-mapy SVG
  const shapesResult = useMemo(() => {
    if (geoFeatures.length === 0) return null;
    return mapShapes(geoFeatures, {
      box: { x: 0, y: 0, width: 360, height: 280 },
      padding: 8,
      classOf: (teryt) => {
        const cls = choropleth?.classByTeryt?.[teryt];
        if (typeof cls === 'number' && cls >= 0 && cls <= 4) {
          return cls as 0 | 1 | 2 | 3 | 4;
        }
        return 'noData';
      },
      selected: (teryt) => teryt === selectedTeryt,
    });
  }, [geoFeatures, choropleth, selectedTeryt]);

  // Filtrowanie rankingu po wyszukiwaniu
  const displayedUnits = useMemo(() => {
    if (!searchFilter.trim()) return rankedResult;
    const q = searchFilter.toLowerCase().trim();
    return rankedResult.filter(
      (item) => item.name.toLowerCase().includes(q) || item.teryt.includes(q)
    );
  }, [rankedResult, searchFilter]);

  const scheme = choropleth?.scheme ?? 'sequential';

  return (
    <SiteLayout
      meta={{
        title: `Rankingi: ${currentIndicator.name} | Faktografia Atlas`,
        description: `Pełny ranking jednostek w Polsce dla wskaźnika ${currentIndicator.name} (${activeYear ?? ''}). Mediana, najwyżej, najniżej i mapa.`,
      }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8"
    >
      {/* Nagłówek strony */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-tusz mb-2">
          Rankingi jednostek samorządu
        </h1>
        <p className="text-sm text-olowek max-w-3xl">
          Zestawienie gmin, powiatów i województw w Polsce na podstawie zweryfikowanych danych GUS.
          Wybierz dział, wskaźnik oraz poziom terytorialny.
        </p>
      </div>

      {/* Panel filtrów */}
      <section
        aria-label="Filtry rankingu"
        className="p-4 sm:p-6 bg-arkusz border border-linia grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Dział tematyczny */}
        <div>
          <label htmlFor="group-select" className="block text-xs font-semibold text-olowek mb-1.5 uppercase">
            Dział
          </label>
          <select
            id="group-select"
            aria-label="Wybierz dział"
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              const group = e.target.value;
              const matching =
                group === 'Wszystkie'
                  ? indicators
                  : indicators.filter((i) => i.group === group);
              if (matching.length > 0 && !matching.some((m) => m.id === selectedIndicatorId)) {
                handleIndicatorChange(matching[0].id);
              }
            }}
            className="w-full min-h-[44px] px-3 py-2 border border-linia bg-kalka text-tusz text-sm rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
          >
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Wskaźnik */}
        <div>
          <label htmlFor="indicator-select" className="block text-xs font-semibold text-olowek mb-1.5 uppercase">
            Wskaźnik
          </label>
          <select
            id="indicator-select"
            aria-label="Wybierz wskaźnik"
            value={selectedIndicatorId}
            onChange={(e) => handleIndicatorChange(e.target.value)}
            className="w-full min-h-[44px] px-3 py-2 border border-linia bg-kalka text-tusz text-sm rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
          >
            {filteredIndicators.map((ind) => (
              <option key={ind.id} value={ind.id}>
                {ind.name}
              </option>
            ))}
          </select>
        </div>

        {/* Poziom */}
        <div>
          <label className="block text-xs font-semibold text-olowek mb-1.5 uppercase">
            Poziom
          </label>
          <div className="flex border border-linia divide-x divide-linia min-h-[44px]">
            <button
              type="button"
              onClick={() => handleLevelChange('woj')}
              className={cn(
                'flex-1 text-xs font-semibold px-2 min-h-[44px] flex items-center justify-center cursor-pointer transition-colors rounded-none',
                selectedLevel === 'woj' ? 'bg-tusz text-arkusz' : 'bg-kalka text-tusz hover:bg-linia/20'
              )}
            >
              Województwa
            </button>
            <button
              type="button"
              onClick={() => handleLevelChange('pow')}
              className={cn(
                'flex-1 text-xs font-semibold px-2 min-h-[44px] flex items-center justify-center cursor-pointer transition-colors rounded-none',
                selectedLevel === 'pow' ? 'bg-tusz text-arkusz' : 'bg-kalka text-tusz hover:bg-linia/20'
              )}
            >
              Powiaty
            </button>
            <button
              type="button"
              onClick={() => handleLevelChange('gmi')}
              className={cn(
                'flex-1 text-xs font-semibold px-2 min-h-[44px] flex items-center justify-center cursor-pointer transition-colors rounded-none',
                selectedLevel === 'gmi' ? 'bg-tusz text-arkusz' : 'bg-kalka text-tusz hover:bg-linia/20'
              )}
            >
              Gminy
            </button>
          </div>
        </div>

        {/* Rok */}
        <div>
          <label htmlFor="year-select" className="block text-xs font-semibold text-olowek mb-1.5 uppercase">
            Rok
          </label>
          <select
            id="year-select"
            aria-label="Wybierz rok"
            value={activeYear ?? ''}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            disabled={availableYears.length === 0}
            className="w-full min-h-[44px] px-3 py-2 border border-linia bg-kalka text-tusz text-sm rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Podsumowanie mediany i statystyk */}
      <section
        aria-label="Podsumowanie wskaźnika"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="p-4 bg-arkusz border border-linia flex flex-col justify-between">
          <span className="text-xs text-olowek uppercase font-medium">Mediana</span>
          <div className="mt-2 text-2xl font-bold font-mono text-tusz">
            {median !== null ? formatValue(median, currentIndicator.unit) : '–'}
          </div>
          <span className="text-xs text-olowek mt-1">wartość środkowa</span>
        </div>

        <div className="p-4 bg-arkusz border border-linia flex flex-col justify-between">
          <span className="text-xs text-olowek uppercase font-medium">Najwyżej (1. miejsce)</span>
          <div className="mt-2 text-xl font-bold font-mono text-tusz truncate">
            {top[0] ? formatValue(top[0].value, currentIndicator.unit) : '–'}
          </div>
          <span className="text-xs text-olowek mt-1 truncate">{top[0]?.name ?? '–'}</span>
        </div>

        <div className="p-4 bg-arkusz border border-linia flex flex-col justify-between">
          <span className="text-xs text-olowek uppercase font-medium">Najniżej ({rankedResult.length}. miejsce)</span>
          <div className="mt-2 text-xl font-bold font-mono text-tusz truncate">
            {bottom.length > 0 ? formatValue(bottom[bottom.length - 1].value, currentIndicator.unit) : '–'}
          </div>
          <span className="text-xs text-olowek mt-1 truncate">{bottom[bottom.length - 1]?.name ?? '–'}</span>
        </div>

        <div className="p-4 bg-arkusz border border-linia flex flex-col justify-between">
          <span className="text-xs text-olowek uppercase font-medium">Liczba jednostek</span>
          <div className="mt-2 text-2xl font-bold font-mono text-tusz">
            {rankedResult.length}
          </div>
          <span className="text-xs text-olowek mt-1">z danymi w {activeYear} r.</span>
        </div>
      </section>

      {/* Rozkład 5 klas */}
      <section
        aria-label="Rozkład 5 klas"
        className="p-4 sm:p-6 bg-arkusz border border-linia space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-tusz uppercase">
            Rozkład 5 klas (kwantyle)
          </h2>
          <span className="text-xs text-olowek">
            Podział jednostek na 5 równolicznych grup
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
          {[0, 1, 2, 3, 4].map((clsIdx) => {
            const count = classDistribution.counts[clsIdx];
            const token = classColorToken(clsIdx, 5, scheme);
            return (
              <div
                key={clsIdx}
                className="p-3 border border-linia flex flex-col gap-1.5 bg-kalka"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 shrink-0 border border-linia inline-block"
                    style={{ backgroundColor: `var(${token})` }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold text-tusz">
                    Klasa {clsIdx + 1}
                  </span>
                </div>
                <div className="text-base font-bold font-mono text-tusz">
                  {count} <span className="text-xs font-normal text-olowek">jedn.</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sekcja Najwyżej / Najniżej */}
      <section
        aria-label="Najwyżej i najniżej"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Najwyżej */}
        <div className="p-4 sm:p-6 bg-arkusz border border-linia space-y-3">
          <h2 className="text-sm font-bold text-tusz uppercase border-b border-linia pb-2">
            Najwyżej (Top 10)
          </h2>
          <ol className="divide-y divide-linia list-none p-0 m-0">
            {top.map((item) => (
              <li
                key={item.teryt}
                className={cn(
                  'py-2 flex items-center justify-between gap-2 text-xs',
                  item.teryt === selectedTeryt ? 'bg-kalka font-bold' : ''
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-olowek w-6 shrink-0 text-right">
                    {item.rank}.
                  </span>
                  <Link
                    to={`/?u=${item.teryt}`}
                    className="hover:underline text-tusz truncate font-medium min-h-[44px] flex items-center"
                  >
                    {item.name}
                  </Link>
                </div>
                <span className="font-mono font-bold text-tusz shrink-0">
                  {formatValue(item.value, currentIndicator.unit)}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Najniżej */}
        <div className="p-4 sm:p-6 bg-arkusz border border-linia space-y-3">
          <h2 className="text-sm font-bold text-tusz uppercase border-b border-linia pb-2">
            Najniżej (Top 10)
          </h2>
          <ol className="divide-y divide-linia list-none p-0 m-0">
            {bottom.map((item) => (
              <li
                key={item.teryt}
                className={cn(
                  'py-2 flex items-center justify-between gap-2 text-xs',
                  item.teryt === selectedTeryt ? 'bg-kalka font-bold' : ''
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-olowek w-6 shrink-0 text-right">
                    {item.rank}.
                  </span>
                  <Link
                    to={`/?u=${item.teryt}`}
                    className="hover:underline text-tusz truncate font-medium min-h-[44px] flex items-center"
                  >
                    {item.name}
                  </Link>
                </div>
                <span className="font-mono font-bold text-tusz shrink-0">
                  {formatValue(item.value, currentIndicator.unit)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Główna sekcja: Lista jednostek z wyszukiwarką + Mini-mapa SVG */}
      <section
        aria-label="Pełna lista i mini-mapa"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* Kolumna listy jednostek (7 kolumn na lg) */}
        <div className="lg:col-span-7 bg-arkusz border border-linia p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-tusz">
                Lista jednostek ({displayedUnits.length})
              </h2>
              <span className="text-xs text-olowek">
                Wyszukaj i wybierz jednostkę, aby podświetlić ją na mapie
              </span>
            </div>

            {/* Szukaj jednostki */}
            <div className="relative w-full sm:w-64">
              <input
                type="search"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Szukaj jednostki..."
                aria-label="Szukaj jednostki"
                className="w-full min-h-[44px] pl-9 pr-3 py-2 border border-linia bg-kalka text-tusz text-xs rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
              />
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-olowek pointer-events-none">
                <Icon icon={Search} size={16} aria-hidden={true} />
              </div>
            </div>
          </div>

          {/* Tabela rankingu */}
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto border border-linia">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-arkusz border-b border-linia z-10 text-olowek">
                <tr>
                  <th scope="col" className="py-2.5 px-3 font-semibold w-12 text-right">
                    #
                  </th>
                  <th scope="col" className="py-2.5 px-3 font-semibold">
                    Jednostka
                  </th>
                  <th scope="col" className="py-2.5 px-3 font-semibold text-right">
                    Wartość
                  </th>
                  <th scope="col" className="py-2.5 px-3 font-semibold text-right">
                    Akcja
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linia">
                {displayedUnits.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-olowek">
                      Brak jednostek pasujących do zapytania.
                    </td>
                  </tr>
                ) : (
                  displayedUnits.map((item) => {
                    const isSelected = item.teryt === selectedTeryt;
                    return (
                      <tr
                        key={item.teryt}
                        onClick={() => setSelectedTeryt(item.teryt)}
                        className={cn(
                          'cursor-pointer transition-colors',
                          isSelected
                            ? 'bg-linia/30 font-bold'
                            : 'hover:bg-kalka/80'
                        )}
                      >
                        <td className="py-2.5 px-3 font-mono text-olowek text-right">
                          {item.rank}
                        </td>
                        <td className="py-2.5 px-3 text-tusz font-medium">
                          {item.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-right text-tusz font-semibold tabular-nums">
                          {formatValue(item.value, currentIndicator.unit)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Link
                            to={`/?u=${item.teryt}`}
                            className="text-xs hover:underline text-korekta-tekst min-h-[44px] inline-flex items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Profil
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolumna mini-mapy SVG (5 kolumn na lg) */}
        <div className="lg:col-span-5 bg-arkusz border border-linia p-4 sm:p-6 space-y-4 sticky top-4">
          <div>
            <h2 className="text-base font-bold text-tusz">
              Rozkład przestrzenny
            </h2>
            <span className="text-xs text-olowek">
              Mini-mapa Polski według 5 klas wskaźnika
            </span>
          </div>

          <div
            className="w-full flex items-center justify-center p-2 border border-linia bg-kalka min-h-[300px]"
            data-slot="mini-map-container"
          >
            {shapesResult ? (
              <svg
                viewBox="0 0 360 280"
                className="w-full h-auto max-h-[320px]"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label={`Mapa przestrzenna ${currentIndicator.name}`}
              >
                {shapesResult.shapes.map((s, idx) => {
                  const isSelected = s.teryt === selectedTeryt || s.selected;
                  const fillVar =
                    s.fill === 'noData'
                      ? 'var(--no-data)'
                      : `var(${classColorToken(s.fill, 5, scheme)})`;

                  return (
                    <path
                      key={s.teryt || `s-${idx}`}
                      d={s.d}
                      fill={fillVar}
                      stroke={isSelected ? 'var(--korekta)' : 'var(--arkusz)'}
                      strokeWidth={isSelected ? 2.5 : 0.5}
                      data-selected={isSelected ? 'true' : undefined}
                      data-teryt={s.teryt}
                      onClick={() => setSelectedTeryt(s.teryt)}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  );
                })}
                {shapesResult.outline && (
                  <path
                    d={shapesResult.outline}
                    fill="none"
                    stroke="var(--tusz)"
                    strokeWidth={1}
                  />
                )}
              </svg>
            ) : (
              <div className="text-xs text-olowek animate-pulse">
                {isLoading ? 'Wczytuję dane mapy…' : 'Brak danych przestrzennych'}
              </div>
            )}
          </div>

          {/* Podgląd wybranej jednostki na mapie */}
          {selectedTeryt && (
            <div className="p-3 border border-linia bg-kalka flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-tusz">
                  {unitMap.get(selectedTeryt)?.name ?? `TERYT ${selectedTeryt}`}
                </div>
                <div className="text-xs font-mono text-olowek">
                  {(() => {
                    const item = rankedResult.find((r) => r.teryt === selectedTeryt);
                    return item
                      ? `${item.rank}. miejsce (${formatValue(item.value, currentIndicator.unit)})`
                      : 'Brak danych w tym roku';
                  })()}
                </div>
              </div>
              <Link
                to={`/?u=${selectedTeryt}`}
                className="px-3 py-1.5 border border-linia bg-arkusz hover:bg-linia/20 text-xs font-semibold text-tusz min-h-[44px] flex items-center justify-center rounded-none"
              >
                Otwórz profil
              </Link>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
