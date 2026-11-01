import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
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
      setProfileA(null);

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
      setProfileB(null);

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

        <div className="flex gap-4 mb-8">
          <div className="border p-4 flex-1">
            <h2 className="font-semibold">Miejsce A: {a || 'Wybierz'}</h2>
          </div>
          <div className="border p-4 flex-1">
            <h2 className="font-semibold">Miejsce B: {b || 'Wybierz'}</h2>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold mb-2">Gotowe pojedynki:</h3>
          <ul className="flex flex-wrap gap-2">
            <li><button onClick={() => setComparison('14', '12')} className="underline">Mazowieckie vs Małopolskie</button></li>
            <li><button onClick={() => setComparison('1465', '1261')} className="underline">Warszawa vs Kraków</button></li>
            <li><button onClick={() => setComparison('0264', '3064')} className="underline">Wrocław vs Poznań</button></li>
            <li><button onClick={() => setComparison('2261', '1061')} className="underline">Gdańsk vs Łódź</button></li>
            <li><button onClick={() => setComparison('0461', '3262')} className="underline">Bydgoszcz vs Szczecin</button></li>
            <li><button onClick={() => setComparison('0663', '1863')} className="underline">Lublin vs Rzeszów</button></li>
          </ul>
        </div>

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
