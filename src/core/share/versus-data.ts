import { compare, type CompareRow } from '../compare/compare';
import { formatValue } from '../format/number';
import type { UnitProfile } from '../profile/profile';
import { unitTitle } from '../units/label';
import type { VersusCardData } from './card-versus';

export type VersusShareData = {
  versus: VersusCardData;
  compareRows: CompareRow[];
  compareUnitA: UnitProfile;
  compareUnitB: UnitProfile;
};

/**
 * Dane karty A vs B z już wczytanych profili A i B (bez pobrań).
 * Brak A lub B, roku albo wiersza z wartościami obu stron = brak karty (pusty obiekt).
 */
export function versusShareData(
  profileA: UnitProfile | null | undefined,
  profileB: UnitProfile | null | undefined,
  year: number | null | undefined,
): VersusShareData | Record<string, never> {
  if (!profileA || !profileB || year == null) return {};
  const rows = compare(profileA, profileB).rows;
  const row = rows.find((r) => r.a != null && r.b != null);
  const itemA = row ? profileA.indicators.find((i) => i.indicatorId === row.indicatorId) : undefined;
  if (!row || !itemA) return {};
  const title = (p: UnitProfile) => (p.unit ? unitTitle(p.unit) : `TERYT ${p.teryt}`);
  const unit = itemA.indicator.unit;
  return {
    versus: {
      indicator: { name: itemA.indicator.name, unit },
      year,
      a: { name: title(profileA), valueText: formatValue(row.a, unit) },
      b: { name: title(profileB), valueText: formatValue(row.b, unit) },
      diffText: row.diffText,
    },
    compareRows: rows,
    compareUnitA: profileA,
    compareUnitB: profileB,
  };
}
