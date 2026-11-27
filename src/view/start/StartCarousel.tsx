import { NavArrowLeft, NavArrowRight } from 'iconoir-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Icon } from '@/view/ui/Icon';
import { listView, type ListView } from '@/core/start/discoveries';
import type { EndKey } from '@/core/start/list-ends';
import { ALL_LISTS_HREF } from '@/core/start/list-links';
import { loadFactsLists } from '@/core/start/load-lists';
import { IndicatorStrip } from './IndicatorStrip';
import { LibraryPick } from './LibraryPick';
import { ListPodium, TEXT_LINK } from './ListPodium';
import { useCarouselSync } from './useCarouselSync';
import { useLibrarySlide } from './useLibrarySlide';

export interface StartCarouselProps {
  /** Zestawienia redakcyjne (facts-start.json albo zastępcze przed pobraniem danych). */
  lists: ListView[];
  /** Dane redakcyjne są już wczytane: po chwili dociągamy resztę karuzeli, nawet bez ruchu użytkownika. */
  ready: boolean;
  to: (href: string) => string;
  onWarm?: () => void;
}

/** Zwłoka przed samoczynnym pobraniem dalszych zestawień: pierwsze sekundy strony zostają lekkie. */
const IDLE_MS = 4000;
const ARROW = 'inline-flex min-h-[44px] items-center gap-1 min-w-11 cursor-pointer px-3 text-sm text-tusz hover:bg-linia/20 focus-visible:outline-2 focus-visible:outline-tusz disabled:cursor-default disabled:text-olowek disabled:opacity-50 disabled:hover:bg-transparent';

/**
 * „Zestawienia”: pasek wskaźników nad torem slajdów (CSS scroll-snap, bez pakietu). Slajd zmieniasz paskiem, strzałkami
 * albo przesunięciem palcem. Wybór „Najwyższe | Najniższe” obowiązuje na wszystkich slajdach. Nieaktywne slajdy są `inert`.
 * Slajdy: zestawienia redakcyjne, potem dalsze wskaźniki główne (facts-lists.json, po pierwszym ruchu lub po chwili),
 * na końcu jeden wskaźnik wybrany z biblioteki („+ Więcej danych”).
 */
export function StartCarousel({ lists, ready, to, onWarm }: StartCarouselProps) {
  const base = useId();
  const track = useRef<HTMLDivElement>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [end, setEnd] = useState<EndKey | null>(null);
  const [extra, setExtra] = useState<ListView[]>([]);
  const [armed, setArmed] = useState(false);
  const { slide: lib, pick, retry } = useLibrarySlide();

  // Dalsze zestawienia: po pierwszym ruchu w karuzeli albo po chwili od wczytania danych redakcyjnych (nie przy oszczędzaniu danych).
  useEffect(() => {
    if (armed || !ready) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData) return;
    const t = window.setTimeout(() => setArmed(true), Math.max(0, IDLE_MS - performance.now()));
    return () => window.clearTimeout(t);
  }, [armed, ready]);
  useEffect(() => {
    if (!armed) return;
    let cancelled = false;
    loadFactsLists()
      .then((f) => {
        const have = new Set(lists.map((l) => l.key));
        const more = f.lists.map(listView).filter((l): l is ListView => l !== null && !have.has(l.key));
        if (!cancelled) setExtra(more);
      })
      .catch(() => undefined); // Bez dalszych zestawień karuzela działa na tych, które już ma.
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lista redakcyjna jest stała po wczytaniu; ponowne pobranie niepotrzebne
  }, [armed]);

  const slides = useMemo(() => [...lists, ...extra, ...(lib ? [lib.view] : [])], [lists, extra, lib]);
  // Aktywny slajd pamiętamy po kluczu: gdy dojdą dalsze zestawienia, slajd z biblioteki zmienia numer, ale zostaje aktywny.
  const index = Math.max(0, slides.findIndex((s) => s.key === activeKey));
  const goTo = useCarouselSync(track, slides.length, (i) => setActiveKey(slides[i]?.key ?? null));
  const select = (i: number) => {
    setArmed(true);
    setActiveKey(slides[i]?.key ?? null);
    goTo(i);
  };

  // Wskaźnik już obecny w pasku: przechodzimy do niego. Inny: pobieramy go i pokazujemy jako ostatni slajd.
  const onPick = (id: string) => {
    const same = slides.findIndex((s) => !s.key.startsWith('library-') && new RegExp(`^${id}-(gmi|pow|woj)--?1$`).test(s.key));
    if (same >= 0) select(same);
    else pick(id);
  };
  const libKey = lib?.view.key;
  const prevLib = useRef(libKey);
  useEffect(() => {
    if (!libKey) return;
    setActiveKey(libKey);
    goTo(slides.findIndex((s) => s.key === libKey));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tylko przy nowym wyborze z biblioteki
  }, [libKey]);
  // Zmiana liczby slajdów (doszły dalsze zestawienia) przesuwa tor: ustawiamy go z powrotem na aktywnym slajdzie.
  // Przy nowym wyborze z biblioteki tor przewija się do nowego slajdu (powyżej), więc tu nic nie robimy.
  useEffect(() => {
    if (prevLib.current !== libKey) {
      prevLib.current = libKey;
      return;
    }
    const el = track.current;
    if (el && typeof el.scrollTo === 'function') el.scrollTo({ left: index * el.clientWidth, behavior: 'auto' });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tylko przy zmianie liczby slajdów
  }, [slides.length]);

  if (lists.length === 0) return null;
  const warm = { onPointerEnter: onWarm, onTouchStart: onWarm, onFocus: onWarm };
  const items = slides.map((s, k) => ({ key: s.key, title: s.title, ...(lib && k === slides.length - 1 ? { note: 'z biblioteki' } : {}) }));

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col" data-slot="start-carousel" onPointerDown={() => setArmed(true)} onFocus={() => setArmed(true)}>
      <IndicatorStrip items={items} active={index} onSelect={select} idBase={base} />
      <div
        ref={track}
        role="group"
        aria-roledescription="karuzela"
        aria-label="Zestawienia"
        className="relative flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        data-slot="start-carousel-track"
      >
        {slides.map((s, k) => (
          <div key={s.key} role="tabpanel" id={`${base}-panel-${k}`} aria-labelledby={`${base}-tab-${k}`} inert={k !== index} className="w-full shrink-0 snap-start snap-always">
            {lib && k === slides.length - 1 && (lib.status === 'failed' || lib.status === 'empty') ? (
              <div className="flex flex-col gap-2 border border-t-0 border-linia bg-arkusz p-4 md:p-6" role="status" data-slot="library-state">
                <p className="m-0 text-sm text-tusz">
                  {lib.status === 'failed' ? 'Nie udało się wczytać danych.' : 'Dla tego wskaźnika nie mamy jeszcze dość danych na zestawienie.'}
                </p>
                {lib.status === 'failed' && (
                  <button type="button" onClick={retry} className={`${TEXT_LINK} cursor-pointer font-bold`}>
                    Spróbuj jeszcze raz
                  </button>
                )}
              </div>
            ) : (
              <ListPodium list={s} active={k === index} end={end} onEnd={setEnd} to={to} warm={warm} />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-b border-linia" data-slot="start-carousel-nav">
        <button type="button" className={ARROW} disabled={index === 0} onClick={() => select(index - 1)}>
          <Icon icon={NavArrowLeft} aria-hidden={true} size={16} />
          Poprzednie
        </button>
        <p className="m-0 font-mono text-xs tabular-nums text-olowek" data-slot="start-carousel-counter" aria-live="polite">
          {index + 1} z {slides.length}
        </p>
        <button type="button" className={ARROW} disabled={index === slides.length - 1} onClick={() => select(index + 1)}>
          Następne
          <Icon icon={NavArrowRight} aria-hidden={true} size={16} />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-6">
        <LibraryPick selectedId={lib?.id ?? null} onPick={onPick} />
        <a href={ALL_LISTS_HREF} className={TEXT_LINK}>
          Wszystkie tematy i zestawienia
        </a>
      </div>
    </div>
  );
}
