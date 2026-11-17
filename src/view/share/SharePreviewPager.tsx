import React, { useRef } from 'react';
import { NavArrowLeft, NavArrowRight } from 'iconoir-react';
import { Icon } from '../ui/Icon';

/** Minimalne przesunięcie palcem (px), od którego zmieniamy kartę. */
export const SWIPE_THRESHOLD = 40;

export interface SharePreviewPagerProps {
  /** Numer bieżącej karty od 0. */
  index: number;
  total: number;
  /** Id karty (wpisu zestawu) widocznej w podglądzie. */
  cardId: string;
  onChange: (index: number) => void;
  children: React.ReactNode;
}

const ARROW =
  'min-h-[44px] min-w-[44px] shrink-0 flex items-center justify-center border border-linia text-tusz hover:bg-kalka transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

/** Podgląd karty z przełączaniem stron zestawu: strzałki, licznik „n / N”, kropki i przesunięcie palcem. Dla N ≤ 1 bez sterowania. */
export const SharePreviewPager: React.FC<SharePreviewPagerProps> = ({ index, total, cardId, onChange, children }) => {
  const startX = useRef<number | null>(null);
  const go = (i: number) => {
    if (i >= 0 && i < total) onChange(i);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    go(dx < 0 ? index + 1 : index - 1);
  };

  return (
    <div className="flex flex-col gap-2 w-full min-w-0 max-w-full">
      <div
        data-testid="share-preview"
        data-card-id={cardId}
        onPointerDown={total > 1 ? onPointerDown : undefined}
        onPointerUp={total > 1 ? onPointerUp : undefined}
        onPointerCancel={() => {
          startX.current = null;
        }}
        className="min-h-[220px] w-full min-w-0 flex items-center justify-center p-2 sm:p-3 bg-kalka border border-linia overflow-hidden max-w-full touch-pan-y"
      >
        {children}
      </div>
      {total > 1 && (
        <div data-testid="preview-pager" className="flex items-center justify-center gap-2 min-w-0">
          <button type="button" className={ARROW} disabled={index <= 0} onClick={() => go(index - 1)} aria-label="Poprzednia karta">
            <Icon icon={NavArrowLeft} size={18} aria-hidden={true} />
          </button>
          <span data-testid="preview-pager-counter" aria-live="polite" className="text-sm font-semibold tabular-nums min-w-[4rem] text-center">
            {index + 1} / {total}
          </span>
          <div className="flex items-center gap-1 min-w-0 flex-wrap justify-center" aria-hidden="true">
            {Array.from({ length: total }, (_, i) => (
              <span
                key={i}
                data-testid="preview-pager-dot"
                className={`w-2 h-2 border border-tusz ${i === index ? 'bg-tusz' : 'bg-transparent'}`}
              />
            ))}
          </div>
          <button type="button" className={ARROW} disabled={index >= total - 1} onClick={() => go(index + 1)} aria-label="Następna karta">
            <Icon icon={NavArrowRight} size={18} aria-hidden={true} />
          </button>
        </div>
      )}
    </div>
  );
};
