import type { UnitProfile } from '../profile/profile';

export interface CompareRow {
  indicatorId: string;
  a: number | null;
  b: number | null;
  diffText: string;
}

export interface CompareResult {
  differentLevels: boolean;
  rows: CompareRow[];
}

/**
 * Porównuje dwa profile jednostek, obliczając różnice w wartościach najnowszego roku dla poszczególnych wskaźników.
 * Wyniki są zwaracane w kolejności wskaźników z pierwszego profilu.
 *
 * Zwraca informacje o flagach 'differentLevels', jeśli porównywane są jednostki na innych poziomach.
 * Oblicza różnicę na podstawie jednostki pomiarowej (np. '%' liczone w punktach procentowych 'p.p.', reszta w '%').
 * Formatuje napisy np. 'wyżej o 1,2 p.p.' lub 'niżej o 12,3%'.
 * Dla zera w mianowniku, podaje tylko kierunek (wyżej / niżej).
 * Dla brakujących wartości zgłasza 'brak danych'.
 */
export function compare(profileA: UnitProfile, profileB: UnitProfile): CompareResult {
  let differentLevels = false;

  if (profileA.unit && profileB.unit) {
    differentLevels = profileA.unit.level !== profileB.unit.level;
  }

  const rows: CompareRow[] = [];

  const bIndicatorsMap = new Map<string, typeof profileB.indicators[number]>();
  for (const item of profileB.indicators) {
    bIndicatorsMap.set(item.indicatorId, item);
  }

  for (const itemA of profileA.indicators) {
    const itemB = bIndicatorsMap.get(itemA.indicatorId);

    let aValue = itemA.value;
    let bValue = itemB ? itemB.value : null;

    let diffText = 'brak danych';

    if (aValue !== null && aValue !== undefined && bValue !== null && bValue !== undefined) {
      if (aValue === bValue) {
        diffText = 'bez zmian';
      } else {
        const isPercentUnit = itemA.indicator.unit.trim() === '%';

        if (isPercentUnit) {
          const diff = aValue - bValue;
          const absDiff = Math.abs(diff);
          const formattedDiff = absDiff.toFixed(1).replace('.', ',');

          if (diff > 0) {
            diffText = `wyżej o ${formattedDiff} p.p.`;
          } else {
            diffText = `niżej o ${formattedDiff} p.p.`;
          }
        } else {
          if (bValue === 0) {
            if (aValue > bValue) {
              diffText = 'wyżej';
            } else {
              diffText = 'niżej';
            }
          } else {
            const relDiff = ((aValue - bValue) / Math.abs(bValue)) * 100;
            const absRelDiff = Math.abs(relDiff);
            const formattedDiff = absRelDiff.toFixed(1).replace('.', ',');

            if (relDiff > 0) {
              diffText = `wyżej o ${formattedDiff}%`;
            } else {
              diffText = `niżej o ${formattedDiff}%`;
            }
          }
        }
      }
    }

    rows.push({
      indicatorId: itemA.indicatorId,
      a: aValue,
      b: bValue,
      diffText,
    });
  }

  return {
    differentLevels,
    rows
  };
}
