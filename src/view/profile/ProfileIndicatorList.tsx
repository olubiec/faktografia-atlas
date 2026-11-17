import { useState } from "react";
import { Plus, Xmark } from "iconoir-react";
import type { ProfileIndicatorItem } from "../../core/profile/profile";
import type { Unit } from "../../core/units/types";
import type { Footnote } from "../../core/profile/footnotes";
import { isBasic } from "../../core/my-indicators/my-indicators";
import { useMyIndicators } from "../hooks/useMyIndicators";
import { Icon } from "../ui/Icon";
import { ProfileIndicatorRow } from "./ProfileIndicatorRow";

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
  const { list, add, remove, reset } = useMyIndicators();
  const [pickerOpen, setPickerOpen] = useState(false);

  const shown = personalize
    ? items.filter((i) => list.includes(i.indicatorId))
    : items;
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
            <div>
              {groupItems.map((item) => (
                <div key={item.indicatorId} className="flex items-start gap-1">
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
              ))}
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
        <div
          className="mt-3 border border-linia bg-arkusz"
          role="group"
          aria-label="Wskaźniki do dodania"
        >
          {groupBy(available).map(([groupName, groupItems]) => (
            <div key={groupName} className="p-2">
              <h3 className="text-xs font-bold tracking-wider text-olowek mb-1">
                {groupName}
              </h3>
              {groupItems.map((item) => (
                <button
                  key={item.indicatorId}
                  type="button"
                  onClick={() => add(item.indicatorId)}
                  className="w-full min-h-[44px] px-2 py-2 text-left text-sm text-tusz hover:bg-linia/15 focus:outline-none focus:ring-2 focus:ring-tusz cursor-pointer"
                >
                  {`Dodaj: ${item.indicator.name}`}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
