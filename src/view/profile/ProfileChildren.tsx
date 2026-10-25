import type { UnitProfile } from '../../core/profile/profile';
import type { Unit } from '../../core/units/types';
import type { MainView } from '../map/hooks/useMainView';
import { childUnits } from '../../core/profile/sections';
import { unitLabel } from '../../core/units/label';
import { formatValue } from '../../core/format/number';

export interface ProfileChildrenProps {
  profile: UnitProfile;
  units: Unit[];
  view?: MainView;
  onSelectUnit?: (teryt: string) => void;
}

interface ChildUnitRow {
  unit: Unit;
  teryt: string;
  label: string;
  formattedValue: string;
  numericValue: number | null;
}

/**
 * Komponent zakładek z listą jednostek podrzędnych (Powiaty / Gminy).
 * Wyświetla listę jednostek posortowaną malejąco według wartości bieżącego wskaźnika,
 * z brakami danych na końcu.
 */
export function ProfileChildren({
  profile,
  units,
  view,
  onSelectUnit,
}: ProfileChildrenProps) {
  if (!profile.unit) {
    return (
      <p className="py-6 text-sm text-olowek text-center">
        Brak jednostek podrzędnych.
      </p>
    );
  }

  const childrenResult = childUnits(profile.unit, units);

  if (childrenResult.units.length === 0) {
    return (
      <p className="py-6 text-sm text-olowek text-center">
        Brak jednostek podrzędnych.
      </p>
    );
  }

  const activeIndicator = view?.indicator;
  const currentYear = view?.year;

  const rows: ChildUnitRow[] = childrenResult.units.map((unit) => {
    const label = unitLabel(unit, { short: true, sameParentUnits: childrenResult.units });
    let numericValue: number | null = null;

    if (view && view.values && typeof currentYear === 'number') {
      const yearIndex = view.values.years.indexOf(currentYear);
      if (yearIndex !== -1) {
        const val = view.values.values[unit.teryt]?.[yearIndex];
        if (typeof val === 'number') {
          numericValue = val;
        }
      }
    }

    const formattedVal = formatValue(numericValue, activeIndicator?.unit);

    return {
      unit,
      teryt: unit.teryt,
      label,
      formattedValue: formattedVal,
      numericValue,
    };
  });

  // Sortowanie malejąco wg liczbowej wartości. Braki danych (null) trafiają na koniec.
  rows.sort((a, b) => {
    if (a.numericValue === null && b.numericValue === null) {
      return a.label.localeCompare(b.label, 'pl');
    }
    if (a.numericValue === null) return 1;
    if (b.numericValue === null) return -1;

    if (b.numericValue !== a.numericValue) {
      return b.numericValue - a.numericValue;
    }
    return a.label.localeCompare(b.label, 'pl');
  });

  return (
    <div className="py-2" data-slot="profile-children-list">
      <ul className="divide-y divide-linia" role="list">
        {rows.map((row) => (
          <li key={row.teryt}>
            <button
              type="button"
              onClick={() => onSelectUnit?.(row.teryt)}
              data-slot="child-unit-button"
              className="w-full min-h-[44px] py-2 px-1 flex items-center justify-between text-left hover:bg-linia/10 focus:outline-none focus:ring-2 focus:ring-tusz cursor-pointer transition-colors"
            >
              <span className="text-sm font-medium text-tusz truncate pr-2">
                {row.label}
              </span>
              <span className="text-sm font-mono text-olowek shrink-0">
                {row.formattedValue}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
