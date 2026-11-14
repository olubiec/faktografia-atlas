import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { SiteLayout } from '../layout/SiteLayout';
import { loadUnits } from '../../core/data/load-atlas-data';
import { loadProfileShard, profileFromShard } from '../../core/data/load-profile';
import type { UnitProfile } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import indicatorsData from '../../../config/indicators.json';
import { CompareMaps } from '../profile/CompareMaps';
import { ProfileCompareTable } from '../profile/ProfileCompareTable';
import type { Indicator } from '../../core/profile/profile';

const indicators = indicatorsData as Indicator[];

/** Trzy gotowe pary do kliknięcia (kody TERYT jako napisy). */
const COMPARE_PAIRS = [
  { a: '14', b: '12', label: 'mazowieckie i małopolskie' },
  { a: '1465', b: '1261', label: 'Warszawa i Kraków' },
  { a: '0264', b: '3064', label: 'Wrocław i Poznań' },
] as const;

const FIELD_CLASS =
  'block w-full min-h-[44px] border border-linia bg-arkusz px-3 text-base text-tusz focus-visible:outline-2 focus-visible:outline-tusz';

interface CompareEmptyStateProps {
  units: Unit[];
  a: string | null;
  b: string | null;
  onPick: (a: string, b: string) => void;
}

/** Wybór dwóch miejsc (województwa i powiaty) oraz trzy gotowe pary. */
export function CompareEmptyState({ units, a, b, onPick }: CompareEmptyStateProps) {
  const options = units.filter((u) => u.level !== 'gmi');
  // Połowicznie wybrana para żyje lokalnie; zmiana adresu odświeża komponent (key)
  const [pick, setPick] = useState({ a, b });
  const change = (which: 'a' | 'b', value: string) => {
    const next = { ...pick, [which]: value || null };
    setPick(next);
    if (next.a && next.b && next.a !== next.b) onPick(next.a, next.b);
  };
  const field = (which: 'a' | 'b', label: string, value: string | null) => (
    <div className="flex-1">
      <label htmlFor={`compare-${which}`} className="block mb-1 text-sm font-semibold">
        {label}
      </label>
      <select
        id={`compare-${which}`}
        className={FIELD_CLASS}
        value={value ?? ''}
        onChange={(e) => change(which, e.target.value)}
      >
        <option value="">Wybierz</option>
        {options.map((u) => (
          <option key={u.teryt} value={u.teryt}>
            {u.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <section className="mb-8">
      <p className="mb-4 text-base text-olowek">
        Wybierz dwa miejsca, a pokażemy, czym się różnią.
      </p>
      <div className="flex flex-col gap-3 md:flex-row md:gap-4 mb-6">
        {field('a', 'Miejsce A', pick.a)}
        {field('b', 'Miejsce B', pick.b)}
      </div>
      <h2 className="mb-2 text-sm font-semibold">Gotowe pary:</h2>
      <ul className="flex flex-col gap-2 md:flex-row md:flex-wrap">
        {COMPARE_PAIRS.map((p) => (
          <li key={p.a + p.b}>
            <Link
              data-slot="compare-pair"
              to={{ pathname: '/porownaj', search: `?c=${p.a},${p.b}` }}
              className="flex items-center min-h-[44px] px-3 border border-linia underline break-words"
            >
              {p.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const c = searchParams.get('c');
  const [a, b] = c ? c.split(',') : [null, null];

  const [units, setUnits] = useState<Unit[]>([]);
  const [profileA, setProfileA] = useState<UnitProfile | null>(null);
  const [profileB, setProfileB] = useState<UnitProfile | null>(null);

  useEffect(() => {
    let active = true;
    loadUnits().then((u) => {
      if (active) setUnits(u);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!a || !units.length) {

      return;
    }
    let active = true;
    loadProfileShard(a.slice(0, 2)).then((shard) => {
      if (active) setProfileA(profileFromShard(a, shard, indicators, units));
    });
    return () => { active = false; };
  }, [a, units]);

  useEffect(() => {
    if (!b || !units.length) {

      return;
    }
    let active = true;
    loadProfileShard(b.slice(0, 2)).then((shard) => {
      if (active) setProfileB(profileFromShard(b, shard, indicators, units));
    });
    return () => { active = false; };
  }, [b, units]);

  const setComparison = (terytA: string, terytB: string) => {
    setSearchParams({ c: `${terytA},${terytB}` });
  };

  return (
    <SiteLayout>
      <div className="container mx-auto p-4 w-full text-tusz">
        <h1 className="text-2xl font-bold mb-4">Porównaj miejsca</h1>

        <CompareEmptyState key={`${a}|${b}`} units={units} a={a} b={b} onPick={setComparison} />

        {profileA && profileB && (
          <div data-testid="comparison-result">
            <h2 className="text-xl font-bold mb-4">Wynik porównania</h2>
            <CompareMaps profileA={profileA} profileB={profileB} units={units} />
            <div className="mt-4">
              <ProfileCompareTable profileA={profileA} profileB={profileB} />
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
