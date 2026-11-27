import { describe, expect, it } from 'vitest'
import { chooseNeighbour, compareWithNeighbour, profileFromShard, type NeighbourProfile } from '../../src/core/facts/neighbour-compare'
import { findViolations } from '../../src/core/facts/tone-guard'
import { valenceIds } from '../../src/core/facts/valence'
import type { PercentileShard } from '../../src/core/facts/percentile-types'

const ids = valenceIds()
const prof = (teryt: string, name: string, population: number | null, over: Record<string, number>): NeighbourProfile => ({
  teryt,
  name,
  population,
  pct: { ...Object.fromEntries(ids.map((i) => [i, 50])), ...over },
})

describe('W32-O05 na tle sąsiada', () => {
  // Maszewo wypada lepiej tylko w przyroście naturalnym (11 porównanych wskaźników z kierunkiem)
  const keep = ids.filter((i) => i !== 'unemployment-rate' && i !== 'avg-wage')
  const only = (p: NeighbourProfile): NeighbourProfile => ({ ...p, pct: Object.fromEntries(keep.map((i) => [i, p.pct[i]])) })
  const me = only(prof('3204033', 'Maszewo', 8468, { 'natural-increase': 80, 'regon-per-10k': 30, 'forest-cover': 20, 'preschool-3-6': 40 }))
  const gol = only(prof('3205011', 'Goleniów', 8000, { 'natural-increase': 60, 'regon-per-10k': 70, 'forest-cover': 70, 'preschool-3-6': 60 }))

  it('lepiej w 1 z 11, „Lepiej: przyrost naturalny”', () => {
    expect(keep).toContain('natural-increase')
    const c = compareWithNeighbour(me, gol)
    expect(c.total).toBe(11)
    expect(c.better).toEqual(['natural-increase'])
    expect(c.sentence).toBe('Na tle gminy Goleniów Maszewo wypada lepiej w 1 z 11 wskaźników.')
    expect(c.betterLine).toBe('Lepiej: przyrost naturalny.')
    expect(c.worseLine).toMatch(/^Gorzej: [^,]+, [^,]+, [^,]+\.$/)
    expect(c.worse.sort()).toEqual(['forest-cover', 'preschool-3-6', 'regon-per-10k'])
    expect(c.link).toBe('?u=3204033&c=3204033,3205011')
  })
  it('brak danych obniża mianownik, remis nie jest „lepiej”', () => {
    const noData: NeighbourProfile = { ...gol, pct: { ...gol.pct } }
    delete noData.pct['regon-per-10k']
    const c = compareWithNeighbour(me, noData)
    expect(c.total).toBe(10)
    const tie = compareWithNeighbour(me, { ...gol, pct: { ...me.pct } })
    expect(tie.better).toEqual([])
    expect(tie.total).toBe(11)
  })
  it('więcej niż 3 nazwy: reszta jako „i N innych”', () => {
    const w = compareWithNeighbour(me, { ...gol, pct: Object.fromEntries(keep.map((i) => [i, 99])) })
    expect(w.worseLine).toMatch(/^Gorzej: [^,]+, [^,]+, [^,]+ i 7 innych\.$/)
  })
  it('kierunek „niższy lepszy” odwraca porównanie (bezrobocie)', () => {
    const a = prof('1', 'A', 1, { 'unemployed-share-working-age': 20 })
    const b = prof('2', 'B', 1, { 'unemployed-share-working-age': 70 })
    expect(compareWithNeighbour(a, b).better).toContain('unemployed-share-working-age')
  })
  it('sąsiad o najbliższej liczbie ludności; remis → niższy TERYT', () => {
    const a = prof('3205011', 'A', 9000, {})
    const b = prof('3201011', 'B', 9000, {})
    const far = prof('3200000', 'C', 100000, {})
    const r = chooseNeighbour(me, [far, a, b])
    expect(r.main?.teryt).toBe('3201011')
    expect(r.others.map((o) => o.teryt)).toEqual(['3205011', '3200000'])
  })
  it('zdania nie łamią tonu; brak percentyli = null', () => {
    const c = compareWithNeighbour(me, gol)
    for (const t of [c.sentence, c.betterLine, c.worseLine]) expect(findViolations(t)).toEqual([])
    expect(profileFromShard({ ind: [], y: [], u: {} } as PercentileShard, '1', 'X')).toBeNull()
    expect(profileFromShard(undefined, '1', 'X')).toBeNull()
  })
})
