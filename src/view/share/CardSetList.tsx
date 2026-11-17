import React from 'react';
import { NavArrowDown, NavArrowUp, Xmark } from 'iconoir-react';
import { Icon } from '../ui/Icon';
import type { CardSetEntry, CardSetPosition } from '../../core/share/card-set';

export interface CardSetListProps {
  set: readonly CardSetEntry[];
  positions: readonly CardSetPosition[];
  previewId: string | null;
  onPreview: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, delta: -1 | 1) => void;
  onReset: () => void;
}

const ICON_BTN =
  'min-h-[44px] min-w-[44px] shrink-0 flex items-center justify-center border border-linia text-tusz hover:bg-kalka transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

/** Lista kart zestawu „Pobierz wszystkie”: podgląd, przesunięcie w górę/w dół i usunięcie (bez przeciągania). */
export const CardSetList: React.FC<CardSetListProps> = ({ set, positions, previewId, onPreview, onRemove, onMove, onReset }) => {
  const labelOf = (id: string) => positions.find((p) => p.id === id)?.label ?? '';
  const total = positions[0]?.total ?? 0;

  return (
    <section aria-labelledby="card-set-title" className="flex flex-col gap-2 max-w-full min-w-0" data-testid="card-set">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="card-set-title" className="text-xs font-semibold text-olowek tracking-wider">
          Zestaw do pobrania <span data-testid="card-set-total">({total})</span>
        </h3>
        <button
          type="button"
          onClick={onReset}
          className="min-h-[44px] min-w-[44px] px-3 text-xs font-medium text-olowek hover:text-tusz border border-transparent hover:border-linia transition-colors"
        >
          Przywróć wszystkie
        </button>
      </div>

      {set.length === 0 ? (
        <p className="text-sm text-olowek">Usunięto wszystkie karty. Użyj „Przywróć wszystkie”.</p>
      ) : (
        <ol className="flex flex-col gap-1.5 max-w-full min-w-0">
          {set.map((e, i) => {
            const pos = labelOf(e.id);
            const isPreview = previewId === e.id;
            return (
              <li key={e.id} data-testid="card-set-item" data-card-id={e.id} className="flex items-stretch gap-1.5 max-w-full min-w-0">
                <button
                  type="button"
                  onClick={() => onPreview(e.id)}
                  aria-pressed={isPreview}
                  className={`min-h-[44px] flex-1 min-w-0 px-3 py-2 flex items-center gap-2 text-left text-sm border transition-colors ${
                    isPreview ? 'bg-tusz text-kalka border-tusz' : 'bg-arkusz text-tusz border-linia hover:bg-kalka'
                  }`}
                >
                  <span data-testid="card-set-position" className="shrink-0 font-semibold tabular-nums">{pos}</span>
                  <span className="min-w-0 break-words">{e.label}</span>
                </button>
                <button type="button" className={ICON_BTN} disabled={i === 0} onClick={() => onMove(e.id, -1)} aria-label={`Przesuń wyżej: ${e.label}`}>
                  <Icon icon={NavArrowUp} size={18} aria-hidden={true} />
                </button>
                <button type="button" className={ICON_BTN} disabled={i === set.length - 1} onClick={() => onMove(e.id, 1)} aria-label={`Przesuń niżej: ${e.label}`}>
                  <Icon icon={NavArrowDown} size={18} aria-hidden={true} />
                </button>
                <button type="button" className={ICON_BTN} onClick={() => onRemove(e.id)} aria-label={`Usuń kartę: ${e.label}`}>
                  <Icon icon={Xmark} size={18} aria-hidden={true} />
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};
