import type { Unit, UnitIndex, UnitLevel } from './types';

/**
 * Zwraca poziom podziału administracyjnego na podstawie długości kodu TERYT.
 */
export function levelOf(teryt: string): UnitLevel | undefined {
  if (teryt.length === 2) return 'woj';
  if (teryt.length === 4) return 'pow';
  if (teryt.length === 7) return 'gmi';
  return undefined;
}

/**
 * Buduje szybki indeks jednostek administracyjnych w pamięci.
 */
export function buildIndex(units: Unit[]): UnitIndex {
  const byTeryt = new Map<string, Unit>();
  const childrenByParent = new Map<string, Unit[]>();

  for (const unit of units) {
    byTeryt.set(unit.teryt, unit);

    if (unit.parent !== null) {
      const list = childrenByParent.get(unit.parent);
      if (list) {
        list.push(unit);
      } else {
        childrenByParent.set(unit.parent, [unit]);
      }
    }
  }

  return { byTeryt, childrenByParent };
}

/**
 * Pobiera jednostkę na podstawie jej kodu TERYT.
 * Zwraca `undefined`, jeśli TERYT jest nieznany.
 */
export function getUnit(index: UnitIndex, teryt: string): Unit | undefined {
  return index.byTeryt.get(teryt);
}

/**
 * Zwraca listę dzieci bezpośrednich danej jednostki (np. powiaty dla województwa),
 * posortowane według nazwy zgodnie z polską kolejnością alfabetyczną (`localeCompare('pl')`).
 */
export function getChildren(index: UnitIndex, teryt: string): Unit[] {
  const children = index.childrenByParent.get(teryt) ?? [];
  return [...children].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
}

/**
 * Zwraca listę przodków jednostki (od województwa w dół, wyłączając samą jednostkę).
 * Dla województwa zwraca pustą tablicę `[]`.
 * Jeśli jednostka lub któryś z przodków nie istnieje, przerywa i zwraca dotychczas zebraną listę.
 */
export function getAncestors(index: UnitIndex, teryt: string): Unit[] {
  const ancestors: Unit[] = [];
  let currentUnit = index.byTeryt.get(teryt);

  while (currentUnit && currentUnit.parent !== null) {
    const parentUnit = index.byTeryt.get(currentUnit.parent);
    if (!parentUnit) {
      break;
    }
    ancestors.unshift(parentUnit);
    currentUnit = parentUnit;
  }

  return ancestors;
}
