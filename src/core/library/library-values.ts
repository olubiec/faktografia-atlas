import type { IndicatorValues } from '../profile/profile';
import type { Unit, UnitLevel } from '../units/types';

export type CompactValues = {
  y?: (number | string)[];
  d?: Record<string, (number | null)[]>;
  years?: (number | string)[];
  values?: Record<string, (number | null)[]>;
  [key: string]: unknown;
};

export type LibraryValues = {
  v?: string | number;
  id?: string | number;
  indicatorId?: string;
  fetchedAt?: string;
  l5?: CompactValues;
  l6?: CompactValues;
  l3?: CompactValues;
  y?: (number | string)[];
  d?: Record<string, (number | null)[]>;
  years?: (number | string)[];
  values?: Record<string, (number | null)[]>;
  [key: string]: unknown;
};

/**
 * Zamienia klucze (12-znakowe identyfikatory BDL) na kody TERYT na podstawie units.json (bdlId),
 * pomijając części gmin i nieznane identyfikatory.
 */
export function valuesByTeryt(
  values: LibraryValues,
  level: UnitLevel | string | number,
  units: Unit[]
): IndicatorValues {
  const levelStr = String(level);

  let compact: CompactValues | undefined;
  if (levelStr === 'pow' || levelStr === '5' || levelStr === 'l5') {
    compact = values.l5 ?? (values['pow'] as CompactValues) ?? (values['5'] as CompactValues);
  } else if (levelStr === 'gmi' || levelStr === '6' || levelStr === 'l6') {
    compact = values.l6 ?? (values['gmi'] as CompactValues) ?? (values['6'] as CompactValues);
  } else if (levelStr === 'woj' || levelStr === '3' || levelStr === 'l3') {
    compact = values.l3 ?? (values['woj'] as CompactValues) ?? (values['3'] as CompactValues);
  } else if (values[levelStr] && typeof values[levelStr] === 'object') {
    compact = values[levelStr] as CompactValues;
  }

  if (!compact) {
    compact = values as CompactValues;
  }

  const rawYears = compact.y ?? compact.years ?? values.y ?? values.years ?? [];
  const years = rawYears.map((y) => Number(y));

  const rawDict =
    compact.d ?? compact.values ?? values.d ?? values.values ?? {};

  const bdlToTeryt = new Map<string, string>();
  for (const unit of units) {
    if (unit.bdlId) {
      bdlToTeryt.set(unit.bdlId, unit.teryt);
    }
  }

  const mappedValues: Record<string, (number | null)[]> = {};
  for (const [bdlId, row] of Object.entries(rawDict)) {
    const teryt = bdlToTeryt.get(bdlId);
    if (teryt !== undefined) {
      mappedValues[teryt] = row;
    }
  }

  const indicatorId = String(
    values.v ?? values.id ?? values.indicatorId ?? ''
  );
  const fetchedAt =
    typeof values.fetchedAt === 'string'
      ? values.fetchedAt
      : new Date().toISOString();

  return {
    indicatorId,
    years,
    values: mappedValues,
    fetchedAt,
  };
}
