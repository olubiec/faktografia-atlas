import { useId, useRef, useState, type KeyboardEvent } from 'react';
import type { ListView } from '@/core/start/discoveries';
import type { EndKey } from '@/core/start/list-ends';
import { ALL_LISTS_HREF } from '@/core/start/list-links';
import { ListPodium, TEXT_LINK } from './ListPodium';

export interface StartListsProps {
  lists: ListView[];
  to: (href: string) => string;
  onWarm?: () => void;
}

/**
 * „Zestawienia”: zakładki z nazwami wskaźników (wszystkie widać od razu, siatka 2×2 na telefonie), pod nimi jedno
 * zestawienie (ListPodium): „Najwyższe | Najniższe”, podium 5 miejsc, link do mapy i pełnego zestawienia.
 * Wybrany koniec skali obowiązuje we wszystkich zakładkach; zanim użytkownik wybierze, każde zestawienie ma swój kierunek.
 * Ukryte zestawienia zostają w dokumencie (atrybut hidden) – przełączenie nie pobiera niczego.
 * Zakładki według wzorca ARIA: strzałki zmieniają zakładkę, Tab przechodzi do treści.
 */
export function StartLists({ lists, to, onWarm }: StartListsProps) {
  const [active, setActive] = useState<string | null>(null);
  const [end, setEnd] = useState<EndKey | null>(null);
  const base = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  if (lists.length === 0) return null;
  const value = lists.some((l) => l.key === active) ? active! : lists[0].key;
  const warm = { onPointerEnter: onWarm, onTouchStart: onWarm, onFocus: onWarm };
  const onKey = (e: KeyboardEvent, k: number) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    const target = e.key === 'Home' ? 0 : e.key === 'End' ? lists.length - 1 : step ? (k + step + lists.length) % lists.length : -1;
    if (target < 0) return;
    e.preventDefault();
    setActive(lists[target].key);
    tabRefs.current[target]?.focus();
  };

  return (
    <div className="flex flex-col">
      <div role="tablist" aria-label="Wybierz zestawienie" className="grid grid-cols-2 border-b border-linia md:grid-cols-4">
        {lists.map((l, k) => {
          const on = l.key === value;
          return (
            <button
              key={l.key}
              ref={(el) => {
                tabRefs.current[k] = el;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${k}`}
              aria-selected={on}
              aria-controls={`${base}-panel-${k}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(l.key)}
              onKeyDown={(e) => onKey(e, k)}
              // Aktywna zakładka: gruba kreska korekty (STYL §2 – wyjątek dla aktywnej zakładki).
              className={`flex min-h-[44px] min-w-0 cursor-pointer items-start border-b-4 px-2 py-2 text-left text-xs leading-tight break-words focus-visible:outline-2 focus-visible:outline-tusz sm:px-3 sm:text-sm ${on ? 'border-korekta font-bold text-tusz' : 'border-transparent text-olowek hover:text-tusz'}`}
            >
              {l.title}
            </button>
          );
        })}
      </div>
      {lists.map((l, k) => (
        <div key={l.key} role="tabpanel" id={`${base}-panel-${k}`} aria-labelledby={`${base}-tab-${k}`} hidden={l.key !== value}>
          <ListPodium list={l} active={l.key === value} end={end} onEnd={setEnd} to={to} warm={warm} />
        </div>
      ))}
      <a href={ALL_LISTS_HREF} className={`${TEXT_LINK} mt-2`}>
        Wszystkie tematy i zestawienia
      </a>
    </div>
  );
}
