import { describe, expect, it } from 'vitest'
import roles from '../../config/roles.json'
import indicators from '../../config/indicators.json'
import { isBetter, valenceOf } from '../../src/core/facts/valence'
import { findViolations } from '../../src/core/facts/tone-guard'

describe('W31-O03 kierunek wskaźników', () => {
  it('każdy id istnieje w indicators.json, a kierunek to up/down', () => {
    const ids = new Set((indicators as { id: string }[]).map((i) => i.id))
    for (const [id, dir] of Object.entries(roles.valence)) {
      expect(ids.has(id)).toBe(true)
      expect(['up', 'down']).toContain(dir)
    }
  })
  it('isBetter: bezrobocie (niższe lepsze) i wynagrodzenie (wyższe lepsze)', () => {
    expect(isBetter('unemployment-rate', 4, 6)).toBe(true)
    expect(isBetter('avg-wage', 4000, 6000)).toBe(false)
    expect(isBetter('avg-wage', 5000, 5000)).toBeNull()
  })
  it('wskaźnik bez kierunku zwraca null', () => {
    expect(valenceOf('population')).toBeNull()
    expect(isBetter('population', 1, 2)).toBeNull()
  })
})

describe('W31-O03 słownik tonu', () => {
  const bad: [string, string][] = [
    ['wzmacniacz', 'Tylko 1 na 31 mieszkańców.'],
    ['wzmacniacz', 'To zaledwie 3%.'],
    ['wzmacniacz', 'Niesamowite wyniki.'],
    ['clickbait', 'Gmina bez retuszu'],
    ['clickbait', 'Dziwne, ale prawdziwe'],
    ['mecz', 'Derby z sąsiadem'],
    ['mecz', 'Wygrywacie w 4 wskaźnikach'],
    ['druga-osoba', 'Wasza gmina'],
    ['wykrzyknik', 'Wynik!'],
    ['krzyzyk', '3,3× mniej'],
    ['emotikony', 'Wynik 🎉'],
    ['przynęta', 'Zgadniesz, ile?'],
    ['przynęta', 'Wiesz, że w gminie jest las?'],
    ['ocena-miejsca', 'To najgorsza gmina w kraju'],
  ]
  it.each(bad)('wyłapuje kategorię %s: %s', (cat, text) => {
    expect(findViolations(text).map((v) => v.category)).toContain(cat)
  })
  it('przepuszcza zdanie redakcyjne', () => {
    expect(findViolations('Z bibliotek publicznych korzysta 1 na 31 mieszkańców.')).toEqual([])
  })
})
