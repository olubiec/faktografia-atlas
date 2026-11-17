// Lista „Moje wskaźniki” – czysta logika, bez przeglądarki i Reacta.

// Lista podstawowa – jedyne miejsce, gdzie ją zmieniamy.
export const BASIC_INDICATORS: readonly string[] = [
  'population',
  'density',
  'natural-increase',
  'migration-balance',
  'share-65plus',
  'unemployment-rate',
  'avg-wage',
];

export type MyIndicators = readonly string[];

export function defaultMyIndicators(): MyIndicators {
  return [...BASIC_INDICATORS];
}

// Dopisuje na końcu; gdy już jest – zwraca tę samą referencję.
export function addIndicator(list: MyIndicators, id: string): MyIndicators {
  return list.includes(id) ? list : [...list, id];
}

// Usuwa; nieistniejący id – ta sama referencja. Pusta lista jest poprawna.
export function removeIndicator(list: MyIndicators, id: string): MyIndicators {
  return list.includes(id) ? list.filter((x) => x !== id) : list;
}

// Przesuwa o jedno miejsce; na krawędzi lub dla nieznanego id – bez zmiany.
export function moveIndicator(list: MyIndicators, id: string, direction: -1 | 1): MyIndicators {
  const from = list.indexOf(id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= list.length) return list;
  const next = [...list];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

export function resetToBasic(): MyIndicators {
  return defaultMyIndicators();
}

// Czy lista równa się podstawowej (kolejność ma znaczenie).
export function isBasic(list: MyIndicators): boolean {
  return list.length === BASIC_INDICATORS.length && list.every((id, i) => id === BASIC_INDICATORS[i]);
}
