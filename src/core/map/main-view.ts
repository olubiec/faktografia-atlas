import type { UnitLevel } from '../units/types';

/** Wskaźnik widoczny na mapie od wejścia na stronę (PRODUKT.md §3). Zmiana = ta jedna stała. */
export const DEFAULT_INDICATOR_ID = 'density';
export const DEFAULT_LEVEL: UnitLevel = 'woj';

export const LEVEL_LABELS: Record<UnitLevel, string> = {
  woj: 'Województwa',
  pow: 'Powiaty',
  gmi: 'Gminy',
};

const ORDER: UnitLevel[] = ['woj', 'pow', 'gmi'];

/**
 * Poziomy, na których GUS podaje dane wskaźnika: województwa zawsze,
 * niżej tylko do `minLevel` (np. „pow” = województwa i powiaty).
 */
export function allowedLevels(minLevel: UnitLevel | null | undefined): UnitLevel[] {
  const last = minLevel ? ORDER.indexOf(minLevel) : 0;
  return ORDER.slice(0, Math.max(last, 0) + 1);
}

/** Zwraca poziom dozwolony dla wskaźnika; jeśli żądany nie jest dostępny, najgłębszy dostępny. */
export function clampLevel(level: UnitLevel, minLevel: UnitLevel | null | undefined): UnitLevel {
  const allowed = allowedLevels(minLevel);
  return allowed.includes(level) ? level : allowed[allowed.length - 1];
}

export function isUnitLevel(value: string | null | undefined): value is UnitLevel {
  return value === 'woj' || value === 'pow' || value === 'gmi';
}

/** Rok z adresu, jeśli jest w danych; w przeciwnym razie najnowszy rok z danymi. */
export function resolveYear(years: number[], requested: number | null | undefined): number | null {
  if (years.length === 0) return null;
  if (requested != null && years.includes(requested)) return requested;
  return years[years.length - 1];
}

const DEPTH: Record<UnitLevel, number> = { woj: 0, pow: 1, gmi: 2 };

/**
 * Poziom kolorowania mapy: wybrany przez użytkownika, ale po wybraniu jednostki co najmniej o jeden niżej
 * (województwo → powiaty, powiat → gminy), w granicach poziomów dostępnych dla wskaźnika.
 */
export function effectiveLevel(
  chosen: UnitLevel,
  selectedLevel: UnitLevel | null | undefined,
  minLevel: UnitLevel | null | undefined
): UnitLevel {
  const childDepth = selectedLevel ? Math.min(DEPTH[selectedLevel] + 1, 2) : 0;
  const depth = Math.max(DEPTH[chosen], childDepth);
  return clampLevel(ORDER[depth], minLevel);
}

/** Czy wybór poziomu „wyżej” niż poziom podrzędny wybranej jednostki wymaga wyjścia do widoku całego kraju. */
export function levelRequiresDeselect(chosen: UnitLevel, selectedLevel: UnitLevel | null | undefined): boolean {
  if (!selectedLevel) return false;
  return DEPTH[chosen] < Math.min(DEPTH[selectedLevel] + 1, 2);
}
