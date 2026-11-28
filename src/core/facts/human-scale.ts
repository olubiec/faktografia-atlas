// Ludzka skala (W31-O02, docs/KONCEPT-ODKRYCIA-V2.md §4): liczba → zdanie redakcyjne.
// Bez wzmacniaczy, bez przyczyn, bez porównań spoza danych; źródło zawsze pod spodem.

export interface HumanScaleInput {
  value: number
  unit: string
  median?: number | null
  percentile?: number | null
  year: number
  place: string
  /** Opcjonalny podmiot zdania, np. „Z bibliotek publicznych korzysta”. */
  label?: string
}

export interface HumanScale {
  main: string
  reference: string
  source: string
}

const MAX = 90

/** Odmiana: 1 firma / 2–4 firmy / 5 firm (formy: [1, 2–4, 5+]). */
export function plural(n: number, forms: [string, string, string]): string {
  const a = Math.abs(n)
  if (a === 1) return forms[0]
  const last = a % 10
  const tens = a % 100
  if (last >= 2 && last <= 4 && !(tens >= 12 && tens <= 14)) return forms[1]
  return forms[2]
}

const pl = (n: number, d = 1) =>
  n.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: d })

const base = (unit: string): number | null =>
  /na 10 tys/.test(unit) ? 10000 : /na 1000/.test(unit) ? 1000 : null

const FRACTIONS: [number, string][] = [
  [25, 'jedna czwarta'],
  [100 / 3, 'jedna trzecia'],
  [50, 'połowa'],
  [200 / 3, 'dwie trzecie'],
  [75, 'trzy czwarte'],
]

function fraction(pct: number): string | null {
  if (pct < 10 || pct > 90) return null
  for (const [p, name] of FRACTIONS) if (Math.abs(pct - p) <= 2) return name
  return null
}

/** „1 na N mieszkańców” albo „N na 10 mieszkańców” – null, gdy jednostka nie pasuje. */
function perCapita(value: number, unit: string): string | null {
  const b = base(unit)
  if (b === null || value <= 0) return null
  const share = value / b
  if (share < 0.5) return `1 na ${Math.round(1 / share)} mieszkańców`
  if (share >= 0.95 && share < 1) return 'prawie 1 na każdego mieszkańca'
  if (share >= 1) return `${pl(share, 1)} na każdego mieszkańca`
  return `${Math.round(share * 10)} na 10 mieszkańców`
}

export function times(ratio: number): string {
  const r = ratio >= 1 ? ratio : 1 / ratio
  const rounded = r >= 10 ? Math.round(r) : Math.round(r * 10) / 10
  const word = Number.isInteger(rounded) ? 'razy' : 'raza'
  return `${pl(rounded)} ${word} ${ratio >= 1 ? 'więcej' : 'mniej'}`
}

const money = (v: number) => `ok. ${Math.round(v / 100) * 100} zł`.replace(/(\d)(?=(\d{3})+ zł)/g, '$1 ')

function format(value: number, unit: string): string {
  if (unit === 'zł') return money(value)
  const pc = perCapita(value, unit)
  if (pc) return pc
  if (unit === '%') return `${pl(value)}%`
  return `${pl(value)} ${unit}`
}

export function humanScale(input: HumanScaleInput): HumanScale {
  const { value, unit, median, percentile, year, place, label } = input
  const source = `GUS BDL, ${year} · ${pl(value, 2)} ${unit}`
  const reference =
    median != null && median !== 0 ? `W typowej gminie: ${format(median, unit)}.` : ''
  const hasMedian = median != null && median !== 0 && value !== 0
  const ratio = hasMedian ? value / (median as number) : null
  const pc = unit === '%' ? fraction(value) : null

  let body: string | null = null
  if (unit === 'zł' && ratio !== null && (ratio >= 1.5 || ratio <= 1 / 1.5)) {
    body = `${money(value)} na mieszkańca, ${times(ratio)} niż w typowej gminie`
  } else if (perCapita(value, unit)) {
    body = perCapita(value, unit)
  } else if (pc) {
    body = `${pc} (${pl(value)}%)`
  } else if (ratio !== null && (ratio >= 1.5 || ratio <= 1 / 1.5)) {
    body = `${times(ratio)} niż w typowej gminie`
  } else if (percentile != null && (percentile <= 10 || percentile >= 90)) {
    const low = percentile <= 10
    const n = Math.round(low ? percentile : 100 - percentile)
    return { main: `${low ? 'Niższy' : 'Wyższy'} wynik ma ${n}% gmin w Polsce.`, reference, source }
  } else {
    body = format(value, unit)
  }

  const head = label ? `${label}: ` : ''
  let main = `${head}${body}.`
  if (main.length > MAX) main = `${body}.`
  if (main.length > MAX) main = `${place}: ${format(value, unit)}.`
  return { main: main.charAt(0).toUpperCase() + main.slice(1), reference, source }
}
