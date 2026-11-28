import { NavArrowLeft, NavArrowRight } from 'iconoir-react';
import { useRef, type KeyboardEvent } from 'react';
import { Icon } from '@/view/ui/Icon';
import { ringWindow, wrapIndex } from '@/core/start/ring';
import { useSwipe } from './useSwipe';

export interface StripItem {
  key: string;
  title: string;
  /** Dopisek tylko dla czytników ekranu (np. „z biblioteki”). */
  note?: string;
}

export interface IndicatorStripProps {
  /** Ile pozycji ma pierścień (zestawienia redakcyjne i cała biblioteka). */
  size: number;
  /** Opis pozycji; wołany tylko dla tych, które są w oknie na ekranie. */
  itemAt: (index: number) => StripItem;
  /** Zaznaczona pozycja: ta, którą wybrał użytkownik; stoi zawsze na środku paska. */
  active: number;
  onSelect: (index: number) => void;
  /** Identyfikator panelu pod paskiem (aria-controls). */
  panelId: string;
  idBase: string;
}

/** Ile pozycji widać z każdej strony zaznaczonej (reszta pierścienia nie jest w DOM). */
const RADIUS = 6;

const SIDE = 'hidden min-h-[44px] w-11 shrink-0 cursor-pointer items-center justify-center border-b border-linia bg-transparent text-tusz hover:bg-linia/20 focus-visible:outline-2 focus-visible:outline-tusz md:flex';

/**
 * Pasek wskaźników: zakładki według wzorca ARIA w pierścieniu bez końca. Za ostatnim wskaźnikiem jest pierwszy,
 * przed pierwszym ostatni; zaznaczona pozycja stoi na środku i ma grubą kreskę korekty (jedyny czerwony element sekcji).
 * Strzałki po bokach i klawisze ←/→ przesuwają o jedną pozycję, Home i End skaczą na początek i koniec listy,
 * Tab przechodzi do treści. W DOM jest tylko okno wokół zaznaczonej, więc tysiące wskaźników nie spowalniają strony.
 */
export function IndicatorStrip({ size, itemAt, active, onSelect, panelId, idBase }: IndicatorStripProps) {
  const tabs = useRef(new Map<number, HTMLButtonElement>());
  const go = (index: number) => onSelect(wrapIndex(index, size));
  // Przesunięcie palcem po pasku działa jak karuzela: w lewo następny wskaźnik, w prawo poprzedni.
  const swipe = useSwipe(() => go(active - 1), () => go(active + 1));

  const onKey = (e: KeyboardEvent, k: number) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? size - 1 : step ? wrapIndex(k + step, size) : -1;
    if (to < 0) return;
    e.preventDefault();
    onSelect(to);
    // Fokus przechodzi na nowo zaznaczoną zakładkę po jej narysowaniu.
    window.requestAnimationFrame(() => tabs.current.get(to)?.focus());
  };

  return (
    <div className="flex" data-slot="indicator-strip-wrap">
      <button type="button" className={SIDE} onClick={() => go(active - 1)} aria-label="Poprzedni wskaźnik" data-slot="strip-scroll-left">
        <Icon icon={NavArrowLeft} aria-hidden={true} size={18} />
      </button>
      <div role="tablist" aria-label="Wybierz zestawienie" data-slot="indicator-strip" className="relative flex min-w-0 flex-1 touch-pan-y justify-center overflow-hidden border-b border-linia" {...swipe}>
        {ringWindow(size, active, RADIUS).map(({ index, offset }) => {
          const it = itemAt(index);
          const on = offset === 0;
          return (
            <button
              key={index}
              ref={(el) => {
                if (el) tabs.current.set(index, el);
                else tabs.current.delete(index);
              }}
              type="button"
              role="tab"
              id={`${idBase}-tab-${index}`}
              aria-selected={on}
              aria-controls={panelId}
              aria-posinset={index + 1}
              aria-setsize={size}
              tabIndex={on ? 0 : -1}
              onClick={() => onSelect(index)}
              onKeyDown={(e) => onKey(e, index)}
              className={`flex h-20 w-40 shrink-0 cursor-pointer items-end border-b-4 px-3 py-2 text-left text-sm leading-tight focus-visible:outline-2 focus-visible:outline-tusz ${on ? 'border-korekta font-bold text-tusz' : 'border-transparent text-olowek hover:text-tusz'}`}
            >
              <span className="line-clamp-3" title={it.title}>{it.title}</span>
              {it.note && <span className="sr-only"> {it.note}</span>}
            </button>
          );
        })}
      </div>
      <button type="button" className={SIDE} onClick={() => go(active + 1)} aria-label="Następny wskaźnik" data-slot="strip-scroll-right">
        <Icon icon={NavArrowRight} aria-hidden={true} size={18} />
      </button>
    </div>
  );
}
