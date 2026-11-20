import { useEffect, useMemo, useState } from 'react';
import type { CompareRow } from '../../core/compare/compare';
import { compareExtraRows } from '../../core/compare/compare-extra';
import { loadAnyValues } from '../../core/indicators/load-any-values';
import { loadAvailable } from '../../core/indicators/load-available';
import { buildRegistry, isLibraryIndicatorId } from '../../core/indicators/registry';
import { useLocation, useNavigate } from 'react-router';
import { SiteLayout } from '../layout/SiteLayout';
import { loadUnits } from '../../core/data/load-atlas-data';
import { loadProfileShard, profileFromShard } from '../../core/data/load-profile';
import type { Indicator, IndicatorValues, UnitProfile } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import { readComparePair, writeCompareSearch, setA, setB, swapPair, clearSlot, type ComparePair } from '../../core/compare/compare-url';
import indicatorsData from '../../../config/indicators.json';
import { CompareMaps } from '../profile/CompareMaps';
import { ProfileCompareTable } from '../profile/ProfileCompareTable';
import { PlacePicker } from '../compare/PlacePicker';
import { CompareIndicatorPicker } from '../compare/CompareIndicatorPicker';
import { CompareShare } from './CompareShare';
import { useMyIndicators } from '../hooks/useMyIndicators';

const indicators = indicatorsData as Indicator[];

/** Gotowe porównania (TERYT jako string). */
const PRESETS: { label: string; a: string; b: string }[] = [
  { label: 'Mazowieckie vs Małopolskie', a: '14', b: '12' },
  { label: 'Warszawa vs Kraków', a: '1465', b: '1261' },
  { label: 'Wrocław vs Poznań', a: '0264', b: '3064' },
  { label: 'Gdańsk vs Łódź', a: '2261', b: '1061' },
  { label: 'Bydgoszcz vs Szczecin', a: '0461', b: '3262' },
  { label: 'Lublin vs Rzeszów', a: '0663', b: '1863' },
];

/** Profil wybranego miejsca; jedno żądanie profilu na województwo. */
function useComparedProfile(teryt: string | null, units: Unit[]): UnitProfile | null {
  const [loaded, setLoaded] = useState<UnitProfile | null>(null);
  useEffect(() => {
    if (!teryt || !units.length) return;
    let active = true;
    loadProfileShard(teryt.slice(0, 2)).then((shard) => {
      if (active) setLoaded(profileFromShard(teryt, shard, indicators, units));
    });
    return () => { active = false; };
  }, [teryt, units]);
  // Stary wynik innego miejsca nie jest pokazywany
  return teryt && loaded?.teryt === teryt ? loaded : null;
}

/** Wiersze dla wskaźników z biblioteki będących na liście: jedno pobranie na wskaźnik (QC604). */
function useLibraryRows(list: readonly string[], units: Unit[], a: UnitProfile | null, b: UnitProfile | null) {
  const [registry, setRegistry] = useState(() => buildRegistry(indicators, null));
  const [values, setValues] = useState<Record<string, IndicatorValues>>({});
  const ids = useMemo(() => list.filter(isLibraryIndicatorId), [list]);

  useEffect(() => {
    if (!ids.length) return;
    let active = true;
    loadAvailable().then((available) => {
      if (active && available) setRegistry(buildRegistry(indicators, available));
    });
    return () => { active = false; };
  }, [ids.length]);

  useEffect(() => {
    if (!units.length) return;
    let active = true;
    for (const id of ids) {
      loadAnyValues(id, { units }).then((v) => {
        if (active && v) setValues((prev) => (prev[id] ? prev : { ...prev, [id]: v }));
      });
    }
    return () => { active = false; };
  }, [ids, units]);

  const shown = useMemo(
    () => ids.map((id) => registry.byId.get(id)).filter((i): i is Indicator => !!i),
    [ids, registry],
  );
  const extraRows = useMemo(() => {
    if (!a?.unit || !b?.unit) return [] as { indicator: Indicator; row: CompareRow }[];
    const entries = shown.filter((i) => values[i.id]).map((i) => ({ indicator: i, values: values[i.id] }));
    return compareExtraRows(entries, a.unit, b.unit).map((row) => ({
      row,
      indicator: registry.byId.get(row.indicatorId)!,
    }));
  }, [shown, values, a, b, registry]);
  return { shown, extraRows };
}

export function ComparePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const pair = useMemo(() => readComparePair(location.search), [location.search]);
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    let active = true;
    loadUnits().then((u) => {
      if (active) setUnits(u);
    });
    return () => { active = false; };
  }, []);

  const { list, add, remove, reset } = useMyIndicators();
  const profileA = useComparedProfile(pair.a, units);
  const profileB = useComparedProfile(pair.b, units);
  const library = useLibraryRows(list, units, profileA, profileB);

  // Każda zmiana trafia do adresu (domyślnie replace: historia nie puchnie; gotowa para to osobny krok w historii)
  const update = (next: ComparePair, replace = true) => {
    navigate({ pathname: location.pathname, search: writeCompareSearch(next) }, { replace });
  };

  return (
    <SiteLayout>
      <div className="container mx-auto p-4 w-full text-tusz">
        <h1 className="text-2xl font-bold mb-4">Porównaj miejsca</h1>

        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <PlacePicker
              id="compare-a"
              label="Miejsce A"
              value={pair.a}
              excludeTeryt={pair.b}
              onChange={(t) => update(t ? setA(pair, t) : clearSlot(pair, 'a'))}
            />
          </div>
          <button
            type="button"
            aria-label="Zamień miejsca"
            onClick={() => update(swapPair(pair))}
            className="min-w-[44px] min-h-[44px] border border-tusz bg-arkusz text-tusz cursor-pointer"
          >
            ⇄
          </button>
          <div className="flex-1 min-w-0">
            <PlacePicker
              id="compare-b"
              label="Miejsce B"
              value={pair.b}
              excludeTeryt={pair.a}
              onChange={(t) => update(t ? setB(pair, t) : clearSlot(pair, 'b'))}
            />
          </div>
        </div>

        {pair.a && !pair.b && (
          <p role="status" className="mb-8 text-sm text-olowek">Wybierz drugie miejsce, żeby zobaczyć porównanie</p>
        )}

        <div className="mb-8">
          <h3 className="font-semibold mb-2">Gotowe porównania</h3>
          <ul className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <li key={p.label}>
                <button onClick={() => update({ a: p.a, b: p.b }, false)} className="underline min-h-[44px]">{p.label}</button>
              </li>
            ))}
          </ul>
        </div>

        {profileA && profileB && (
          <div data-testid="comparison-result">
            <h2 className="text-xl font-bold mb-4">Wynik porównania</h2>
            <CompareMaps profileA={profileA} profileB={profileB} units={units} />
            <div className="mt-4">
              <CompareIndicatorPicker items={profileA.indicators} list={list} onAdd={add} onRemove={remove} onReset={reset} libraryShown={library.shown} />
              <ProfileCompareTable
                profileA={CompareIndicatorPicker.restrictProfile(profileA, list)}
                profileB={CompareIndicatorPicker.restrictProfile(profileB, list)}
                extraRows={library.extraRows}
                onRemove={remove}
              />
            </div>
            <CompareShare pair={pair} profileA={profileA} profileB={profileB} list={list} />
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
