// Słownik tonu redakcyjnego Odkryć v2 (docs/KONCEPT-ODKRYCIA-V2.md §5).
// Siłę daje liczba i porównanie, nie przymiotnik.

export interface ToneRule {
  category: string
  pattern: RegExp
}

const w = (s: string) => new RegExp(`(?<![\\p{L}])(?:${s})(?![\\p{L}])`, 'iu')

export const TONE_RULES: ToneRule[] = [
  { category: 'wzmacniacz', pattern: w('tylko|aż|zaledwie|szok\\p{L}*|niesamowit\\p{L}*') },
  { category: 'clickbait', pattern: /bez retuszu|dziwne,? ale prawdziwe/iu },
  { category: 'mecz', pattern: w('derby|wygrywacie|wygrywa|pokonuje') },
  { category: 'druga-osoba', pattern: w('wy|wasz\\p{L}*|was|wam') },
  { category: 'wykrzyknik', pattern: /!/u },
  { category: 'krzyzyk', pattern: /×/u },
  { category: 'emotikony', pattern: /\p{Extended_Pictographic}|:-?[)(DP]/u },
  { category: 'przynęta', pattern: /zgadniesz|wiesz, że/iu },
  { category: 'ocena-miejsca', pattern: /najgorsza gmina|najlepsza gmina/iu },
]

export interface ToneViolation {
  category: string
  match: string
}

/** Zwraca naruszenia tonu w tekście; pusta lista = tekst przechodzi. */
export function findViolations(text: string): ToneViolation[] {
  const out: ToneViolation[] = []
  for (const r of TONE_RULES) {
    const m = r.pattern.exec(text)
    if (m) out.push({ category: r.category, match: m[0] })
  }
  return out
}
