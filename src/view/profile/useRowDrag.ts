import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import { dropIndex } from "../../core/profile/indicator-order";

export interface RowDrag {
  id: string;
  /** Przesunięcie wiersza za palcem (px, oś Y). */
  dy: number;
  /** Miejsce w grupie, na którym wiersz wylądowałby po puszczeniu. */
  to: number;
}

interface Start {
  id: string;
  from: number;
  startY: number;
  mids: number[];
}

/**
 * Przeciąganie wiersza za uchwyt (mysz i dotyk) w obrębie jednej grupy.
 * Uchwyt ma `touch-action: none`, więc palec na nim nie przewija strony, a reszta wiersza przewija jak zwykle.
 */
export function useRowDrag(onDrop: (id: string, from: number, to: number) => void) {
  const [drag, setDrag] = useState<RowDrag | null>(null);
  const start = useRef<Start | null>(null);

  const begin = (e: PointerEvent<HTMLElement>, id: string, from: number) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const group = e.currentTarget.closest("[data-drag-group]");
    if (!group) return;
    const mids = [...group.querySelectorAll<HTMLElement>("[data-row-id]")].map((row) => {
      const b = row.getBoundingClientRect();
      return b.top + b.height / 2;
    });
    start.current = { id, from, startY: e.clientY, mids };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ id, dy: 0, to: from });
  };

  const track = (e: PointerEvent<HTMLElement>) => {
    const s = start.current;
    if (!s) return;
    setDrag({ id: s.id, dy: e.clientY - s.startY, to: dropIndex(s.mids, s.from, e.clientY) });
  };

  const finish = (e: PointerEvent<HTMLElement>, commit: boolean) => {
    const s = start.current;
    start.current = null;
    setDrag(null);
    if (!s || !commit) return;
    const to = dropIndex(s.mids, s.from, e.clientY);
    if (to !== s.from) onDrop(s.id, s.from, to);
  };

  const handlers = (id: string, from: number) => ({
    onPointerDown: (e: PointerEvent<HTMLElement>) => begin(e, id, from),
    onPointerMove: track,
    onPointerUp: (e: PointerEvent<HTMLElement>) => finish(e, true),
    onPointerCancel: (e: PointerEvent<HTMLElement>) => finish(e, false),
  });

  return { drag, handlers };
}
