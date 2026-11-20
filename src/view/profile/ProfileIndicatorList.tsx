import { useState } from "react";
import type { KeyboardEvent } from "react";
import { MoreVert, Plus, Xmark } from "iconoir-react";
import type { ProfileIndicatorItem } from "../../core/profile/profile";
import type { Unit } from "../../core/units/types";
import type { Footnote } from "../../core/profile/footnotes";
import { isBasic } from "../../core/my-indicators/my-indicators";
import { orderByList, stepsToNeighbor } from "../../core/profile/indicator-order";
import { useMyIndicators } from "../hooks/useMyIndicators";
import { Icon } from "../ui/Icon";
import { useDragReorder } from "../ui/useDragReorder";
import { ProfileIndicatorRow } from "./ProfileIndicatorRow";
import { AddIndicatorWindow } from "./AddIndicatorWindow";

export interface ProfileIndicatorListProps {
  /** Wskaźniki do wyboru (bez bieżącego, który jest w przeglądzie). */
  items: ProfileIndicatorItem[];
  units: Unit[];
  footnotes: Footnote[];
  /** Bez wyboru (np. profil bez widoku mapy): pokazujemy wszystkie wskaźniki, bez dodawania i usuwania. */
  personalize?: boolean;
}

const BTN =
  "min-h-[44px] min-w-[44px] px-4 py-2 bg-arkusz border border-linia hover:bg-linia/15 focus:outline-none focus:ring-2 focus:ring-tusz text-xs font-semibold text-tusz cursor-pointer transition-colors flex items-center justify-center gap-2";

function groupBy(
  items: ProfileIndicatorItem[],
): [string, ProfileIndicatorItem[]][] {
  const groups = new Map<string, ProfileIndicatorItem[]>();
  for (const item of items) {
    const g = item.indicator.group || "Inne";
    groups.set(g, [...(groups.get(g) ?? []), item]);
  }
  return [...groups.entries()];
}

const GRIP_BTN =
  "min-h-[44px] min-w-[44px] flex items-center justify-center text-olowek hover:text-tusz hover:bg-linia/15 focus:outline-none focus:ring-2 focus:ring-tusz cursor-grab touch-none select-none shrink-0";

/**
 * Lista wskaźników w profilu: domyślnie mały zestaw „Moje wskaźniki”,
 * każdy z przyciskiem usuwania; resztę dodaje się przyciskiem „Dodaj wskaźnik”.
 */
export function ProfileIndicatorList({
  items,
  units,
  footnotes,
  personalize = true,
}: ProfileIndicatorListProps) {
  const { list, add, remove, reset, move } = useMyIndicators();
  const [pickerOpen, setPickerOpen] = useState(false);

  const { drag, handlers } = useDragReorder((id, from, to) => {
    const group = groupBy(orderByList(items, list)).find(([, g]) => g.some((i) => i.indicatorId === id))?.[1];
    const neighbor = group?.[to]?.indicatorId;
    if (neighbor) move(id, to < from ? -1 : 1, stepsToNeighbor(list, id, neighbor));
  });

  const shown = personalize ? orderByList(items, list) : items;
  const available = personalize
    ? items.filter((i) => !list.includes(i.indicatorId))
    : [];

  return (
    <div className="my-2" data-testid="profile-indicator-list">
      {personalize && shown.length === 0 && (
        <p className="py-4 text-sm text-olowek text-center">
          Nie wybrano żadnych wskaźników. Dodaj pierwszy.
        </p>
      )}
      <div className="divide-y divide-linia">
        {groupBy(shown).map(([groupName, groupItems]) => (
          <div key={groupName} className="pt-4 pb-2 first:pt-2">
            <h3 className="text-xs font-bold tracking-wider text-olowek mb-2">
              {groupName}
            </h3>
            <div data-drag-group="">
              {groupItems.map((item, pos) => {
                const dragged = drag?.id === item.indicatorId;
                const target = drag && !dragged && drag.to === pos;
                const key = (e: KeyboardEvent<HTMLElement>) => {
                  if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
                  const dir = e.key === "ArrowUp" ? -1 : 1;
                  const steps = stepsToNeighbor(list, item.indicatorId, groupItems[pos + dir]?.indicatorId);
                  if (steps) {
                    e.preventDefault();
                    move(item.indicatorId, dir, steps);
                  }
                };
                return (
                // Linia oddzielająca wiersze jest tu, bo „last:border-b-0” w wierszu liczy się w jego własnym opakowaniu.
                <div
                  key={item.indicatorId}
                  data-row-id={item.indicatorId}
                  style={dragged ? { transform: `translateY(${drag.offset}px)` } : undefined}
                  className={`flex items-start gap-1 border-b border-linia last:border-b-0 ${
                    dragged ? "relative z-10 bg-arkusz opacity-80" : target ? "bg-linia/15" : ""
                  }`}
                >
                  {personalize && (
                    <button
                      type="button"
                      aria-label={`Przeciągnij, aby zmienić kolejność: ${item.indicator.name}`}
                      onKeyDown={key}
                      className={GRIP_BTN}
                      {...handlers(item.indicatorId, pos)}
                    >
                      <Icon icon={MoreVert} aria-hidden={true} size={16} />
                    </button>
                  )}
                  <div className="flex-1 min-w-0">
                    <ProfileIndicatorRow
                      item={item}
                      units={units}
                      footnotes={footnotes}
                    />
                  </div>
                  {personalize && (
                    <button
                      type="button"
                      onClick={() => remove(item.indicatorId)}
                      aria-label={`Usuń wskaźnik: ${item.indicator.name}`}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-olowek hover:text-tusz hover:bg-linia/15 focus:outline-none focus:ring-2 focus:ring-tusz cursor-pointer shrink-0"
                    >
                      <Icon icon={Xmark} aria-hidden={true} size={16} />
                    </button>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {personalize && (
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <button
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            aria-expanded={pickerOpen}
            disabled={available.length === 0}
            className={`${BTN} disabled:opacity-50 disabled:cursor-default`}
          >
            <Icon icon={Plus} size={16} aria-hidden={true} />
            <span>Dodaj wskaźnik</span>
          </button>
          {!isBasic(list) && (
            <button type="button" onClick={reset} className={BTN}>
              Przywróć podstawowe
            </button>
          )}
        </div>
      )}

      {personalize && pickerOpen && available.length > 0 && (
        <AddIndicatorWindow items={available} onAdd={add} />
      )}
    </div>
  );
}
