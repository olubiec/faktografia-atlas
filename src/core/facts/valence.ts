import roles from '../../../config/roles.json'

export type Valence = 'up' | 'down'

const MAP = roles.valence as Record<string, Valence>

/** Kierunek „lepiej” wskaźnika; null, gdy nie jest jednoznaczny. */
export function valenceOf(id: string): Valence | null {
  return MAP[id] ?? null
}

/** Lista wskaźników z jednoznacznym kierunkiem. */
export function valenceIds(): string[] {
  return Object.keys(MAP)
}

/** Czy wartość a jest lepsza od b. null: brak kierunku, brak wartości albo remis. */
export function isBetter(id: string, a: number | null, b: number | null): boolean | null {
  const v = valenceOf(id)
  if (v === null || a === null || b === null || a === b) return null
  return v === 'up' ? a > b : a < b
}
