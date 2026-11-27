import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { pickRoles, reviewSample, type RolesFile } from '../../src/core/facts/roles'
import { findViolations } from '../../src/core/facts/tone-guard'
import type { PercentileShard } from '../../src/core/facts/percentile-types'

const file = JSON.parse(readFileSync('tests/fixtures/facts-roles/maszewo.json', 'utf8')) as RolesFile
const MASZEWO = '3204033'

describe('W32-O04 karty ról', () => {
  const cards = pickRoles(file, MASZEWO)
  it('Maszewo: nietypowe = czytelnictwo, mocna = przyrost naturalny, słabsza = powierzchnia mieszkania, zmiana = firmy', () => {
    expect(cards.map((c) => c.indicatorId)).toEqual([
      'library-readers-per-1000',
      'natural-increase',
      'dwelling-area-per-person',
      'regon-per-10k',
    ])
    expect(cards[0].main).toContain('1 na 31 mieszkańców')
    expect(cards[1].main).toContain('wyższa niż w 80% gmin')
    expect(cards[3].main).toContain('o 65% więcej niż w 2015 roku')
  })
  it('żaden wskaźnik nie występuje dwa razy', () => {
    const ids = cards.map((c) => c.indicatorId).filter(Boolean)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('brak mocnej strony daje kartę none z uczciwym komunikatem', () => {
    const f = structuredClone(file)
    const pct = f.pct as PercentileShard
    // wszystkie percentyle gminy ustawione na środek (50)
    pct.u[MASZEWO] = String.fromCharCode(0x100 + 50).repeat(pct.ind.length)
    const c = pickRoles(f, MASZEWO)
    expect(c.find((x) => x.role === 'strong')?.none).toBe(true)
    expect(c.find((x) => x.role === 'strong')?.main).toMatch(/^W żadnym z \d+ wskaźników gmina nie odstaje wyraźnie od środka stawki\.$/)
  })
  it('żaden tekst nie narusza słownika tonu', () => {
    for (const c of cards) for (const t of [c.main, c.reference, c.source]) expect(findViolations(t)).toEqual([])
    for (const s of reviewSample([file], 50)) for (const c of s.cards) expect(findViolations(c.main)).toEqual([])
  })
  it('zerowa mediana wskaźnika nie powoduje wyjątku', () => {
    const f = structuredClone(file)
    for (const d of Object.values(f.dist ?? {})) d.m = 0
    expect(() => pickRoles(f, MASZEWO)).not.toThrow()
  })
  it('gmina bez danych albo plik bez percentyli: pusta lista; próba jest deterministyczna', () => {
    expect(pickRoles({}, MASZEWO)).toEqual([])
    expect(pickRoles(file, '9999999')).toEqual([])
    expect(reviewSample([file], 5, 1)).toEqual(reviewSample([file], 5, 1))
  })
})
