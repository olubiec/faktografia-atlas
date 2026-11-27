import { useEffect, useRef, type KeyboardEvent } from 'react';
import { scrollBehavior } from './useCarouselSync';

export interface StripItem {
  key: string;
  title: string;
  /** Dopisek tylko dla czytników ekranu (np. „z biblioteki”). */
  note?: string;
}

export interface IndicatorStripProps {
  items: StripItem[];
  active: number;
  onSelect: (index: number) => void;
  /** Początek identyfikatorów kart i paneli (wspólny z karuzelą). */
  idBase: string;
}

/**
 * Pasek wskaźników karuzeli: zakładki według wzorca ARIA, przewijane palcem w poziomie (bez widocznego paska).
 * Aktywna pozycja ma grubą kreskę korekty (jedyny czerwony element sekcji) i jest zawsze wsuwana w widok.
 * Strzałki, Home i End zmieniają zakładkę, Tab przechodzi do treści slajdu.
 */
export function IndicatorStrip({ items, active, onSelect, idBase }: IndicatorStripProps) {
  const strip = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // Przewijamy sam pasek (nie stronę): aktywna pozycja na środku, o ile jest za ekranem.
  useEffect(() => {
    const box = strip.current;
    const tab = tabs.current[active];
    if (!box || !tab || typeof box.scrollTo !== 'function') return;
    const left = tab.offsetLeft - (box.clientWidth - tab.offsetWidth) / 2;
    box.scrollTo({ left: Math.max(0, left), behavior: scrollBehavior() });
  }, [active]);

  const onKey = (e: KeyboardEvent, k: number) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : step ? Math.min(items.length - 1, Math.max(0, k + step)) : -1;
    if (to < 0) return;
    e.preventDefault();
    onSelect(to);
    tabs.current[to]?.focus();
  };

  return (
    <div ref={strip} role="tablist" aria-label="Wybierz zestawienie" data-slot="indicator-strip" className="relative flex overflow-x-auto overscroll-x-contain border-b border-linia [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
            aria-controls={`${idBase}-panel-${k}`}
            tabIndex={on ? 0 : -1}
            onClick={() => onSelect(k)}
            onKeyDown={(e) => onKey(e, k)}
            className={`flex min-h-[44px] w-40 shrink-0 cursor-pointer items-center border-b-4 px-3 py-2 text-left text-sm leading-tight focus-visible:outline-2 focus-visible:outline-tusz ${on ? 'border-korekta font-bold text-tusz' : 'border-transparent text-olowek hover:text-tusz'}`}
          >
            {it.title}
            {it.note && <span className="sr-only"> {it.note}</span>}
          </button>
        );
      })}
    </div>
  );
}
