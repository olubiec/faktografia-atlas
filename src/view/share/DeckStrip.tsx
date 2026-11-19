import { useEffect, useRef, type ReactNode } from 'react';
import { Xmark, NavArrowLeft, NavArrowRight, Plus } from 'iconoir-react';
import { Icon } from '../ui/Icon';
import type { PageKind } from '../../core/share/deck';

export type StripPage = { id: string; kind: PageKind; label: string; title: string };

export type DeckStripProps = {
  pages: StripPage[];
  currentId: string;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onAdd: () => void;
  canRemove: boolean;
  /** Zamiast własnego przycisku „Dodaj stronę” (np. menu wyboru rodzaju strony). */
  addSlot?: ReactNode;
};

const KIND_NAMES: Record<PageKind, string> = {
  map: 'Mapa',
  ranking: 'Ranking',
  table: 'Tabela',
  bignumber: 'Duża liczba',
  trend: 'Wykres lat',
  histogram: 'Rozkład',
  profile: 'Profil',
  compare: 'Porównanie',
  versus: 'A vs B',
};

// Po usunięciu fokus idzie na następny kafelek, a gdy go nie ma – na poprzedni; ostatnia strona → „+”.
function focusTargetAfterRemove(ids: string[], removedId: string): string {
  const i = ids.indexOf(removedId);
  const rest = ids.filter((id) => id !== removedId);
  if (rest.length === 0) return 'add';
  return ids[i + 1] ?? ids[i - 1] ?? 'add';
}

const BTN_BASE = 'min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-linia focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tusz disabled:opacity-40 disabled:cursor-not-allowed';

const BTN = `${BTN_BASE} text-tusz`;

type TilesProps = DeckStripProps;

// Same kafelki (bez haków) – wydzielone, żeby dało się je sprawdzić bez DOM.
export function StripTiles({ pages, currentId, onSelect, onRemove, onMove, onAdd, canRemove, addSlot }: TilesProps) {
  return (
    <>
      {pages.map((p, i) => {
        const name = p.title || KIND_NAMES[p.kind];
        const ref = `${i + 1} (${name})`;
        const isCurrent = p.id === currentId;
        return (
          <div key={p.id} className="flex shrink-0 snap-start items-stretch">
            <button
              type="button"
              data-strip-tile={p.id}
              aria-current={isCurrent ? 'true' : undefined}
              onClick={() => onSelect(p.id)}
              className={`${BTN_BASE} px-3 text-xs font-medium whitespace-nowrap ${isCurrent ? 'bg-tusz text-kalka' : 'bg-arkusz text-tusz hover:bg-kalka'}`}
            >
              {`${p.label} ${name}`}
            </button>
            <button
              type="button"
              disabled={i === 0}
              aria-label={`Przesuń stronę ${ref} w lewo`}
              onClick={() => onMove(p.id, -1)}
              className={`${BTN} bg-arkusz`}
            >
              <Icon icon={NavArrowLeft} size={16} aria-hidden />
            </button>
            <button
              type="button"
              disabled={i === pages.length - 1}
              aria-label={`Przesuń stronę ${ref} w prawo`}
              onClick={() => onMove(p.id, 1)}
              className={`${BTN} bg-arkusz`}
            >
              <Icon icon={NavArrowRight} size={16} aria-hidden />
            </button>
            <button
              type="button"
              disabled={!canRemove}
              aria-label={`Usuń stronę ${ref}`}
              onClick={() => onRemove(p.id)}
              className={`${BTN} bg-arkusz`}
            >
              <Icon icon={Xmark} size={16} aria-hidden />
            </button>
          </div>
        );
      })}
      {addSlot ? <div data-strip-add-slot="" className="shrink-0 snap-start sticky right-0 bg-arkusz">{addSlot}</div> : <button
        type="button"
        data-strip-add=""
        onClick={onAdd}
        className={`${BTN} shrink-0 snap-start sticky right-0 gap-1 bg-arkusz px-3 text-xs font-medium whitespace-nowrap`}
      >
        <Icon icon={Plus} size={16} aria-hidden />
        Dodaj stronę
      </button>}
    </>
  );
}

export function DeckStrip(props: DeckStripProps) {
  const { pages, currentId, onRemove } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<string | null>(null);

  // Bieżąca strona przewija się do widoku wewnątrz paska; bez animacji przy reduced-motion.
  useEffect(() => {
    const el = rootRef.current?.querySelector<HTMLElement>(`[data-strip-tile="${currentId}"]`);
    if (!el || typeof el.scrollIntoView !== 'function') return;
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }, [currentId, pages.length]);

  // Po usunięciu strony przywracamy fokus na sąsiada.
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    const sel = target === 'add' ? '[data-strip-add], [data-strip-add-slot] button' : `[data-strip-tile="${target}"]`;
    rootRef.current?.querySelector<HTMLElement>(sel)?.focus();
  }, [pages]);

  const handleRemove = (id: string) => {
    pendingFocus.current = focusTargetAfterRemove(pages.map((p) => p.id), id);
    onRemove(id);
  };

  return (
    <div
      ref={rootRef}
      className={`flex w-full max-w-full gap-2 pb-1 ${pages.length > 1 ? 'snap-x snap-mandatory overflow-x-auto' : 'flex-wrap'}`}
      role="group"
      aria-label="Strony zestawu"
    >
      <StripTiles {...props} onRemove={handleRemove} />
    </div>
  );
}

// Udostępnione testom jako właściwość komponentu (plik eksportuje tylko komponenty).
DeckStrip.focusTargetAfterRemove = focusTargetAfterRemove;
