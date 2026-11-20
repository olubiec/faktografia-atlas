import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import { dropIndex } from "../../core/profile/indicator-order";

export interface DragState {
  id: string;
  /** Przesunięcie elementu za palcem (px, w osi przeciągania). */
  offset: number;
  /** Miejsce w grupie, na którym wiersz wylądowałby po puszczeniu. */
  to: number;
}

interface Start {
  id: string;
  from: number;
  start0: number;
  mids: number[];
}

/**
 * Przeciąganie elementu za uchwyt (mysz i dotyk) w obrębie jednej grupy ([data-drag-group] > [data-row-id]).
 * Uchwyt ma `touch-action: none`, więc palec na nim nie przewija strony, a reszta wiersza przewija jak zwykle.
 */
export function useDragReorder(
  onDrop: (id: string, from: number, to: number) => void,
  axis: "x" | "y" = "y",
) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const pos = (e: PointerEvent<HTMLElement>) => (axis === "x" ? e.clientX : e.clientY);
  const start = useRef<Start | null>(null);

  const begin = (e: PointerEvent<HTMLElement>, id: string, from: number) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const group = e.currentTarget.closest("[data-drag-group]");
    if (!group) return;
    const mids = [...group.querySelectorAll<HTMLElement>("[data-row-id]")].map((row) => {
      const b = row.getBoundingClientRect();
      return axis === "x" ? b.left + b.width / 2 : b.top + b.height / 2;
    });
    start.current = { id, from, start0: pos(e), mids };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ id, offset: 0, to: from });
  };

  const track = (e: PointerEvent<HTMLElement>) => {
    const s = start.current;
    if (!s) return;
    setDrag({ id: s.id, offset: pos(e) - s.start0, to: dropIndex(s.mids, s.from, pos(e)) });
  };

  const finish = (e: PointerEvent<HTMLElement>, commit: boolean) => {
    const s = start.current;
    start.current = null;
    setDrag(null);
    if (!s || !commit) return;
    const to = dropIndex(s.mids, s.from, pos(e));
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
