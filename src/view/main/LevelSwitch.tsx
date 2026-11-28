import type { UnitLevel } from '@/core/units/types';
import { LEVEL_LABELS, allowedLevels } from '@/core/map/main-view';
import { cn } from '@/lib/utils';

export interface LevelSwitchProps {
  value: UnitLevel;
  minLevel: UnitLevel;
  /** Poziomy, na których są dane (wskaźniki z biblioteki); brak = wg minLevel. */
  levels?: UnitLevel[];
  /** Poziomy z wartościami dla bieżącego wskaźnika i roku; poziom spoza listy jest wyłączony. Brak = bez tego ograniczenia. */
  withData?: UnitLevel[];
  onChange: (level: UnitLevel) => void;
}

const LEVELS: UnitLevel[] = ['woj', 'pow', 'gmi'];

/** Przełącznik poziomu: Województwa / Powiaty / Gminy. Poziomy bez danych GUS są wyłączone z wyjaśnieniem. */
export function LevelSwitch({ value, minLevel, levels, withData, onChange }: LevelSwitchProps) {
  const allowed = allowedLevels(minLevel);
  return (
    <div role="group" aria-label="Poziom" className="flex border border-linia">
      {LEVELS.map((level) => {
        const byConfig = levels && levels.length > 0 ? levels.includes(level) : allowed.includes(level);
        const enabled = byConfig && (!withData || withData.includes(level));
        const active = level === value;
        return (
          <button
            key={level}
            type="button"
            aria-pressed={active}
            disabled={!enabled}
            title={enabled ? undefined : 'GUS nie podaje tych danych na tym poziomie'}
            onClick={() => onChange(level)}
            className={cn(
              'flex-1 min-h-[44px] px-2 text-sm rounded-none border-0 cursor-pointer',
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
  );
}
