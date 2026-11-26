import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router';
import type { ListView } from '@/core/start/discoveries';
import { ALL_LISTS_HREF } from '@/core/start/list-links';

export interface StartListsProps {
  lists: ListView[];
  to: (href: string) => string;
  onWarm?: () => void;
}

const TEXT_LINK =
  'inline-flex min-h-[44px] min-w-11 items-center self-start text-sm text-tusz underline underline-offset-4 break-words hover:no-underline focus-visible:outline-2 focus-visible:outline-tusz';
const ROW = 'flex min-h-[44px] min-w-0 items-center gap-3 py-2 text-tusz no-underline hover:bg-linia/15 focus-visible:outline-2 focus-visible:outline-tusz';

/** Wiersz podium: miejsce, nazwa i wartość pod nazwą; pierwsze miejsce większe (hierarchia rozmiarem, nie ramką). */
function RowBody({ rank, name, value }: { rank: number; name: string; value: string }) {
  const first = rank === 1;
  return (
    <>
      <span className={`w-8 shrink-0 font-mono tabular-nums ${first ? 'text-xl font-bold text-tusz' : 'text-sm text-olowek'}`}>{rank}</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={`leading-tight [overflow-wrap:normal] [word-break:normal] hyphens-none ${first ? 'text-md font-bold' : 'text-sm'}`} data-slot="start-list-name">
          {name}
        </span>
        <span className={`font-mono tabular-nums ${first ? 'text-sm text-tusz' : 'text-xs text-olowek'}`}>{value}</span>
      </span>
    </>
  );
}

/**
 * „Zestawienia”: zakładki z nazwami wskaźników (wszystkie widać od razu, siatka 2×2 na telefonie), pod nimi jedno
 * zestawienie: podium 3 miejsc (wiersz prowadzi do profilu jednostki), drugi koniec skali, link do mapy i pełnego zestawienia.
 * Ukryte zestawienia zostają w dokumencie (atrybut hidden) – przełączenie nie pobiera niczego.
 * Zakładki według wzorca ARIA: strzałki zmieniają zakładkę, Tab przechodzi do treści.
 */
export function StartLists({ lists, to, onWarm }: StartListsProps) {
  const [active, setActive] = useState<string | null>(null);
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
          <article data-slot="start-list" className="flex min-w-0 flex-col gap-3 border border-t-0 border-linia bg-arkusz p-4 md:p-6">
            <div className="flex flex-col gap-1">
              {/* Nazwa jest na zakładce; nagłówek zostaje dla czytników ekranu. */}
              <h4 className="sr-only">{l.title}</h4>
              {l.subtitle && <p className="m-0 text-xs text-olowek">{l.subtitle}</p>}
            </div>
            {l.rows.length === 0 && (
              <p className="m-0 text-sm text-olowek" role="status">
                Wczytujemy pozycje…
              </p>
            )}
            <ol className="m-0 flex list-none flex-col p-0" hidden={l.rows.length === 0}>
              {l.rows.map((r, i) => (
                <li key={r.teryt} className="border-t border-linia text-tusz first:border-t-0">
                  {/* Ukryte zestawienie nie ma linków (niewidoczne pola dotykowe); pojawiają się po wybraniu zakładki. */}
                  {l.key === value ? (
                    <Link to={to(r.href)} data-slot="start-list-row" className={ROW} {...warm}>
                      <RowBody rank={i + 1} name={r.name} value={r.value} />
                    </Link>
                  ) : (
                    <div className={ROW}>
                      <RowBody rank={i + 1} name={r.name} value={r.value} />
                    </div>
                  )}
                </li>
              ))}
            </ol>
            {l.key === value && (
              <>
                {/* Drugi koniec skali: ta sama miara od przeciwnej strony (np. najmłodsze ↔ najstarsze gminy). */}
                {l.opposite && (
                  <p className="m-0 flex flex-col gap-0 border-t border-linia pt-3 text-xs text-olowek" data-slot="start-list-opposite">
                    Na drugim końcu skali
                    <a href={l.opposite.href} className={`${TEXT_LINK} font-bold`}>
                      {l.opposite.label}
                    </a>
                  </p>
                )}
                <div className="flex flex-wrap gap-x-6">
                  <Link to={to(l.href)} aria-label={`Zobacz na mapie: ${l.title}`} className={TEXT_LINK} {...warm}>
                    Zobacz na mapie
                  </Link>
                  {l.full && (
                    <a href={l.full.href} aria-label={`Pełne zestawienie: ${l.full.label}`} className={TEXT_LINK}>
                      Pełne zestawienie
                    </a>
                  )}
                </div>
              </>
            )}
          </article>
        </div>
      ))}
      <a href={ALL_LISTS_HREF} className={`${TEXT_LINK} mt-2`}>
        Wszystkie tematy i zestawienia
      </a>
    </div>
  );
}
