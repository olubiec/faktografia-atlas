import { NavArrowLeft, NavArrowRight } from 'iconoir-react';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '@/view/ui/Icon';
import { scrollBehavior } from './useSwipe';

export interface StripItem {
  key: string;
  title: string;
  /** Dopisek tylko dla czytników ekranu (np. „z biblioteki”). */
  note?: string;
}

export interface IndicatorStripProps {
  items: StripItem[];
  /** Zaznaczona pozycja: ta, którą wybrał użytkownik (nie ta, która akurat stoi na środku paska). */
  active: number;
  onSelect: (index: number) => void;
  /** Identyfikator panelu pod paskiem (aria-controls). */
  panelId: string;
  idBase: string;
}

const SIDE = 'hidden min-h-[44px] w-11 shrink-0 cursor-pointer items-center justify-center border-b border-linia bg-transparent text-tusz hover:bg-linia/20 focus-visible:outline-2 focus-visible:outline-tusz disabled:cursor-default disabled:text-olowek disabled:opacity-40 disabled:hover:bg-transparent md:flex';

/**
 * Pasek wskaźników: zakładki według wzorca ARIA, przewijane palcem, a na komputerze strzałkami po bokach paska.
 * Zaznaczona pozycja ma grubą kreskę korekty (jedyny czerwony element sekcji). Pasek przewija się tylko wtedy,
 * gdy zaznaczona pozycja wychodzi poza widok – sam ruch paska niczego nie zaznacza.
 * Strzałki, Home i End klawiaturą zmieniają zakładkę, Tab przechodzi do treści.
 */
export function IndicatorStrip({ items, active, onSelect, panelId, idBase }: IndicatorStripProps) {
  const strip = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const box = strip.current;
    if (!box) return;
    setEdge({ start: box.scrollLeft < 2, end: box.scrollLeft + box.clientWidth >= box.scrollWidth - 2 });
  }, []);
  useEffect(measure, [measure, items.length]);

  // Zaznaczona pozycja ma być w całości widoczna: przesuwamy pasek o tyle, ile trzeba.
  useEffect(() => {
    const box = strip.current;
    const tab = tabs.current[active];
    if (!box || !tab || typeof box.scrollTo !== 'function') return;
    const left = tab.offsetLeft;
    const right = left + tab.offsetWidth;
    if (left < box.scrollLeft) box.scrollTo({ left, behavior: scrollBehavior() });
    else if (right > box.scrollLeft + box.clientWidth) box.scrollTo({ left: right - box.clientWidth, behavior: scrollBehavior() });
  }, [active, items.length]);

  const by = (dir: 1 | -1) => strip.current?.scrollBy?.({ left: dir * strip.current.clientWidth * 0.8, behavior: scrollBehavior() });

  const onKey = (e: KeyboardEvent, k: number) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : step ? Math.min(items.length - 1, Math.max(0, k + step)) : -1;
    if (to < 0) return;
    e.preventDefault();
    onSelect(to);
    tabs.current[to]?.focus();
  };

  return (
    <div className="flex" data-slot="indicator-strip-wrap">
      <button type="button" className={SIDE} disabled={edge.start} onClick={() => by(-1)} aria-label="Przewiń pasek w lewo" data-slot="strip-scroll-left">
        <Icon icon={NavArrowLeft} aria-hidden={true} size={18} />
      </button>
      <div
        ref={strip}
        onScroll={measure}
        role="tablist"
        aria-label="Wybierz zestawienie"
        data-slot="indicator-strip"
        className="relative flex min-w-0 flex-1 overflow-x-auto overscroll-x-contain border-b border-linia [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it, k) => {
          const on = k === active;
          return (
            <button
              key={it.key}
              ref={(el) => {
                tabs.current[k] = el;
              }}
              type="button"
              role="tab"
              id={`${idBase}-tab-${k}`}
              aria-selected={on}
              aria-controls={panelId}
              tabIndex={on ? 0 : -1}
              onClick={() => onSelect(k)}
              onKeyDown={(e) => onKey(e, k)}
              className={`flex h-20 w-40 shrink-0 cursor-pointer items-end border-b-4 px-3 py-2 text-left text-sm leading-tight focus-visible:outline-2 focus-visible:outline-tusz ${on ? 'border-korekta font-bold text-tusz' : 'border-transparent text-olowek hover:text-tusz'}`}
            >
              <span className="line-clamp-3" title={it.title}>{it.title}</span>
              {it.note && <span className="sr-only"> {it.note}</span>}
            </button>
          );
        })}
      </div>
      <button type="button" className={SIDE} disabled={edge.end} onClick={() => by(1)} aria-label="Przewiń pasek w prawo" data-slot="strip-scroll-right">
        <Icon icon={NavArrowRight} aria-hidden={true} size={18} />
      </button>
    </div>
  );
}
