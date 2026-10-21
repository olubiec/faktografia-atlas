import type { Unit } from '@/core/units/types';
import { unitLabel } from '@/core/units/label';
import { formatValue } from '@/core/format/number';

export interface UnitTooltipProps {
  unit: Unit;
  value: number | null;
  unitName: string | null;
  rank: number | null;
  total: number;
  levelNoun: string;
  x: number;
  y: number;
  containerWidth: number;
}

/**
 * Dymek po najechaniu na jednostkę: nazwa, wartość, miejsce w rankingu. Zwykły tekst (bez HTML z danych).
 * Nie przechwytuje myszy, żeby kliknięcie w jednostkę nadal otwierało profil.
 */
export function UnitTooltip({ unit, value, unitName, rank, total, levelNoun, x, y, containerWidth }: UnitTooltipProps) {
  const flip = x > containerWidth - 260;
  return (
    <div
      role="status"
      className="absolute z-30 pointer-events-none bg-arkusz text-tusz border border-linia p-3 w-[240px]"
      style={{ left: flip ? x - 252 : x + 14, top: y + 14 }}
    >
      <div className="font-semibold text-sm">{unitLabel(unit)}</div>
      <div className="font-mono font-bold text-lg leading-tight">
        {value == null ? 'brak danych' : formatValue(value, unitName)}
      </div>
      {rank != null && (
        <div className="text-xs text-olowek">
          {rank}. miejsce wśród {total} {levelNoun}
        </div>
      )}
      <div className="text-xs text-olowek mt-1">Kliknij, aby otworzyć profil</div>
    </div>
  );
}
