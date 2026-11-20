import { useEffect, useRef, type KeyboardEvent } from 'react';
import { MoreVert, NavArrowDown, NavArrowUp, Xmark } from 'iconoir-react';
import { Icon } from '../ui/Icon';
import type { IndicatorReorder } from './useIndicatorReorder';
import type { Indicator } from '../../core/profile/profile';
import { rememberFocus, takeFocus, type FocusControl } from './myIndicatorsFocus';

const CHIP =
  'min-h-[44px] px-3 flex items-center gap-2 text-sm bg-arkusz text-tusz border border-linia cursor-pointer hover:bg-linia/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tusz';
const BTN_44 = 'min-h-[44px] min-w-[44px] flex items-center justify-center text-tusz shrink-0 hover:bg-linia/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tusz';

/** Po zmianie listy przenosi fokus na zapamiętany przycisk (nigdy nie zostaje na <body>). */
function FocusRestorer({ list }: { list: readonly string[] }) {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const next = takeFocus();
    const root = marker.current?.parentElement;
    if (!next || !root) return;
    const sel = next === 'add' ? '[data-control="add"]' : `[data-row-id="${CSS.escape(next.id)}"] [data-control="${next.control}"]`;
    root.querySelector<HTMLElement>(sel)?.focus();
  }, [list]);
  return <span ref={marker} hidden />;
}

export interface MyIndicatorsBarProps {
  all: Indicator[];
  list: readonly string[];
  isBasic: boolean;
  open: boolean;
  onToggle: () => void;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onReset: () => void;
  /** Gdy podane, wiersze mają uchwyt do przeciągania (mysz, dotyk) i strzałki na klawiaturze. */
  reorder?: IndicatorReorder;
  /** Wskaźnik aktualnie otwarty gdzie indziej (np. na liście wyników); wiersz dostaje aria-current. */
  activeId?: string | null;
}

interface RowProps {
  ind: Indicator;
  pos: number;
  count: number;
  reorder?: IndicatorReorder;
  active: boolean;
  /** Zgłasza akcję, żeby lista mogła potem przywrócić fokus. */
  onChange: (id: string, action: FocusControl) => void;
  onRemove: (id: string) => void;
}

/** Jeden wiersz: uchwyt, strzałki ‹ ›, nazwa, ×. Bez własnego stanu. */
export function IndicatorRow({ ind, pos, count, reorder, active, onChange, onRemove }: RowProps) {
  const drag = reorder?.drag ?? null;
  const dragged = drag?.id === ind.id;
  const target = drag && !dragged && drag.to === pos;
  const key = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    reorder?.move(ind.id, e.key === 'ArrowUp' ? -1 : 1);
  };
  const go = (action: 'up' | 'down') => {
    onChange(ind.id, action);
    reorder?.move(ind.id, action === 'up' ? -1 : 1);
  };
  return (
    <div
      key={ind.id}
      data-row-id={ind.id}
      aria-current={active ? 'true' : undefined}
      style={dragged ? { transform: `translateY(${drag.offset}px)` } : undefined}
      className={`flex items-stretch bg-arkusz border border-linia -mt-px first:mt-0 ${dragged ? 'relative z-10 opacity-80' : target ? 'bg-linia/15' : ''}`}
    >
      {reorder && (
        <>
          <button type="button" aria-label={`Przeciągnij, aby zmienić kolejność: ${ind.name}`} onKeyDown={key}
            className={`${BTN_44} cursor-move touch-none`} {...reorder.handlers(ind.id, pos)}>
            <Icon icon={MoreVert} size={16} aria-hidden={true} />
          </button>
          <button type="button" data-control="up" aria-label={`Przesuń ${ind.name} wyżej`} disabled={pos === 0} onClick={() => go('up')}
            className={`${BTN_44} cursor-pointer disabled:opacity-40 disabled:cursor-default`}>
            <Icon icon={NavArrowUp} size={16} aria-hidden={true} />
          </button>
          <button type="button" data-control="down" aria-label={`Przesuń ${ind.name} niżej`} disabled={pos === count - 1} onClick={() => go('down')}
            className={`${BTN_44} cursor-pointer disabled:opacity-40 disabled:cursor-default`}>
            <Icon icon={NavArrowDown} size={16} aria-hidden={true} />
          </button>
        </>
      )}
      <span className="flex-1 min-w-0 px-3 py-2 flex items-center text-sm text-tusz break-words">{ind.name}</span>
      <button type="button" data-control="remove" aria-label={`Usuń wskaźnik ${ind.name}`}
        onClick={() => { onChange(ind.id, 'remove'); onRemove(ind.id); }} className={`${BTN_44} cursor-pointer`}>
        <Icon icon={Xmark} size={16} aria-hidden={true} />
      </button>
    </div>
  );
}

/**
 * Lista „Moje wskaźniki”: wiersz = uchwyt (przeciąganie) + nazwa + ×.
 * Usuwa wyłącznie ×, nazwa nic nie robi; lista rozwijana dodaje, „Przywróć podstawowe” wraca do startu.
 */
export function MyIndicatorsBar({ all, list, isBasic: basic, open, onToggle, onAdd, onRemove, onReset, reorder, activeId }: MyIndicatorsBarProps) {
  const mine = list.map((id) => all.find((ind) => ind.id === id)).filter((x): x is Indicator => !!x);
  const rest = all.filter((ind) => !list.includes(ind.id));
  const remember = (id: string, action: FocusControl) => rememberFocus(list, id, action);
  return (
    <div className="flex flex-col gap-2" data-testid="my-indicators-bar">
      <FocusRestorer list={list} />
      <div data-drag-group="" className="flex flex-col">
        {mine.map((ind, pos) => (
          // Wiersz wołany jak funkcja (bez hooków), żeby drzewo zwracane przez pasek zawierało jego przyciski.
          IndicatorRow({ ind, pos, count: mine.length, reorder, active: ind.id === activeId, onChange: remember, onRemove })
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" data-control="add" aria-expanded={open} onClick={onToggle} className={CHIP}>
          + Dodaj wskaźnik
        </button>
        {!basic && (
          <button type="button" onClick={onReset} className={CHIP}>
            Przywróć podstawowe
          </button>
        )}
      </div>
      {open && (
        <ul aria-label="Wskaźniki do dodania" className="flex flex-wrap gap-2 list-none p-0 m-0">
          {rest.map((ind) => (
            <li key={ind.id}>
              <button type="button" onClick={() => onAdd(ind.id)} className={CHIP}>
                {ind.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
