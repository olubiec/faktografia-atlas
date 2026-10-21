import type { Unit } from '../units/types';
import type { ProfileIndicatorItem, UnitProfile } from './profile';

export type RankingScope = {
  teryts: string[];
  description: string;
};

export type ChildUnitsResult = {
  units: Unit[];
  label: string | null;
};

/**
 * Zamienia nazwę województwa w mianowniku na nazwę w miejscowniku.
 * np. "małopolskie" -> "małopolskim", "śląskie" -> "śląskim", "wielkopolskie" -> "wielkopolskim"
 */
function voivodeshipLocative(name: string): string {
  if (name.endsWith('e')) {
    return name.slice(0, -1) + 'm';
  }
  return name;
}

/**
 * Zwraca listę TERYT jednostek, z którymi porównujemy wybraną jednostkę w rankingu,
 * oraz słowny opis zakresu rankingu (np. "w Polsce", "w województwie małopolskim").
 */
export function rankingScope(unit: Unit, units: Unit[]): RankingScope {
  if (unit.level === 'woj') {
    const wojUnits = units.filter((u) => u.level === 'woj');
    return {
      teryts: wojUnits.map((u) => u.teryt),
      description: 'w Polsce',
    };
  }

  const wojTeryt = unit.teryt.slice(0, 2);
  const wojUnit = units.find((u) => u.level === 'woj' && u.teryt === wojTeryt);
  const wojLocative = wojUnit ? voivodeshipLocative(wojUnit.name) : '';
  const description = wojLocative ? `w województwie ${wojLocative}` : 'w województwie';

  if (unit.level === 'pow') {
    const powUnits = units.filter(
      (u) => u.level === 'pow' && (u.parent === wojTeryt || u.teryt.startsWith(wojTeryt))
    );
    return {
      teryts: powUnits.map((u) => u.teryt),
      description,
    };
  }

  // dla 'gmi'
  const gmiUnits = units.filter((u) => u.level === 'gmi' && u.teryt.startsWith(wojTeryt));
  return {
    teryts: gmiUnits.map((u) => u.teryt),
    description,
  };
}

/**
 * Zwraca listę jednostek podrzędnych o jeden poziom niżej
 * (województwo → powiaty, powiat → gminy, gmina → pusta lista)
 * oraz etykietę zakładki, np. "Powiaty (22)", "Gminy (19)", a dla gminy null.
 */
export function childUnits(unit: Unit, units: Unit[]): ChildUnitsResult {
  if (unit.level === 'woj') {
    const children = units
      .filter((u) => u.level === 'pow' && u.parent === unit.teryt)
      .sort((a, b) => a.name.localeCompare(b.name, 'pl'));

    return {
      units: children,
      label: `Powiaty (${children.length})`,
    };
  }

  if (unit.level === 'pow') {
    const children = units
      .filter((u) => u.level === 'gmi' && u.parent === unit.teryt)
      .sort((a, b) => a.name.localeCompare(b.name, 'pl'));

    return {
      units: children,
      label: `Gminy (${children.length})`,
    };
  }

  return {
    units: [],
    label: null,
  };
}

/**
 * Zwraca pozycję profilu dla bieżącego wskaźnika.
 * Gdy indicatorId brak lub nie ma go w profilu – pozycję dla defaultId; gdy i tej nie ma – null.
 */
export function currentIndicatorItem(
  profile: UnitProfile | null | undefined,
  indicatorId: string | undefined | null,
  defaultId: string
): ProfileIndicatorItem | null {
  if (!profile || !profile.indicators) {
    return null;
  }

  if (indicatorId) {
    const found = profile.indicators.find((item) => item.indicatorId === indicatorId);
    if (found) {
      return found;
    }
  }

  const defaultFound = profile.indicators.find((item) => item.indicatorId === defaultId);
  return defaultFound ?? null;
}
