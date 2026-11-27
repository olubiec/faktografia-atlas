import { useEffect, useId, useMemo, useState } from 'react';
import indicatorsData from '../../../config/indicators.json';
import { loadUnits } from '@/core/data/load-atlas-data';
import type { Level } from '@/core/facts/types';
import { loadAnyValues } from '@/core/indicators/load-any-values';
import { peekAvailable } from '@/core/indicators/load-available';
import { sharedRegistry } from '@/core/indicators/shared-registry';
import { clampLevel } from '@/core/map/main-view';
import type { Indicator } from '@/core/profile/profile';
import { listView, mapHref, type ListView } from '@/core/start/discoveries';
import type { EndKey } from '@/core/start/list-ends';
import { ALL_LISTS_HREF } from '@/core/start/list-links';
import { loadFactsLists } from '@/core/start/load-lists';
import { shortIndicatorName } from '@/core/seo/sentences';
import { LevelSwitch } from '@/view/main/LevelSwitch';
import { IndicatorStrip } from './IndicatorStrip';
import { LibraryPick } from './LibraryPick';
import { BUTTON_SECONDARY, ListPodium } from './ListPodium';
import { isFrugalNetwork } from './preloadMap';
import { useLevelList, type LevelWish } from './useLevelList';
import { useSwipe } from './useSwipe';

export interface StartCarouselProps {
  /** Zestawienia redakcyjne (facts-start.json albo zastępcze przed pobraniem danych). */
  lists: ListView[];
  /** Dane redakcyjne są już wczytane: dociągamy resztę zestawień i spis wskaźników. */
  ready: boolean;
  to: (href: string) => string;
  onWarm?: () => void;
}

const MAIN = indicatorsData as Indicator[];

/** Wskaźnik z rejestru (główne zawsze, z biblioteki po wczytaniu spisu); null, gdy go nie ma. */
const indicatorOf = (id: string) => sharedRegistry(MAIN, peekAvailable() ?? null).byId.get(id) ?? null;

/**
 * „Zestawienia”: pasek wskaźników (zaznaczony jest ten, który wybrałeś), pod nim panel jak przy mapie: „Wybierz dane”
 * z całą biblioteką, poziom (Województwa / Powiaty / Gminy), „Najwyższe | Najniższe” i 5 pozycji.
 * Zestawienia redakcyjne i dalsze (facts-lists.json) są gotowymi plikami; inny poziom albo wskaźnik z biblioteki
 * liczy przeglądarka po wyborze. Po wejściu na stronę otwarte jest losowe zestawienie.
 */
export function StartCarousel({ lists, ready, to, onWarm }: StartCarouselProps) {
  const base = useId();
  const panelId = `${base}-panel`;
  const [seed] = useState(() => Math.random());
  const [chosen, setChosen] = useState<string | null>(null);
  const [libId, setLibId] = useState<string | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [end, setEnd] = useState<EndKey | null>(null);
  const [extra, setExtra] = useState<ListView[]>([]);
  const [armed, setArmed] = useState(false);

  // Dalsze zestawienia (≤ 12 KB) od razu po danych redakcyjnych, a przy oszczędzaniu danych dopiero po pierwszym ruchu.
  useEffect(() => {
    if (!ready || (!armed && isFrugalNetwork())) return;
    let cancelled = false;
    loadFactsLists()
      .then((f) => {
        const more = f.lists.map(listView).filter((l): l is ListView => l !== null);
        if (!cancelled) setExtra(more);
      })
      .catch(() => undefined); // Bez dalszych zestawień panel działa na tych, które już ma.
    return () => {
      cancelled = true;
    };
  }, [ready, armed]);

  // Gotowe zestawienia: redakcyjne, potem dalsze; wskaźnik jest tylko raz (pierwsze zestawienie wygrywa).
  const featured = useMemo(() => {
    const seen = new Set<string>();
    return [...lists, ...extra].filter((l) => l.indicatorId && !seen.has(l.indicatorId) && seen.add(l.indicatorId));
  }, [lists, extra]);
  const ids = featured.map((l) => l.indicatorId!);
  const libIsFeatured = libId !== null && ids.includes(libId);
  const stripIds = libId && !libIsFeatured ? [...ids, libId] : ids;

  // Wybór użytkownika albo – do pierwszego ruchu – los (zmienia się razem z dochodzącymi zestawieniami).
  const selId = chosen && stripIds.includes(chosen) ? chosen : (ids[Math.floor(seed * ids.length)] ?? null);
  const index = Math.max(0, stripIds.indexOf(selId ?? ''));
  const pre = featured.find((l) => l.indicatorId === selId) ?? null;
  const ind = selId ? indicatorOf(selId) : null;
  const wantLevel = level && ind ? clampLevel(level, ind.minLevel) : null;

  // Gotowy plik, gdy poziom się zgadza; inaczej liczy przeglądarka (wskaźnik z biblioteki zawsze).
  const needsCompute = !!selId && (!pre || (wantLevel !== null && wantLevel !== pre.level));
  const wish: LevelWish | null = needsCompute ? (wantLevel ?? 'auto') : null;
  const { result, retry } = useLevelList(needsCompute ? selId : null, wish);

  // Najbliższy ruch w sekcji zamraża wybór losowy; dalsze zestawienia dociągamy także przy oszczędzaniu danych.
  const touch = () => {
    setArmed(true);
    if (!chosen && selId) setChosen(selId);
  };
  const select = (i: number) => {
    touch();
    setChosen(stripIds[i] ?? null);
  };
  // Wybór z menu: wskaźnik z paska zaznaczamy, inny dochodzi na koniec paska (jeden, nowy zastępuje poprzedni).
  const onPick = (id: string) => {
    setArmed(true);
    setLibId(id);
    setChosen(id);
  };

  // Mapa po kliknięciu nie czeka na sieć: wartości zaznaczonego wskaźnika pobieramy z góry, ale dopiero po budżecie startu (3 s).
  useEffect(() => {
    if (!selId || !ready || isFrugalNetwork()) return;
    const t = window.setTimeout(() => void loadUnits().then((units) => loadAnyValues(selId, { units })).catch(() => undefined), 3200);
    return () => window.clearTimeout(t);
  }, [selId, ready]);

  const swipe = useSwipe(
    () => index > 0 && select(index - 1),
    () => index < stripIds.length - 1 && select(index + 1),
  );

  if (lists.length === 0 || !selId) return null;
  const name = ind ? shortIndicatorName(ind.name, ind.unit) : (pre?.title ?? '');
  const stripItems = stripIds.map((id) => {
    const own = indicatorOf(id);
    const title = featured.find((l) => l.indicatorId === id)?.title ?? (own ? shortIndicatorName(own.name, own.unit) : id);
    return { key: id, title, ...(id === libId && !libIsFeatured ? { note: 'z biblioteki' } : {}) };
  });

  const computed = needsCompute ? result : null;
  const view: ListView = computed?.view ?? pre ?? { key: `${selId}-loading`, title: name, subtitle: '', rows: [], href: mapHref({ indicatorId: selId, ...(wantLevel ? { level: wantLevel } : {}) }) };
  const state = computed && (computed.status === 'failed' || computed.status === 'empty') ? computed.status : null;
  const shownLevel: Level = (computed?.view?.level ?? wantLevel ?? pre?.level ?? 'gmi') as Level;
  const warm = { onPointerEnter: onWarm, onTouchStart: onWarm, onFocus: onWarm };
  const levelSwitch = ind && (
    <div className="flex min-w-0 flex-col gap-1.5 md:w-72" data-slot="start-level">
      <span className="text-sm font-semibold text-tusz">Poziom</span>
      <LevelSwitch value={shownLevel} minLevel={ind.minLevel} {...(libraryLevels(selId) ? { levels: libraryLevels(selId)! } : {})} onChange={(l) => { touch(); setLevel(l); }} />
    </div>
  );

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col" data-slot="start-carousel" onPointerDown={touch} onFocus={() => setArmed(true)}>
      <IndicatorStrip items={stripItems} active={index} onSelect={select} panelId={panelId} idBase={base} />
      <div id={panelId} role="tabpanel" aria-labelledby={`${base}-tab-${index}`} className="flex min-w-0 flex-col gap-3 border border-t-0 border-linia bg-arkusz p-4 md:p-6" data-slot="start-carousel-panel" {...swipe}>
        {ready && <LibraryPick selectedId={selId} selectedName={name} onPick={onPick} />}
        {state ? (
          <>
            {levelSwitch}
            <div className="flex flex-col gap-2" role="status" data-slot="library-state">
              <p className="m-0 text-sm text-tusz">{state === 'failed' ? 'Nie udało się wczytać danych.' : 'Dla tego wskaźnika na tym poziomie nie mamy dość danych na zestawienie.'}</p>
              {state === 'failed' && (
                <button type="button" onClick={retry} className={`${BUTTON_SECONDARY} self-start cursor-pointer`}>
                  Spróbuj jeszcze raz
                </button>
              )}
            </div>
          </>
        ) : (
          <ListPodium
            list={view}
            active
            end={end}
            onEnd={setEnd}
            to={to}
            warm={warm}
            levelSwitch={levelSwitch}
            side={{ hasPrev: index > 0, hasNext: index < stripIds.length - 1, onPrev: () => select(index - 1), onNext: () => select(index + 1) }}
          />
        )}
      </div>
      <a href={ALL_LISTS_HREF} className="mt-2 inline-flex min-h-[44px] items-center self-start text-sm text-tusz underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-tusz">
        Wszystkie tematy i zestawienia
      </a>
    </div>
  );
}

/** Poziomy z danymi wskaźnika z biblioteki (ze spisu); wskaźniki główne wynikają z minLevel. */
function libraryLevels(id: string | null) {
  if (!id) return undefined;
  const lv = sharedRegistry(MAIN, peekAvailable() ?? null).levels.get(id);
  return lv && lv.length > 0 ? lv : undefined;
}
