import { useDragReorder, type DragState } from '../ui/useDragReorder';

type Handlers = ReturnType<typeof useDragReorder>['handlers'];
type Move = (id: string, direction: -1 | 1, steps?: number) => void;

export interface IndicatorReorder {
  drag: DragState | null;
  handlers: Handlers;
  move: Move;
}

/** Przeciąganie wskaźników z listy „Moje wskaźniki”: upuszczenie przesuwa o tyle miejsc, ile minięto wierszy. */
export function useIndicatorReorder(list: readonly string[], move: Move): IndicatorReorder {
  const { drag, handlers } = useDragReorder((id, from, to) => {
    const neighbor = list[to];
    if (neighbor) move(id, to < from ? -1 : 1, Math.abs(list.indexOf(neighbor) - list.indexOf(id)));
  });
  return { drag, handlers, move };
}
