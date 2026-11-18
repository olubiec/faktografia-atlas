import type { ChangeEvent } from 'react';
import { IndicatorPicker } from '@/view/controls/IndicatorPicker';
import { LEVEL_LABELS } from '@/core/map/main-view';
import type { RankingsState } from '@/core/ranking/rankings-url';
import type { Indicator } from '@/core/profile/profile';
import type { UnitLevel } from '@/core/units/types';
import { cn } from '@/lib/utils';

export interface RankingsFiltersProps {
  state: RankingsState;
  indicators: Indicator[];
  years: number[];
  availableLevels: UnitLevel[];
  voivodeships: { teryt: string; name: string }[];
  onChange: (patch: Partial<RankingsState>) => void;
}

const LEVELS: UnitLevel[] = ['woj', 'pow', 'gmi'];
const NO_DATA_HINT = 'Ten wskaźnik nie ma danych na tym poziomie';
const SELECT_CLASS =
  'min-h-[44px] w-full min-w-0 px-3 text-sm bg-arkusz text-tusz border border-linia rounded-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tusz disabled:text-olowek/60 disabled:cursor-not-allowed';

/** Pasek wyboru rankingu: wskaźnik, poziom, rok, województwo. Bez własnego stanu – wszystko z propsów. */
export function RankingsFilters({
  state,
  indicators,
  years,
  availableLevels,
  voivodeships,
  onChange,
}: RankingsFiltersProps) {
  const sortedYears = Array.from(new Set(years)).sort((a, b) => b - a);
  const year = state.y ?? sortedYears[0];
  const showVoivodeship = state.l === 'pow' || state.l === 'gmi';

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-0 basis-full sm:basis-64">
        <IndicatorPicker
          indicators={indicators}
          value={state.i}
          onChange={(i) => onChange({ i })}
        />
      </div>

      <div role="radiogroup" aria-label="Poziom" className="flex min-w-0 border border-linia">
        {LEVELS.map((level) => {
          const enabled = availableLevels.includes(level);
          const active = level === state.l;
          return (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={active}
              aria-disabled={enabled ? undefined : 'true'}
              title={enabled ? undefined : NO_DATA_HINT}
              onClick={() => {
                if (enabled) onChange({ l: level });
              }}
              className={cn(
                'min-h-[44px] px-3 text-sm rounded-none border-0 cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tusz focus-visible:ring-inset',
                active ? 'bg-tusz text-arkusz font-semibold' : 'bg-arkusz text-tusz hover:bg-linia/20',
                !enabled && 'text-olowek/60 cursor-not-allowed hover:bg-arkusz'
              )}
            >
              {LEVEL_LABELS[level]}
            </button>
          );
        })}
      </div>

      <select
        aria-label="Rok"
        className={cn(SELECT_CLASS, 'basis-28 sm:w-28')}
        disabled={sortedYears.length === 0}
        value={year === undefined ? '' : String(year)}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange({ y: Number(e.target.value) })}
      >
        {sortedYears.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </select>

      {showVoivodeship && (
        <select
          aria-label="Województwo"
          className={cn(SELECT_CLASS, 'basis-48 sm:w-48')}
          value={state.w ?? ''}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange({ w: e.target.value || null })}
        >
          <option value="">Cała Polska</option>
          {voivodeships.map((v) => (
            <option key={v.teryt} value={v.teryt}>
              {v.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
