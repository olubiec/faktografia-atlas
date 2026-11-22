import { unitKindInfo } from '../../core/units/kinds';
import type { Unit } from '../../core/units/types';

/** Linijka pod nazwą jednostki: „Rodzaj – krótka definicja”. Znak „?” jest osobno (UnitKindInfo). */
export function UnitKindHint({ unit }: { unit: Unit }) {
  const kind = unitKindInfo(unit);
  if (!kind) return null;
  return (
    <p className="text-sm text-tusz break-words">
      <span className="font-semibold">{kind.title}</span>
      <span className="text-olowek"> – {kind.tagline}</span>
    </p>
  );
}
