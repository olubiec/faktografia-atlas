// Pomocnicze funkcje opisu i kolejności jednostek w wyszukiwarce (przeniesione z index.ts bez zmian).
import type { Unit } from '../units/types';
import type { SearchDoc } from './types';

/**
 * Zwraca czytelną etykietę określającą rodzaj jednostki.
 */
export function getUnitLabel(unit: Unit): string {
  if (unit.level === 'woj') {
    return 'województwo';
  }
  if (unit.level === 'pow') {
    return unit.teryt[2] === '6' ? 'miasto na prawach powiatu' : 'powiat';
  }
  const lastDigit = unit.teryt.slice(-1);
  if (lastDigit === '1') return 'gmina miejska';
  if (lastDigit === '2') return 'gmina wiejska';
  if (lastDigit === '3') return 'gmina miejsko-wiejska';
  return 'gmina';
}

/**
 * Zwraca kontekst nadrzędny jednostki.
 */
export function getUnitContext(unit: Unit, unitsMap: Map<string, Unit>): string {
  if (unit.level === 'woj') {
    return '';
  }
  if (unit.level === 'pow') {
    const parentWoj = unit.parent ? unitsMap.get(unit.parent) : null;
    return parentWoj ? parentWoj.name : '';
  }
  if (unit.level === 'gmi') {
    const parentPow = unit.parent ? unitsMap.get(unit.parent) : null;
    const parentWoj = parentPow && parentPow.parent ? unitsMap.get(parentPow.parent) : null;
    if (parentPow && parentWoj) {
      return `${parentPow.name}, ${parentWoj.name}`;
    }
    if (parentPow) {
      return parentPow.name;
    }
  }
  return '';
}

/**
 * Zwraca nazwę bez przedrostka "powiat " dla powiatów.
 */
export function getCleanName(unit: Unit): string {
  if (unit.level === 'pow' && unit.name.toLowerCase().startsWith('powiat ')) {
    return unit.name.slice(7);
  }
  return unit.name;
}

/**
 * Sprawdza, czy jednostka jest miastem na prawach powiatu lub jego gminą.
 */
export function isMnpp(unit: Unit, unitsMap: Map<string, Unit>): boolean {
  if (unit.level === 'pow' && unit.teryt[2] === '6') {
    return true;
  }
  if (unit.level === 'gmi' && unit.parent) {
    const parentPow = unitsMap.get(unit.parent);
    if (parentPow && parentPow.teryt[2] === '6') {
      return true;
    }
  }
  return false;
}

/**
 * Zwraca pozycję w hierarchii ważności przy remisie:
 * wojewodztwo (1) > miasto na prawach powiatu i jego gmina (2) > powiat (3) > pozostale gminy (4)
 */
export function getTierRank(unit: Unit, unitsMap: Map<string, Unit>): number {
  if (unit.level === 'woj') return 1;
  if (isMnpp(unit, unitsMap)) {
    return unit.level === 'gmi' ? 2 : 2.1;
  }
  if (unit.level === 'pow') return 3;
  return 4;
}

/**
 * Określa kategoryzację dopasowania do zapytania:
 * 1 = dokładna nazwa
 * 2 = początek nazwy (prefix)
 * 3 = dopasowanie przybliżone (literówka)
 */
export function getMatchCategory(queryNorm: string, doc: SearchDoc): number {
  if (doc.normName === queryNorm || doc.normClean === queryNorm) {
    return 1;
  }

  const words = `${doc.normName} ${doc.normClean}`.split(' ');
  if (words.some((w) => w.startsWith(queryNorm))) {
    return 2;
  }

  return 3;
}
