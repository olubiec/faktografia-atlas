import { useMemo } from 'react';
import type { Unit, UnitIndex } from '@/core/units/types';
import { getChildren } from '@/core/units/units';

type UnitListProps = {
  selectedTeryt: string | null;
  index: UnitIndex;
  onSelect: (teryt: string) => void;
};

export function UnitList({ selectedTeryt, index, onSelect }: UnitListProps) {
  const subUnits = useMemo(() => {
    if (!selectedTeryt) {
      const voivodeships: Unit[] = [];
      for (const unit of index.byTeryt.values()) {
        if (unit.level === 'woj') {
          voivodeships.push(unit);
        }
      }
      return voivodeships.sort((a, b) => a.name.localeCompare(b.name, 'pl'));
    }

    return getChildren(index, selectedTeryt);
  }, [selectedTeryt, index]);

  if (subUnits.length === 0) {
    return null;
  }

  return (
    <div className="bg-arkusz border border-linia p-1.5 max-h-60 overflow-y-auto">
      <ul aria-label="Jednostki podrzędne" className="flex flex-col gap-1">
        {subUnits.map((unit) => (
          <li key={unit.teryt}>
            <button
              type="button"
              onClick={() => onSelect(unit.teryt)}
              className="w-full min-h-[44px] px-3 py-2 flex items-center justify-start text-left text-tusz hover:bg-linia/20 transition-colors text-xs font-medium rounded-none focus:outline-none focus-visible:ring-1 focus-visible:ring-tusz cursor-pointer"
            >
              {unit.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UnitList;
