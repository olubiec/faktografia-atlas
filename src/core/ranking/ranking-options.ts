import type { UnitLevel } from '../units/types';

/** Minimalny kształt wskaźnika potrzebny do list wyboru rankingu. */
export type RankingIndicator = {
  id: string;
  group: string;
  minLevel?: string | null;
};

/** Wybór użytkownika na /rankingi (year: null = najnowszy rok). */
export type RankingSelection = {
  group: string;
  indicatorId: string;
  level: UnitLevel;
  year: number | null;
};

export const DEFAULT_SELECTION: RankingSelection = {
  group: 'Ludność',
  indicatorId: 'density',
  level: 'woj',
  year: null,
};

const ALL_LEVELS: UnitLevel[] = ['woj', 'pow', 'gmi'];

/** Działy w kolejności z pliku, bez powtórzeń. */
export function rankingGroups(indicators: RankingIndicator[]): string[] {
  return [...new Set(indicators.map((i) => i.group))];
}

/** Wskaźniki jednego działu (kolejność z pliku). */
export function indicatorsInGroup<T extends RankingIndicator>(indicators: T[], group: string): T[] {
  return indicators.filter((i) => i.group === group);
}

/** Szczebel dostępny dla wskaźnika: lista przycięta do minLevel (domyślnie wszystkie). */
export function levelsFor(indicator: Pick<RankingIndicator, 'minLevel'> | undefined): UnitLevel[] {
  const idx = ALL_LEVELS.indexOf(indicator?.minLevel as UnitLevel);
  return idx === -1 ? [...ALL_LEVELS] : ALL_LEVELS.slice(0, idx + 1);
}

/** Lata od najnowszego. */
export function yearsDesc(values: { years: number[] } | null | undefined): number[] {
  return values ? [...values.years].sort((a, b) => b - a) : [];
}

/** Poprawia niepasujące pola wyboru (dział → wskaźnik → poziom → rok). */
export function normalizeSelection(
  sel: RankingSelection,
  indicators: RankingIndicator[],
  values: { years: number[] } | null | undefined,
): RankingSelection {
  const groups = rankingGroups(indicators);
  const group = groups.includes(sel.group) ? sel.group : (groups[0] ?? sel.group);
  const inGroup = indicatorsInGroup(indicators, group);
  const indicator = inGroup.find((i) => i.id === sel.indicatorId) ?? inGroup[0];
  const level = levelsFor(indicator).includes(sel.level) ? sel.level : 'woj';
  const year = sel.year !== null && values && !values.years.includes(sel.year) ? null : sel.year;
  return { group, indicatorId: indicator?.id ?? sel.indicatorId, level, year };
}
