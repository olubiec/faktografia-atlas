import type { Unit, UnitLevel } from '../units/types';

export type Indicator = {
  id: string;
  bdlVarId: number;
  name: string;
  unit: string;
  description: string;
  group: string;
  higherIsBetter: boolean | null;
  minLevel: UnitLevel;
  footnote?: string;
};

export type IndicatorValues = {
  indicatorId: string;
  years: number[];
  values: Record<string, (number | null)[]>;
  fetchedAt: string;
};

export type ProfileIndicatorItem = {
  indicatorId: string;
  indicator: Indicator;
  year: number | null;
  value: number | null;
  rankNational: number | null;
  rankVoivodeship: number | null;
  totalNational: number;
  totalVoivodeship: number;
  neutral: boolean;
  fromParent?: string;
};

export type UnitProfile = {
  teryt: string;
  unit: Unit | null;
  indicators: ProfileIndicatorItem[];
};

const LEVEL_WEIGHT: Record<UnitLevel, number> = {
  gmi: 1,
  pow: 2,
  woj: 3,
};

/**
 * Buduje profil dla wybranej jednostki administracyjnej na podstawie wskaźników i ich wartości.
 * Wylicza ostatni rok z wartością, miejsce w kraju oraz w województwie (z uwzględnieniem remisów
 * i kierunku wyżej/niżej lepiej) oraz radzi sobie z przekazywaniem wartości od rodzica gdy minLevel jest wyższy.
 */
export function buildProfile(
  teryt: string,
  indicators: Indicator[],
  valuesById: Record<string, IndicatorValues>,
  units: Unit[],
): UnitProfile {
  const unitsByTeryt = new Map<string, Unit>();
  for (const u of units) {
    unitsByTeryt.set(u.teryt, u);
  }

  const targetUnit = unitsByTeryt.get(teryt);
  if (!targetUnit) {
    return {
      teryt,
      unit: null,
      indicators: [],
    };
  }

  const profileItems: ProfileIndicatorItem[] = [];

  for (const indicator of indicators) {
    // ustalanie właściwej jednostki (uwzględnia minLevel wskaźnika)
    let effectiveUnit = targetUnit;
    while (
      LEVEL_WEIGHT[effectiveUnit.level] < LEVEL_WEIGHT[indicator.minLevel] &&
      effectiveUnit.parent !== null
    ) {
      const parentUnit = unitsByTeryt.get(effectiveUnit.parent);
      if (!parentUnit) {
        break;
      }
      effectiveUnit = parentUnit;
    }

    const fromParent = effectiveUnit.teryt !== targetUnit.teryt ? effectiveUnit.teryt : undefined;

    const indValues = valuesById[indicator.id];
    if (!indValues || !indValues.years || indValues.years.length === 0) {
      profileItems.push({
        indicatorId: indicator.id,
        indicator,
        year: null,
        value: null,
        rankNational: null,
        rankVoivodeship: null,
        totalNational: 0,
        totalVoivodeship: 0,
        neutral: indicator.higherIsBetter === null,
        fromParent,
      });
      continue;
    }

    // szukanie najnowszego roku z wartością dla skutecznej jednostki
    let yearIdx = -1;
    for (let i = indValues.years.length - 1; i >= 0; i--) {
      const val = indValues.values[effectiveUnit.teryt]?.[i];
      if (val !== undefined && val !== null) {
        yearIdx = i;
        break;
      }
    }

    if (yearIdx === -1) {
      profileItems.push({
        indicatorId: indicator.id,
        indicator,
        year: null,
        value: null,
        rankNational: null,
        rankVoivodeship: null,
        totalNational: 0,
        totalVoivodeship: 0,
        neutral: indicator.higherIsBetter === null,
        fromParent,
      });
      continue;
    }

    const year = indValues.years[yearIdx];
    const value = indValues.values[effectiveUnit.teryt]![yearIdx];

    // zbieranie wartości dla rankingu na poziomie effectiveUnit.level dla danego roku
    const targetWojTeryt = effectiveUnit.teryt.slice(0, 2);
    const nationalValues: number[] = [];
    const voivodeshipValues: number[] = [];

    for (const u of units) {
      if (u.level === effectiveUnit.level) {
        const uVal = indValues.values[u.teryt]?.[yearIdx];
        if (uVal !== undefined && uVal !== null) {
          nationalValues.push(uVal);
          if (u.teryt.slice(0, 2) === targetWojTeryt) {
            voivodeshipValues.push(uVal);
          }
        }
      }
    }

    let rankNational: number | null = null;
    let rankVoivodeship: number | null = null;

    if (value !== null) {
      if (indicator.higherIsBetter === false) {
        // niżej lepiej: miejsce 1 to najmniejsza wartość
        let betterNat = 0;
        for (const v of nationalValues) {
          if (v < value) betterNat++;
        }
        rankNational = 1 + betterNat;

        let betterWoj = 0;
        for (const v of voivodeshipValues) {
          if (v < value) betterWoj++;
        }
        rankVoivodeship = 1 + betterWoj;
      } else {
        // wyżej lepiej (lub neutralny): miejsce 1 to największa wartość
        let betterNat = 0;
        for (const v of nationalValues) {
          if (v > value) betterNat++;
        }
        rankNational = 1 + betterNat;

        let betterWoj = 0;
        for (const v of voivodeshipValues) {
          if (v > value) betterWoj++;
        }
        rankVoivodeship = 1 + betterWoj;
      }
    }

    profileItems.push({
      indicatorId: indicator.id,
      indicator,
      year,
      value,
      rankNational,
      rankVoivodeship,
      totalNational: nationalValues.length,
      totalVoivodeship: voivodeshipValues.length,
      neutral: indicator.higherIsBetter === null,
      fromParent,
    });
  }

  return {
    teryt,
    unit: targetUnit,
    indicators: profileItems,
  };
}
