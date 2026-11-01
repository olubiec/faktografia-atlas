import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { loadUnits } from '@/core/data/load-atlas-data';
import { loadProfileShard, profileFromShard } from '@/core/data/load-profile';
import { buildProfile, type UnitProfile, type Indicator } from '@/core/profile/profile';
import { unitLabel } from '@/core/units/label';
import type { Unit } from '@/core/units/types';
import { SiteLayout } from '@/view/layout/SiteLayout';
import { CompareMaps } from '@/view/profile/CompareMaps';
import { ProfileCompareTable } from '@/view/profile/ProfileCompareTable';
import { Icon } from '@/view/ui/Icon';
import { Search, Xmark, RefreshDouble } from 'iconoir-react';
import { cn } from '@/lib/utils';
import indicatorsData from '../../../config/indicators.json';

const indicators = indicatorsData as Indicator[];

interface PresetDuel {
  id: string;
  title: string;
  desc: string;
  terytA: string;
  terytB: string;
}

const PRESET_DUELS: PresetDuel[] = [
  {
    id: 'warszawa-krakow',
    title: 'Warszawa vs Kraków',
    desc: 'Stolica i dawna stolica Polski',
    terytA: '1465',
    terytB: '1261',
  },
  {
    id: 'gdansk-wroclaw',
    title: 'Gdańsk vs Wrocław',
    desc: 'Północ nadmorska i południowy zachód',
    terytA: '2261',
    terytB: '0264',
  },
  {
    id: 'poznan-lodz',
    title: 'Poznań vs Łódź',
    desc: 'Wielkopolska i serce centralnej Polski',
    terytA: '3064',
    terytB: '1061',
  },
  {
    id: 'bieszczadzki-tatrzanski',
    title: 'Bieszczadzki vs Tatrzański',
    desc: 'Dwa kontrastowe regiony górskie',
    terytA: '1801',
    terytB: '1217',
  },
  {
    id: 'katowice-bialystok',
    title: 'Katowice vs Białystok',
    desc: 'Przemysłowy Górny Śląsk i zielone Podlasie',
    terytA: '2469',
    terytB: '2061',
  },
  {
    id: 'mazowieckie-slaskie',
    title: 'Mazowieckie vs Śląskie',
    desc: 'Dwa największe województwa w kraju',
    terytA: '14',
    terytB: '24',
  },
];

export function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Odczyt TERYT A i B bezpośrednio ze stanu URL (?c=terytA,terytB)
  const cParam = searchParams.get('c') || '';
  const [urlA, urlB] = cParam ? cParam.split(',') : ['', ''];
  const selectedTerytA = urlA || '';
  const selectedTerytB = urlB || '';

  const [units, setUnits] = useState<Unit[]>([]);
  const [loadedProfiles, setLoadedProfiles] = useState<{
    key: string;
    profileA: UnitProfile;
    profileB: UnitProfile;
  } | null>(null);

  // Wyszukiwarki dla selektora A i B
  const [queryA, setQueryA] = useState('');
  const [queryB, setQueryB] = useState('');
  const [openSuggestA, setOpenSuggestA] = useState(false);
  const [openSuggestB, setOpenSuggestB] = useState(false);

  // Wczytywanie jednostek
  useEffect(() => {
    let cancelled = false;
    loadUnits().then((u) => {
      if (!cancelled) setUnits(u);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const unitMap = useMemo(() => {
    const map = new Map<string, Unit>();
    units.forEach((u) => map.set(u.teryt, u));
    return map;
  }, [units]);

  // Wczytywanie profili jednostek A i B
  const duelKey = selectedTerytA && selectedTerytB ? `${selectedTerytA},${selectedTerytB}` : '';

  useEffect(() => {
    if (!duelKey || units.length === 0) {
      return;
    }

    let cancelled = false;
    const wojA = selectedTerytA.slice(0, 2);
    const wojB = selectedTerytB.slice(0, 2);

    Promise.all([
      loadProfileShard(wojA),
      wojA === wojB ? null : loadProfileShard(wojB),
    ])
      .then(([shardA, shardB]) => {
        if (cancelled) return;
        const actualShardB = wojA === wojB ? shardA : shardB;

        let profA = profileFromShard(selectedTerytA, shardA, indicators, units);
        let profB = profileFromShard(selectedTerytB, actualShardB, indicators, units);

        if (!profA.unit) {
          profA = buildProfile(selectedTerytA, indicators, {}, units);
        }
        if (!profB.unit) {
          profB = buildProfile(selectedTerytB, indicators, {}, units);
        }

        setLoadedProfiles({
          key: duelKey,
          profileA: profA,
          profileB: profB,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setLoadedProfiles({
            key: duelKey,
            profileA: buildProfile(selectedTerytA, indicators, {}, units),
            profileB: buildProfile(selectedTerytB, indicators, {}, units),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [duelKey, selectedTerytA, selectedTerytB, units]);

  const activeProfiles = loadedProfiles?.key === duelKey ? loadedProfiles : null;
  const profileA = activeProfiles?.profileA ?? null;
  const profileB = activeProfiles?.profileB ?? null;
  const loadingProfiles = Boolean(duelKey && !activeProfiles);

  // Wybór gotowego pojedynku
  const handleSelectDuel = (duel: PresetDuel) => {
    setQueryA('');
    setQueryB('');
    setOpenSuggestA(false);
    setOpenSuggestB(false);
    setSearchParams({ c: `${duel.terytA},${duel.terytB}` });
  };

  // Zmiana A i B miejscami
  const handleSwap = () => {
    if (!selectedTerytA && !selectedTerytB) return;
    if (selectedTerytA && selectedTerytB) {
      setSearchParams({ c: `${selectedTerytB},${selectedTerytA}` });
    } else if (selectedTerytA) {
      setSearchParams({ c: `,${selectedTerytA}` });
    } else {
      setSearchParams({ c: `${selectedTerytB},` });
    }
  };

  // Wyczyszczenie wyboru
  const handleClear = () => {
    setQueryA('');
    setQueryB('');
    setSearchParams({});
  };

  // Podpowiedzi dla jednostki A
  const suggestionsA = useMemo(() => {
    if (queryA.trim().length < 2) return [];
    const q = queryA.toLowerCase().trim();
    return units
      .filter((u) => u.name.toLowerCase().includes(q) || u.teryt.includes(q))
      .slice(0, 8);
  }, [units, queryA]);

  // Podpowiedzi dla jednostki B
  const suggestionsB = useMemo(() => {
    if (queryB.trim().length < 2) return [];
    const q = queryB.toLowerCase().trim();
    return units
      .filter((u) => u.name.toLowerCase().includes(q) || u.teryt.includes(q))
      .slice(0, 8);
  }, [units, queryB]);

  const unitA = selectedTerytA ? unitMap.get(selectedTerytA) : null;
  const unitB = selectedTerytB ? unitMap.get(selectedTerytB) : null;

  const unitAName = unitA ? unitLabel(unitA, { short: true }) : selectedTerytA;
  const unitBName = unitB ? unitLabel(unitB, { short: true }) : selectedTerytB;

  return (
    <SiteLayout
      meta={{
        title:
          unitAName && unitBName
            ? `Porównanie: ${unitAName} vs ${unitBName} | Faktografia Atlas`
            : 'Porównywarka miejsc | Faktografia Atlas',
        description:
          'Zestawienie dwóch dowolnych jednostek samorządu w Polsce obok siebie na podstawie danych GUS. Porównaj wartości, pozycje w rankingach i mapy.',
      }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8"
    >
      {/* Tytuł i opis strony */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-tusz mb-2">
          Porównywarka miejsc
        </h1>
        <p className="text-sm text-olowek max-w-3xl">
          Zestawienie dwóch gmin, powiatów lub województw obok siebie. Wybierz gotowy pojedynek lub wskaż dowolne dwa miejsca z wyszukiwarki.
        </p>
      </div>

      {/* Selektory A i B */}
      <section
        aria-label="Wybór miejsc do porównania"
        className="p-4 sm:p-6 bg-arkusz border border-linia space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Selektor A */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-semibold text-olowek mb-1.5 uppercase">
              Miejsce A
            </label>
            {unitA ? (
              <div className="flex items-center justify-between p-2.5 border border-linia bg-kalka min-h-[44px]">
                <div className="truncate">
                  <span className="text-sm font-bold text-tusz block truncate">
                    {unitLabel(unitA)}
                  </span>
                  <span className="text-xs text-olowek font-mono">
                    TERYT {unitA.teryt} ({unitA.level})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchParams(selectedTerytB ? { c: `,${selectedTerytB}` } : {});
                  }}
                  aria-label="Usuń miejsce A"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-olowek hover:text-tusz cursor-pointer rounded-none"
                >
                  <Icon icon={Xmark} size={20} aria-hidden={true} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="search"
                  value={queryA}
                  onChange={(e) => {
                    setQueryA(e.target.value);
                    setOpenSuggestA(true);
                  }}
                  onFocus={() => setOpenSuggestA(true)}
                  placeholder="Wpisz nazwę pierwszego miejsca..."
                  aria-label="Wyszukaj miejsce A"
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 border border-linia bg-kalka text-tusz text-sm rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
                />
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-olowek pointer-events-none">
                  <Icon icon={Search} size={18} aria-hidden={true} />
                </div>

                {openSuggestA && suggestionsA.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 z-30 bg-arkusz border border-linia mt-1 max-h-60 overflow-y-auto divide-y divide-linia shadow-none list-none p-0 m-0">
                    {suggestionsA.map((s) => (
                      <li key={s.teryt}>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenSuggestA(false);
                            setQueryA('');
                            setSearchParams({ c: `${s.teryt},${selectedTerytB}` });
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-kalka text-xs text-tusz min-h-[44px] flex flex-col justify-center cursor-pointer rounded-none"
                        >
                          <span className="font-semibold">{unitLabel(s)}</span>
                          <span className="text-olowek font-mono">TERYT {s.teryt}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Przycisk zamiany (⇄) */}
          <div className="md:col-span-1 flex justify-center items-center">
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Zamień miejscami"
              title="Zamień miejscami"
              className="min-w-[44px] min-h-[44px] p-2 border border-linia bg-kalka hover:bg-linia/20 text-tusz flex items-center justify-center cursor-pointer rounded-none transition-colors"
            >
              <Icon icon={RefreshDouble} size={20} aria-hidden={true} />
            </button>
          </div>

          {/* Selektor B */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-semibold text-olowek mb-1.5 uppercase">
              Miejsce B
            </label>
            {unitB ? (
              <div className="flex items-center justify-between p-2.5 border border-linia bg-kalka min-h-[44px]">
                <div className="truncate">
                  <span className="text-sm font-bold text-tusz block truncate">
                    {unitLabel(unitB)}
                  </span>
                  <span className="text-xs text-olowek font-mono">
                    TERYT {unitB.teryt} ({unitB.level})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchParams(selectedTerytA ? { c: `${selectedTerytA},` } : {});
                  }}
                  aria-label="Usuń miejsce B"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-olowek hover:text-tusz cursor-pointer rounded-none"
                >
                  <Icon icon={Xmark} size={20} aria-hidden={true} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="search"
                  value={queryB}
                  onChange={(e) => {
                    setQueryB(e.target.value);
                    setOpenSuggestB(true);
                  }}
                  onFocus={() => setOpenSuggestB(true)}
                  placeholder="Wpisz nazwę drugiego miejsca..."
                  aria-label="Wyszukaj miejsce B"
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 border border-linia bg-kalka text-tusz text-sm rounded-none focus:outline-none focus:ring-2 focus:ring-tusz"
                />
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-olowek pointer-events-none">
                  <Icon icon={Search} size={18} aria-hidden={true} />
                </div>

                {openSuggestB && suggestionsB.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 z-30 bg-arkusz border border-linia mt-1 max-h-60 overflow-y-auto divide-y divide-linia shadow-none list-none p-0 m-0">
                    {suggestionsB.map((s) => (
                      <li key={s.teryt}>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenSuggestB(false);
                            setQueryB('');
                            setSearchParams({ c: `${selectedTerytA},${s.teryt}` });
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-kalka text-xs text-tusz min-h-[44px] flex flex-col justify-center cursor-pointer rounded-none"
                        >
                          <span className="font-semibold">{unitLabel(s)}</span>
                          <span className="text-olowek font-mono">TERYT {s.teryt}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {(selectedTerytA || selectedTerytB) && (
          <div className="flex justify-end pt-2 border-t border-linia">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-olowek hover:text-tusz min-h-[44px] px-3 flex items-center cursor-pointer underline"
            >
              Wyczyść porównanie
            </button>
          </div>
        )}
      </section>

      {/* 6 gotowych pojedynków */}
      <section aria-label="Gotowe pojedynki">
        <h2 className="text-base font-bold text-tusz mb-3">
          Gotowe pojedynki do sprawdzenia
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_DUELS.map((duel) => {
            const isActive =
              (selectedTerytA === duel.terytA && selectedTerytB === duel.terytB) ||
              (selectedTerytA === duel.terytB && selectedTerytB === duel.terytA);

            return (
              <button
                key={duel.id}
                type="button"
                data-testid={`duel-${duel.id}`}
                onClick={() => handleSelectDuel(duel)}
                className={cn(
                  'p-4 border text-left flex flex-col justify-between min-h-[84px] cursor-pointer transition-colors rounded-none',
                  isActive
                    ? 'border-korekta bg-arkusz ring-1 ring-korekta'
                    : 'border-linia bg-arkusz hover:bg-kalka'
                )}
              >
                <div>
                  <span className="text-sm font-bold text-tusz block">
                    {duel.title}
                  </span>
                  <span className="text-xs text-olowek block mt-0.5">
                    {duel.desc}
                  </span>
                </div>
                <span className="text-xs text-korekta-tekst font-semibold mt-2 inline-flex items-center min-h-[24px]">
                  Porównaj te miejsca →
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Wyniki porównania: Mapki i Tabela */}
      {profileA && profileB ? (
        <section
          aria-label="Wyniki porównania"
          className="space-y-6 bg-arkusz border border-linia p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-linia gap-2">
            <div>
              <h2 className="text-lg font-bold text-tusz">
                {unitAName} vs {unitBName}
              </h2>
              <span className="text-xs text-olowek">
                Wskaźniki statystyczne obu jednostek w najnowszym dostępnym roku
              </span>
            </div>
          </div>

          {/* Dwie mapki SVG */}
          <CompareMaps
            profileA={profileA}
            profileB={profileB}
            units={units}
            onSelectUnit={(teryt) => navigate(`/?u=${teryt}`)}
          />

          {/* Tabela porównania */}
          <ProfileCompareTable
            profileA={profileA}
            profileB={profileB}
          />
        </section>
      ) : loadingProfiles ? (
        <div className="p-12 text-center text-sm text-olowek bg-arkusz border border-linia">
          Wczytuję dane porównania…
        </div>
      ) : (
        <div className="p-8 sm:p-12 text-center bg-arkusz border border-linia space-y-2">
          <p className="text-sm font-semibold text-tusz">
            Wybierz dwa miejsca z listy powyżej lub kliknij jeden z gotowych pojedynków.
          </p>
          <p className="text-xs text-olowek">
            Porównywarka automatycznie wyświetli mini-mapy obu jednostek oraz tabelę kluczowych wskaźników statystycznych.
          </p>
        </div>
      )}
    </SiteLayout>
  );
}
