import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { buildPercentiles, decodePercentiles, decodeFact, percentileOf } from '../../src/core/facts/codec'

const fx = JSON.parse(readFileSync('tests/fixtures/facts-percentile/values.json', 'utf8'))
const base = { values: fx.values, gminas: fx.gminas, zeroGuard: true, bins: 20, minUnits: 5 }
const g = (i: number) => fx.gminas[i] as string

describe('W31-O01 percentyle', () => {
  const r = buildPercentiles(base)
  const rows = (t: string) => Object.fromEntries(decodePercentiles(r.shards['32'], t).map((p) => [p.indicatorId, p]))

  it('percentyl i stosunek zgadzają się z obliczeniem ręcznym (11 gmin)', () => {
    // a: posortowane 2,4,4,6,8,10,12,14,16,18,100; mediana 10
    expect(rows(g(10)).a).toMatchObject({ percentile: 100, ratio: 10, year: 2025 })
    expect(rows(g(0)).a).toMatchObject({ percentile: 0, ratio: 0.2 })
    expect(rows(g(5)).a).toMatchObject({ percentile: 50, ratio: null })
    // remis 4,4 na miejscach 1–2 → środek: (1+2)/2/10 = 15%
    expect(rows(g(1)).a.percentile).toBe(15)
  })
  it('mediana 0 albo wartość 0: brak stosunku, jest percentyl; null pomijane', () => {
    expect(rows(g(10)).z.ratio).toBeNull()
    expect(rows(g(10)).z.percentile).toBe(100)
    expect(rows(g(0)).z.ratio).toBeNull()
    expect(rows(g(5)).n).toBeUndefined()
    expect(r.dist.n.b.reduce((s, x) => s + x, 0)).toBe(10)
  })
  it('histogram ma 20 przedziałów, suma = liczba gmin z wartością', () => {
    for (const [id, d] of Object.entries(r.dist)) {
      expect(d.b).toHaveLength(20)
      const withValue = Object.values(fx.values[id].values).filter((x) => (x as (number | null)[])[1] !== null).length
      expect(d.b.reduce((s, x) => s + x, 0)).toBe(withValue)
    }
  })
  it('wartości kandydatów do kart są w pliku (potrzebne do ludzkiej skali)', () => {
    const a = rows(g(10)).a
    expect(a.ratio).toBe(10)
    expect(a.value).toBe(100)
  })
  it('percentileOf: kraniec i pojedyncza wartość', () => {
    expect(percentileOf([1], 1)).toBe(50)
    expect(percentileOf([1, 2, 3], 3)).toBe(100)
  })
  it('stary plik bez nowych pól dekoduje się bez wyjątku', () => {
    expect(decodePercentiles(undefined, g(0))).toEqual([])
    expect(() => decodeFact('3204033', ['F9', 'population', 2025, 1000, 0.5, 900, 60])).not.toThrow()
  })
  it('przyrost rozmiaru pliku województwa ≤ 30% (przeskalowany do 150 gmin i 16 wskaźników)', () => {
    const gm = Array.from({ length: 150 }, (_, i) => `3299${String(i).padStart(3, '0')}`)
    const values: Record<string, unknown> = {}
    for (let k = 0; k < 16; k++)
      values[`i${k}`] = { years: [2025], values: Object.fromEntries(gm.map((t, i) => [t, [(((i * 37 + k * 11) % 400) * 7.3) / 10]])) }
    const out = buildPercentiles({ ...base, values: values as typeof base.values, gminas: gm, minUnits: 100 })
    const added = JSON.stringify({ pct: out.shards['32'], dist: out.dist }).length
    expect(added).toBeLessThanOrEqual(0.3 * 59448)
  })
})
