import type { ChangeEvent } from 'react';
import { DataMenuWindow } from '@/view/data-menu/DataMenuWindow';
import { LevelSwitch } from '@/view/main/LevelSwitch';
import { EndSwitch } from '@/view/start/EndSwitch';
import { useIsMobile } from '@/view/hooks/useIsMobile';
import type { RankingsState } from '@/core/ranking/rankings-url';
import type { Indicator } from '@/core/profile/profile';
import type { UnitLevel } from '@/core/units/types';

export interface RankingsToolbarProps {
  state: RankingsState;
  indicator: Indicator;
  years: number[];
  year: number | null;
  /** Poziomy z danymi (bieżący rok); brak = bez ograniczenia. */
  withData?: UnitLevel[];
  libraryLevels?: UnitLevel[];
  voivodeships: { teryt: string; name: string }[];
  onChange: (patch: Partial<RankingsState>) => void;
}

const SELECT = 'min-h-[44px] min-w-0 border border-linia bg-arkusz px-3 text-sm text-tusz cursor-pointer focus-visible:outline-2 focus-visible:outline-tusz';

/**
 * Pasek rankingu jak przy mapie i na starcie: „Wybierz dane” (pełne menu), poziom, województwo,
 * „Najwyższe | Najniższe” i rok. Bez własnego stanu: wszystko z propsów i adresu strony.
 */
export function RankingsToolbar({ state, indicator, years, year, withData, libraryLevels, voivodeships, onChange }: RankingsToolbarProps) {
  const mobile = useIsMobile();
  const sortedYears = Array.from(new Set(years)).sort((a, b) => b - a);
  return (
    <div className="flex flex-col gap-3" data-slot="rankings-toolbar">
      <div className="max-w-xl">
        <DataMenuWindow
          indicatorId={indicator.id}
          indicatorName={indicator.name}
          year={year}
          onSelect={(i) => onChange({ i })}
          layout={mobile ? 'stack' : 'columns'}
          syncUrl={false}
          triggerSlot="rankings-pick"
        />
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <LevelSwitch value={state.l} minLevel={indicator.minLevel} {...(libraryLevels?.length ? { levels: libraryLevels } : {})} {...(withData ? { withData } : {})} onChange={(l) => onChange({ l })} />
        {state.l !== 'woj' && (
          <select aria-label="Województwo" className={`${SELECT} sm:w-56`} value={state.w ?? ''} onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange({ w: e.target.value || null })}>
            <option value="">Cała Polska</option>
            {voivodeships.map((v) => <option key={v.teryt} value={v.teryt}>{v.name}</option>)}
          </select>
        )}
        <EndSwitch value={state.d} onChange={(d) => onChange({ d })} />
        <select aria-label="Rok" className={`${SELECT} w-28`} disabled={sortedYears.length === 0} value={year == null ? '' : String(year)} onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange({ y: Number(e.target.value) })}>
          {sortedYears.map((y) => <option key={y} value={String(y)}>{y}</option>)}
        </select>
      </div>
    </div>
  );
}
