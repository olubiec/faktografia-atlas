import { describe, expect, it } from 'vitest'
import { humanScale, plural } from '../../src/core/facts/human-scale'

const base = { year: 2025, place: 'Maszewo' }
const BAD = /×|!|(?<![\p{L}])(tylko|aż|zaledwie)(?![\p{L}])/iu

describe('W31-O02 ludzka skala', () => {
  it('32 na 1000 → 1 na 31 mieszkańców, źródło pod spodem', () => {
    const r = humanScale({ ...base, value: 32, unit: 'na 1000', median: 100, percentile: 3 })
    expect(r.main).toContain('1 na 31 mieszkańców')
    expect(r.reference).toBe('W typowej gminie: 1 na 10 mieszkańców.')
    expect(r.source).toBe('GUS BDL, 2025 · 32 na 1000')
  })
  it('36,1 vs 2,8 → 13 razy więcej', () => {
    const r = humanScale({ ...base, value: 36.1, unit: 'pkt', median: 2.8 })
    expect(r.main).toContain('13 razy więcej niż w typowej gminie')
  })
  it('65,1% → dwie trzecie', () => {
    const r = humanScale({ ...base, value: 65.1, unit: '%', median: 30 })
    expect(r.main.toLowerCase()).toContain('dwie trzecie')
  })
  it('3. percentyl → niższy wynik ma 3% gmin', () => {
    const r = humanScale({ ...base, value: 7, unit: 'm²', percentile: 3 })
    expect(r.main).toBe('Niższy wynik ma 3% gmin w Polsce.')
  })
  it('kwoty zaokrąglone do 100 zł', () => {
    const r = humanScale({ ...base, value: 36049, unit: 'zł', median: 9000 })
    expect(r.main).toMatch(/Ok\. 36\s000 zł/)
    expect(r.main).toContain('razy więcej')
  })
  it('żadne zdanie nie przekracza 90 znaków ani nie łamie tonu', () => {
    const units = ['na 1000', 'na 10 tys.', '%', 'zł', 'm²']
    for (const unit of units)
      for (const value of [0, 3, 33.3, 65, 480, 9518, 36000])
        for (const median of [null, 0, 5, 20]) {
          const r = humanScale({ ...base, value, unit, median, percentile: 50, label: 'Z bibliotek publicznych korzysta' })
          expect(r.main.length).toBeLessThanOrEqual(90)
          expect(r.main).not.toMatch(BAD)
        }
  })
  it('odmiana liczebników', () => {
    const f: [string, string, string] = ['firma', 'firmy', 'firm']
    const got = [1, 2, 5, 12, 22, 25].map((n) => plural(n, f))
    expect(got).toEqual(['firma', 'firmy', 'firm', 'firm', 'firmy', 'firm'])
  })
  it('brak mediany lub wartość 0: bez porównania i bez wyjątku', () => {
    const a = humanScale({ ...base, value: 0, unit: 'na 1000', median: 0 })
    expect(a.reference).toBe('')
    expect(a.main).not.toContain('razy')
    const b = humanScale({ ...base, value: 5, unit: 'm²', median: null })
    expect(b.main).not.toContain('razy')
  })
})
