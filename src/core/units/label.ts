import type { Unit } from './types';

/**
 * Zwraca rodzaj gminy na podstawie 7-cyfrowego kodu TERYT.
 * 1 – gmina miejska (miasto)
 * 2 – gmina wiejska
 * 3 – gmina miejsko-wiejska
 */
export function gminaKind(teryt: string): 'miasto' | 'gmina wiejska' | 'gmina miejsko-wiejska' | null {
  if (teryt.length !== 7) {
    return null;
  }
  const lastDigit = teryt.slice(-1);
  if (lastDigit === '1') return 'miasto';
  if (lastDigit === '2') return 'gmina wiejska';
  if (lastDigit === '3') return 'gmina miejsko-wiejska';
  return null;
}

export interface UnitLabelOptions {
  short?: boolean;
  sameParentUnits?: Unit[];
}

/**
 * Zwraca etykietę jednostki do wyświetlenia.
 * Dla gminy: z rodzajem w nawiasie, np. „Wałcz (miasto)”, „Wałcz (gmina wiejska)”.
 * Jeśli short: true i w sameParentUnits nie ma drugiej gminy o tej samej nazwie, zwraca samo unit.name.
 */
export function unitLabel(unit: Unit, options?: UnitLabelOptions): string {
  if (unit.level !== 'gmi') {
    return unit.name;
  }

  const kind = gminaKind(unit.teryt);
  if (!kind) {
    return unit.name;
  }

  if (options?.short && options.sameParentUnits) {
    const duplicateCount = options.sameParentUnits.filter(
      (u) => u.level === 'gmi' && u.name === unit.name
    ).length;
    if (duplicateCount <= 1) {
      return unit.name;
    }
  }

  return `${unit.name} (${kind})`;
}

/**
 * Zwraca nagłówek profilu jednostki.
 * Np.: „Gmina miejska Wałcz”, „Gmina wiejska Wałcz”, „Powiat wałecki”, „Województwo zachodniopomorskie”.
 */
export function unitTitle(unit: Unit): string {
  if (unit.level === 'woj') {
    const name = unit.name;
    if (name.toLowerCase().startsWith('województwo ')) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return `Województwo ${name}`;
  }

  if (unit.level === 'pow') {
    const name = unit.name;
    if (name.toLowerCase().startsWith('powiat ')) {
      return `Powiat ${name.slice(7)}`;
    }
    return `Powiat ${name}`;
  }

  const kind = gminaKind(unit.teryt);
  if (!kind) {
    return unit.name;
  }

  if (kind === 'miasto') {
    return `Gmina miejska ${unit.name}`;
  }

  const kindCapitalized = kind.charAt(0).toUpperCase() + kind.slice(1);
  return `${kindCapitalized} ${unit.name}`;
}
